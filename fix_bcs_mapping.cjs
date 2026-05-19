const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'bcs');

// --- Answer key parsing (from merge_bcs_answers.cjs) ---
function parseAnswerFile(text) {
  const result = {};
  const entryRe = /(\d+)\s*:\s*\{\s*answer\s*:\s*(null|"[^"]*")\s*,\s*explanation\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
  let m;
  while ((m = entryRe.exec(text)) !== null) {
    const id = parseInt(m[1]);
    const ans = m[2] === 'null' ? null : m[2].replace(/"/g, '');
    const exp = m[3].replace(/\\(.)/g, '$1');
    result[id] = { answer: ans, explanation: exp };
  }
  if (Object.keys(result).length > 0) return result;

  // Fallback: try eval with brace matching for JS-object files
  let start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0, end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) { end = i; break; }
  }
  if (end === -1) return null;
  try {
    const parsed = eval('(' + text.substring(start, end + 1) + ')');
    // Normalise: answer-only => { answer, explanation: '' }
    for (const k of Object.keys(parsed)) {
      if (typeof parsed[k] === 'string') parsed[k] = { answer: parsed[k], explanation: '' };
    }
    return parsed;
  } catch {
    return null;
  }
}

function loadAnswerKey(fileName) {
  const absPath = path.join(__dirname, fileName);
  if (!fs.existsSync(absPath)) return {};
  const text = fs.readFileSync(absPath, 'utf-8');
  const parsed = parseAnswerFile(text);
  return parsed || {};
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

// --- Text normalisation (handles Bengali Unicode variants) ---
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    // Use Unicode NFC normalisation to handle composed/ decomposed Bengali chars
    // e.g. য + NUKTA (্য) → য় (U+09DF)
    .normalize('NFC')
    // Remove hasant/virama for simpler matching
    .replace(/\u09CD/g, '');
}

const PUNCT_RE = /[.,;:!?()'"\/\[\]{}।॥,;:!?()'"\/\[\]{}"'\-\u2013\u2014–—]/g;

function getWords(text) {
  if (!text) return [];
  return text.replace(PUNCT_RE, ' ').split(/\s+/).filter(w => w.length > 0);
}

function getKeywords(text) {
  return new Set(getWords(text));
}

function matchQuestionToAnswerKey(q, answerKey) {
  // Build normalised search strings
  const searchParts = [q.question, q.options.A, q.options.B, q.options.C, q.options.D]
    .filter(Boolean);
  const searchText = normalizeText(searchParts.join(' '));
  const searchWords = getKeywords(searchText);
  
  // Normalised option values for exact matching
  const optionValues = [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean);
  const normOptions = optionValues.map(o => normalizeText(o));

  let bestId = null;
  let bestScore = 0;
  let bestEntry = null;

  for (const [id, entry] of Object.entries(answerKey)) {
    if (!entry.explanation) continue;

    const exp = entry.explanation;
    const normExp = normalizeText(exp);

    // Score 1: shared words between question+options text and explanation
    const wordOverlap = [...searchWords].filter(w => normExp.includes(w)).length;

    // Score 2: does any full option text appear in the explanation?
    let fullOptionMatch = 0;
    for (const nOpt of normOptions) {
      if (normExp.includes(nOpt)) {
        fullOptionMatch = 5;
        break;
      }
    }

    // Total score: word overlap + strong bonus for exact option text match
    const totalScore = wordOverlap + fullOptionMatch * 3;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestId = id;
      bestEntry = entry;
    }
  }

  return { bestId, bestScore, bestEntry };
}

// --- Main fix ---
function run() {
  const report = {};
  let totalFixed = 0;
  let totalUnmatched = 0;
  let totalPreserved = 0;

  const bcsFiles = fs.readdirSync(outDir).filter(f => f.endsWith('.json') && f !== 'index.json');

  for (const file of bcsFiles) {
    const examKey = file.replace('.json', '');
    const filePath = path.join(outDir, file);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const answerKeySource = explanationSources[examKey];
    const answerKey = answerKeySource ? loadAnswerKey(answerKeySource) : {};
    const keyCount = Object.keys(answerKey).length;

    if (examKey === 'bcs_47') {
      // Renumber IDs only; preserve existing answers/explanations
      for (let qi = 0; qi < questions.length; qi++) {
        questions[qi].id = qi + 1;
      }
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
      console.log(`${examKey}: ✅ IDs re-sequenced, answers preserved`);
      report[examKey] = { status: 'preserved_renumbered', questions: questions.length };
      totalPreserved += questions.length;
      continue;
    }

    if (keyCount === 0) {
      // No answer key available — clear fields and renumber
      let cleared = 0;
      for (const q of questions) {
        if (q.answer || q.explanation) {
          q.answer = '';
          q.explanation = '';
          cleared++;
        }
      }
      // Renumber IDs sequentially
      for (let qi = 0; qi < questions.length; qi++) {
        questions[qi].id = qi + 1;
      }
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');
      console.log(`${examKey}: ✅ Cleared ${cleared} answers (no answer key available)`);
      report[examKey] = { status: 'cleared', questions: questions.length, cleared };
      totalUnmatched += questions.length;
      continue;
    }

    // Build list of (question, score, answerKeyId, answerKeyEntry)
    const candidates = [];
    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      const { bestId, bestScore, bestEntry } = matchQuestionToAnswerKey(q, answerKey);
      if (bestEntry && bestScore >= 3) {
        candidates.push({ qi, id: bestId, score: bestScore, entry: bestEntry });
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Greedy assignment: each answer key entry used at most once
    const assignedQuestions = new Set();
    const assignedKeys = new Set();
    const matches = [];

    for (const c of candidates) {
      if (assignedQuestions.has(c.qi)) continue;
      if (assignedKeys.has(c.id)) {
        // Entry already matched to a better question
        // But check if this question's score is higher — shouldn't happen with greedy sort
        continue;
      }
      assignedQuestions.add(c.qi);
      assignedKeys.add(c.id);
      matches.push(c);
    }

    // Apply matches
    let matched = 0;
    const unmatchedItems = [];

    for (const m of matches) {
      const q = questions[m.qi];
      q.answer = m.entry.answer;
      q.explanation = m.entry.explanation;
      matched++;
    }

    // Clear unmatched, flag for review
    for (let qi = 0; qi < questions.length; qi++) {
      if (!assignedQuestions.has(qi)) {
        const q = questions[qi];
        q.answer = '';
        q.explanation = '';
        unmatchedItems.push({ id: q.id, question: q.question.substring(0, 80) });
      }
    }

    // --- Step 2: Fix missing IDs (re-number sequentially) ---
    const idChanges = {};
    for (let qi = 0; qi < questions.length; qi++) {
      const oldId = questions[qi].id;
      const newId = qi + 1;
      if (oldId !== newId) {
        idChanges[oldId] = newId;
        questions[qi].id = newId;
      }
    }

    // --- Step 3: Fix structural issues ---
    for (const q of questions) {
      // Clear '??' placeholders in options
      for (const key of ['A', 'B', 'C', 'D']) {
        if (q.options[key] && /^\?+\s*$/.test(q.options[key])) {
          q.options[key] = '';
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf-8');

    if (Object.keys(idChanges).length > 0) {
      const changesStr = Object.entries(idChanges).map(([o, n]) => `${o}→${n}`).join(', ');
      console.log(`      IDs changed: ${changesStr}`);
    }

    totalFixed += matched;
    totalUnmatched += unmatchedItems.length;

    console.log(`${examKey}: ✅ ${matched} matched, ${unmatchedItems.length} unmatched (answer key: ${keyCount} entries)`);
    report[examKey] = {
      status: 'fixed',
      questions: questions.length,
      matched,
      unmatched: unmatchedItems.length,
      answerKeyEntries: keyCount,
      unmatchedQuestions: unmatchedItems
    };
  }

  // Summary
  console.log(`\n=== FIX SUMMARY ===`);
  console.log(`Total matched/fixed: ${totalFixed}`);
  console.log(`Total unmatched (cleared): ${totalUnmatched}`);
  console.log(`Total preserved (bcs_47): ${totalPreserved}`);

  // Write report
  const reportPath = path.join(__dirname, 'fix_bcs_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nReport written to: ${reportPath}`);
}

run();
