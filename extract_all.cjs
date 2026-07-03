const fs = require('fs');
const path = require('path');

const inputFile = 'C:\\Users\\User\\OneDrive\\Documents\\Obsidian Vault\\80-20 exam\\website generated question.md';
const outputFile = 'C:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\public\\bcs\\bcs_bangladesh_affairs.json';

function tryParseRobust(raw) {
  // Direct parse
  try { return JSON.parse(raw); } catch {}
  // Remove trailing commas
  let cleaned = raw.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
  try { return JSON.parse(cleaned); } catch {}
  // Depth-based truncation: find the first point where depth=0 and try
  let depth = 0, inString = false, escaped = false;
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) { if (escaped) { escaped = false; continue; } if (ch === '\\') { escaped = true; continue; } if (ch === '"') inString = false; continue; }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') { depth++; continue; }
    if (ch === '}') {
      depth--;
      if (depth === 0 && i < cleaned.length - 1) {
        try {
          const parsed = JSON.parse(cleaned.substring(0, i + 1));
          if (parsed && (parsed.question || parsed.q)) return parsed;
        } catch {}
      }
    }
  }
  return null;
}

function extractQuestion(obj) {
  const question = obj.question || obj.q;
  if (!question) return null;

  const opts = obj.options || obj.opts;
  if (!opts) return null;

  const answer = obj.answer || obj.correct_answer || obj.ans;
  if (!answer) return null;

  let options = {};
  if (typeof opts === 'object' && !Array.isArray(opts)) {
    for (const k of ['A', 'B', 'C', 'D']) {
      options[k] = opts[k] !== undefined ? String(opts[k]).trim() : '';
    }
  } else if (Array.isArray(opts)) {
    const letters = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < Math.min(opts.length, 4); i++) {
      options[letters[i]] = String(opts[i]).trim();
    }
  }
  if (!options.A) return null;

  let explanation = '';
  if (obj.explanation) {
    if (typeof obj.explanation === 'string') explanation = obj.explanation;
    else if (obj.explanation.summary) explanation = obj.explanation.summary;
    else explanation = JSON.stringify(obj.explanation);
  } else if (obj.exp) {
    explanation = obj.exp;
  }
  if (explanation && explanation.length > 500) explanation = explanation.substring(0, 497) + '...';

  const topic = obj.topic || '';
  const source = obj.subject
    ? `${obj.subject}${topic ? ` (${topic})` : ''}`
    : (topic ? `Bangladesh Affairs (${topic})` : 'Bangladesh Affairs');

  return {
    id: 0,
    question,
    options,
    answer: answer.toUpperCase(),
    explanation,
    source,
  };
}

const text = fs.readFileSync(inputFile, 'utf-8');
const seen = new Set();
const questions = [];

// Custom block parser: find ```json positions, then find matching ```
// (allows 2 or 3 backticks as closing)
function extractBlocks(text) {
  const blocks = [];
  let pos = 0;
  while (true) {
    const openIdx = text.indexOf('```json', pos);
    if (openIdx === -1) break;
    const contentStart = openIdx + 7;

    // Scan character by character to find the block end
    // We need to find the CLOSING ``` (or ``) that properly ends this block.
    // Strategy: look for next ``` or `` and check if content between looks complete.
    let closeIdx = -1;
    let searchFrom = contentStart;
    while (true) {
      // Find next 2 or 3 backticks
      const idx2 = text.indexOf('``', searchFrom);
      const idx3 = text.indexOf('```', searchFrom);
      let nextMarkIdx;
      let markLen;
      if (idx2 === -1 && idx3 === -1) break;
      if (idx2 === -1) { nextMarkIdx = idx3; markLen = 3; }
      else if (idx3 === -1) { nextMarkIdx = idx2; markLen = 2; }
      else { nextMarkIdx = Math.min(idx2, idx3); markLen = (nextMarkIdx === idx2) ? 2 : 3; }

      const after = text.substring(nextMarkIdx + markLen).trimStart();

      // If followed by "json", this is a new opening — the search failed, move past this
      if (markLen === 3 && after.startsWith('json')) {
        searchFrom = nextMarkIdx + 3;
        continue;
      }

      // If it's only 2 backticks and followed by ```json, this stray `` IS the closing
      if (markLen === 2 && after.startsWith('```json')) {
        closeIdx = nextMarkIdx;
        break;
      }

      // Heuristic: check if content braces are balanced
      const content = text.substring(contentStart, nextMarkIdx).trim();
      if (content.startsWith('{') || content.startsWith('[')) {
        let depth = 0, inStr = false, esc = false;
        for (let i = 0; i < content.length; i++) {
          const ch = content[i];
          if (inStr) { if (esc) { esc = false; continue; } if (ch === '\\') { esc = true; continue; } if (ch === '"') inStr = false; continue; }
          if (ch === '"') { inStr = true; continue; }
          if (ch === '{' || ch === '[') depth++;
          if (ch === '}' || ch === ']') depth--;
        }
        if (depth <= 0) {
          closeIdx = nextMarkIdx;
          break;
        }
      } else {
        // Non-JSON content — skip
        searchFrom = nextMarkIdx + markLen;
        continue;
      }

      searchFrom = nextMarkIdx + markLen;
    }

    if (closeIdx === -1) break;
    blocks.push(text.substring(contentStart, closeIdx).trim());
    pos = closeIdx + (text.substring(closeIdx, closeIdx + 3) === '```' ? 3 : 2);
  }
  return blocks;
}

const blockContents = extractBlocks(text);

for (const raw of blockContents) {
  // Skip empty or clearly non-JSON content
  if (!raw) continue;
  if (!raw.startsWith('{') && !raw.startsWith('[')) continue;

  // === ARRAY BLOCKS ===
  if (raw.startsWith('[')) {
    let arr;
    try { arr = JSON.parse(raw); } catch {
      // Try repair on the whole array
      let cleaned = raw.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
      try { arr = JSON.parse(cleaned); } catch { continue; }
    }

    if (!Array.isArray(arr)) continue;

    for (const item of arr) {
      if (!item) continue;
      const qid = item.question_id || item.id;
      const qText = item.question || item.q;
      const dedupKey = qid || (qText || '').substring(0, 80);
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);

      const extracted = extractQuestion(item);
      if (extracted) {
        extracted.id = questions.length + 1;
        questions.push(extracted);
      }
    }
    continue;
  }

  // === SINGLE OBJECT BLOCKS ===
  const parsed = tryParseRobust(raw);
  if (!parsed) continue;

  const qid = parsed.question_id || parsed.id;
  const dedupKey = qid || (parsed.question || parsed.q || '').substring(0, 80);
  if (seen.has(dedupKey)) continue;
  seen.add(dedupKey);

  const extracted = extractQuestion(parsed);
  if (extracted) {
    extracted.id = questions.length + 1;
    questions.push(extracted);
  }
}

const dir = path.dirname(outputFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(questions, null, 2), 'utf-8');
console.log(`Extracted ${questions.length} questions`);

// Verify
let errs = 0;
for (const q of questions) {
  if (!q.id || !q.question || !q.options || !q.answer) { console.log('Missing field:', q.id); errs++; }
  if (!q.options.A || !q.options.B || !q.options.C || !q.options.D) { console.log('Missing option:', q.id); errs++; }
  if (!/^[A-D]$/.test(q.answer)) { console.log('Bad answer:', q.id, q.answer); errs++; }
}
console.log(`Validation errors: ${errs}`);

const byTopic = {};
questions.forEach(q => {
  const t = q.source || 'Unknown';
  byTopic[t] = (byTopic[t] || 0) + 1;
});
console.log('\nBy topic:');
Object.entries(byTopic).sort((a,b) => b[1]-a[1]).slice(0, 10).forEach(([t, c]) => console.log(`  ${c} - ${t}`));
