const fs = require('fs');
const path = require('path');

const BCS_DIR = path.join(__dirname, '..', 'public', 'bcs');
const ANSWERS_DIR = path.join(BCS_DIR, 'answers');
const RAW_DIR = path.join(__dirname, '..', 'scratch');

// === Load answer keys ===

function loadAnswerKey(filePath) {
  if (filePath.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const mod = { exports: {} };

  if (content.includes('module.exports')) {
    // Has CommonJS export: create sandboxed function
    const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', content);
    fn(mod, mod.exports, undefined, undefined, undefined);
    return mod.exports || {};
  }

  // Bare object literal: assign to module.exports
  const fn = new Function('module', 'exports', 'module.exports = (' + content + ')');
  fn(mod, mod.exports);
  return mod.exports || {};
}

function normalizeAnswerKey(obj) {
  // obj might be {1: "C", 2: "B"} or {1: {answer: "C", explanation: "..."}}
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      result[key] = { answer: val, explanation: '' };
    } else if (val && typeof val === 'object' && val.answer) {
      result[key] = { answer: val.answer, explanation: val.explanation || '' };
    }
  }
  return result;
}

const answerKeys = {};

// Map BCS file prefix → answer key file
const answerKeyMap = {
  'bcs_41': path.join(ANSWERS_DIR, 'bcs41_answers.js'),
  'bcs_42': path.join(ANSWERS_DIR, '42_bcs_answers.json'),
  'bcs_43': path.join(ANSWERS_DIR, 'bcs-43-answers.js'),
  'bcs_44': path.join(ANSWERS_DIR, 'bcs44_answers.js'),
  'bcs_45': path.join(ANSWERS_DIR, 'bcs45_answers.js'),
  'bcs_46': path.join(ANSWERS_DIR, '46-bcs-answers.js'),
  'bcs_47': path.join(ANSWERS_DIR, '47-bcs-questions.js'),
  'bcs_48_2': path.join(ANSWERS_DIR, 'bcs48_2_answers.js'),
  'bcs_49': path.join(ANSWERS_DIR, 'bcs49_answers.js'),
};

for (const [examKey, ansPath] of Object.entries(answerKeyMap)) {
  if (fs.existsSync(ansPath)) {
    try {
      const raw = loadAnswerKey(ansPath);
      answerKeys[examKey] = normalizeAnswerKey(raw);
      console.log(`  Loaded answer key: ${examKey} (${Object.keys(answerKeys[examKey]).length} entries)`);
    } catch (e) {
      console.error(`  FAILED to load ${ansPath}: ${e.message}`);
    }
  }
}

// === Parse raw text files ===

function parseRawText(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const questions = [];
  let current = null;

  for (const line of lines) {
    const qMatch = line.match(/^#### Question (\d+)\s*$/);
    if (qMatch) {
      if (current) questions.push(current);
      current = { id: parseInt(qMatch[1]), text: '', options: { A: '', B: '', C: '', D: '' }, optIdx: 0 };
      continue;
    }
    if (!current) continue;

    const optMatch = line.match(/^-\s*([A-D])(.+)$/);
    if (optMatch) {
      current.options[optMatch[1]] = optMatch[2].trim();
      continue;
    }

    // Accumulate question text (skip empty lines before options start)
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('#')) {
      if (current.text) current.text += ' ' + trimmed;
      else current.text = trimmed;
    }
  }
  if (current) questions.push(current);
  return questions;
}

const rawTexts = {};
const rawFiles = {
  'bcs_41': { file: 'raw_bcs_41.txt', offset: 0 },
  'bcs_42': { file: 'raw_bcs_42.txt', offset: 0 },
  'bcs_43': { file: 'raw_bcs_43.txt', offset: 0 },
  'bcs_44': { file: 'raw_bcs_44.txt', offset: 0 },
  'bcs_45': { file: 'raw_bcs_45.txt', offset: 0 },
  'bcs_46': { file: 'raw_bcs_46.txt', offset: -1 },  // raw QN = JSON ID + 1
  'bcs_48_1': { file: 'raw_bcs_48_1.txt', offset: -1 },
  'bcs_48_2': { file: 'raw_bcs_48_2.txt', offset: -1 },
  'bcs_49': { file: 'raw_bcs_49.txt', offset: -1 },
};

for (const [examKey, cfg] of Object.entries(rawFiles)) {
  const rawPath = path.join(RAW_DIR, cfg.file);
  if (fs.existsSync(rawPath)) {
    const parsed = parseRawText(rawPath);
    rawTexts[examKey] = { questions: parsed, offset: cfg.offset };
    console.log(`  Loaded raw text: ${cfg.file} (${parsed.length} questions, offset=${cfg.offset})`);
  }
}

// === Guess raw text ID from JSON ID ===

function getRawQuestion(rawData, jsonId) {
  const targetRawId = jsonId - rawData.offset;
  return rawData.questions.find(q => q.id === targetRawId);
}

// === Fix functions ===

function isStandardAnswer(ans) {
  return typeof ans === 'string' && /^[A-D]$/.test(ans);
}

function isQuestionTruncated(text) {
  const s = text.replace(/\s+/g, '').trim();
  if (!s || s.length < 10) return true;
  // Check for truncated math patterns
  if (/^হলে[,]?\s*$/.test(s) || /^এর\s*মা[ণন].*$/.test(s) || /^সংখ্যাটি[-—]/.test(s)) return true;
  if (s === 'এরমানকত?' || s === 'সংখ্যাটি-' || s === 'হলে=কত?' || s === 'হলে,এরমান-') return true;
  return false;
}

const isTruncated = (text) => isQuestionTruncated(text);

// === Main fix loop ===

let totalAnsFixed = 0;
let totalExpFixed = 0;
let totalQFixed = 0;
let totalOptFixed = 0;
let totalFilesChanged = 0;

const examFiles = fs.readdirSync(BCS_DIR).filter(f => f.match(/^bcs_\d+.*\.json$/) && f !== 'index.json');

for (const fileName of examFiles) {
  const examKey = fileName.replace('.json', '');
  const jsonPath = path.join(BCS_DIR, fileName);
  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const ansKey = answerKeys[examKey];
  const rawData = rawTexts[examKey];
  let fileChanged = false;

  for (const q of questions) {
    const id = q.id;

    // --- Fix 1: Answer from answer key ---
    const ansKeyEntry = ansKey ? ansKey[String(id)] : null;
    if (ansKeyEntry && ansKeyEntry.answer) {
      const keyAns = ansKeyEntry.answer;
      if (!isStandardAnswer(q.answer) || q.answer === '' || (isStandardAnswer(keyAns) && q.answer !== keyAns)) {
        if (q.answer !== keyAns) {
          // Only replace if current is non-standard OR both are standard but key is different
          if (!isStandardAnswer(q.answer) || q.answer === '' || q.answer === 'CANCELLED') {
            console.log(`  ${examKey} Q${id}: Fix answer "${q.answer}" → "${keyAns}"`);
            q.answer = keyAns;
            totalAnsFixed++;
            fileChanged = true;
          } else if (isStandardAnswer(keyAns) && q.answer !== keyAns) {
            // Both are standard but disagree. Only change if answer key seems authoritative.
            // For now, skip these to be safe.
          }
        }
      }

      // --- Fix 2: Explanation from answer key ---
      if (ansKeyEntry.explanation && (!q.explanation || q.explanation.trim() === '')) {
        q.explanation = ansKeyEntry.explanation;
        totalExpFixed++;
        fileChanged = true;
      }
    }

    // --- Fix 3: Truncated question text from raw text ---
    if (rawData && isTruncated(q.question)) {
      const rawQ = getRawQuestion(rawData, id);
      if (rawQ && rawQ.text && rawQ.text !== q.question) {
        const rawTextClean = rawQ.text.replace(/\s+/g, ' ').trim();
        if (rawTextClean.length > q.question.replace(/\s+/g,'').trim().length) {
          console.log(`  ${examKey} Q${id}: Fix truncated text`);
          console.log(`    OLD: "${q.question.substring(0, 70)}"`);
          console.log(`    NEW: "${rawTextClean.substring(0, 70)}"`);
          q.question = rawTextClean;
          totalQFixed++;
          fileChanged = true;
        }
      }
    }

    // --- Fix 4: Empty options from raw text ---
    if (rawData) {
      const rawQ = getRawQuestion(rawData, id);
      if (rawQ) {
        for (const opt of ['A', 'B', 'C', 'D']) {
          if ((!q.options[opt] || q.options[opt].trim() === '') && rawQ.options[opt]) {
            q.options[opt] = rawQ.options[opt];
            console.log(`  ${examKey} Q${id}: Fix empty option ${opt} → "${rawQ.options[opt]}"`);
            totalOptFixed++;
            fileChanged = true;
          }
        }
      }
    }
  }

  if (fileChanged) {
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf-8');
    console.log(`  → Saved ${fileName}\n`);
    totalFilesChanged++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Files changed: ${totalFilesChanged}`);
console.log(`Answers fixed: ${totalAnsFixed}`);
console.log(`Explanations filled: ${totalExpFixed}`);
console.log(`Truncated questions fixed: ${totalQFixed}`);
console.log(`Empty options filled: ${totalOptFixed}`);
