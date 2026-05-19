const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..');

// Read a JS/JSON file and extract the object data
function parseAnswerFile(text) {
  const result = {};
  // Match: number : { answer : "letter" (or null), explanation : "text" }
  const entryRe = /(\d+)\s*:\s*\{\s*answer\s*:\s*(null|"[^"]*")\s*,\s*explanation\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
  let m;
  while ((m = entryRe.exec(text)) !== null) {
    const id = parseInt(m[1]);
    const ans = m[2] === 'null' ? null : m[2].replace(/"/g, '');
    const exp = m[3].replace(/\\(.)/g, '$1');
    result[id] = { answer: ans, explanation: exp };
  }
  return Object.keys(result).length > 0 ? result : null;
}

function readDataFile(filePath) {
  const absPath = path.join(__dirname, '../answers', filePath);
  if (!fs.existsSync(absPath)) return null;
  const text = fs.readFileSync(absPath, 'utf-8');
  // Try regex-based parser first (handles all formats)
  const parsed = parseAnswerFile(text);
  if (parsed) return parsed;
  // Fallback: try eval with brace matching
  let start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) { end = i; break; }
  }
  if (end === -1) return null;
  try {
    return eval('(' + text.substring(start, end + 1) + ')');
  } catch {
    return null;
  }
}

const explanationSources = {
  bcs_47: '47-bcs-questions.js',
  bcs_46: '46-bcs-answers.js',
  bcs_45: 'bcs45_answers.js',
  bcs_44: 'bcs44_answers.js',
  bcs_43: 'bcs-43-answers.js',
  bcs_42: '42_bcs_answers.json',
  bcs_41: 'bcs41_answers.js',
  bcs_49: 'bcs49_answers.js',
  bcs_48_2: 'bcs48_2_answers.js'
};

// Pure answer keys (no explanations available yet)
const answerOnlyKeys = {};

function getEntry(examKey, qId) {
  const expSource = explanationSources[examKey];
  if (expSource) {
    const data = readDataFile(expSource);
    if (data && data[qId] && data[qId].answer !== undefined) {
      return data[qId];
    }
  }
  const ansKey = answerOnlyKeys[examKey];
  if (ansKey && ansKey[qId] !== undefined) {
    return { answer: ansKey[qId], explanation: "" };
  }
  return null;
}

function run() {
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  let totalQ = 0;
  let ansFilled = 0;
  let expFilled = 0;

  for (const file of files) {
    const examKey = file.replace('.json', '');
    const filePath = path.join(outDir, file);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    let a = 0, e = 0;
    for (const q of questions) {
      const entry = getEntry(examKey, q.id);
      if (!entry) continue;
      const hadAnswer = q.answer && q.answer !== "";
      if (entry.answer !== null) {
        q.answer = entry.answer;
        if (!hadAnswer) a++;
      } else if (entry.answer === null) {
        q.answer = null;
      }
      if (entry.explanation) {
        q.explanation = entry.explanation;
        e++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
    totalQ += questions.length;
    ansFilled += a;
    expFilled += e;
    const eStr = e > 0 ? `, ${e} explanations` : '';
    console.log(`${examKey}: ${a}/${questions.length} answers filled${eStr}`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Answers filled: ${ansFilled}/${totalQ} (newly filled in this run)`);
  console.log(`Explanations added: ${expFilled}/${totalQ}`);
}

run();
