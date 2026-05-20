const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'docs', 'hsc', 'eco 1st');
const OUT_DIR = path.join(__dirname, '..', 'public', 'hsc', 'economics_1st');

function parseJsonOrThrow(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(text);
}

function parseBrokenJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const results = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          const obj = JSON.parse(text.slice(start, i + 1));
          results.push(obj);
        } catch (e) { /* skip broken objects */ }
        start = -1;
      }
    }
  }
  return results;
}

// Parse economics files
const ch1 = parseJsonOrThrow(path.join(RAW_DIR, 'ban chap 1.json'));
const ch23 = parseJsonOrThrow(path.join(RAW_DIR, 'eco chap 2-3.json'));
const ch4on = parseJsonOrThrow(path.join(RAW_DIR, 'ban chap 4- on.json'));
const broken = parseBrokenJson(path.join(RAW_DIR, 'ban eco question.json'));

const all = [...ch1, ...ch23, ...ch4on, ...broken];

// Group by chapter from source field
const chMap = {};
all.forEach(q => {
  const src = q.source || '';
  const m = src.match(/অধ্যায়-(\p{Nd}+)/u);
  const ch = m ? m[1] : 'unknown';
  if (!chMap[ch]) chMap[ch] = [];
  delete q.id;
  chMap[ch].push(q);
});

// Reassign sequential IDs within each chapter
Object.values(chMap).forEach(qs => {
  qs.forEach((q, i) => { q.id = i + 1; });
});

// Ensure output directory exists
const sorted = Object.entries(chMap).sort((a, b) => {
  if (a[0] === 'unknown') return 1;
  if (b[0] === 'unknown') return -1;
  return parseInt(a[0]) - parseInt(b[0]);
});

fs.mkdirSync(OUT_DIR, { recursive: true });

sorted.forEach(([ch, qs]) => {
  const filePath = path.join(OUT_DIR, `chapter_${ch}.json`);
  fs.writeFileSync(filePath, JSON.stringify(qs, null, 2), 'utf8');
  console.log(`Written chapter_${ch}.json (${qs.length} questions)`);
});

console.log(`\nTotal: ${all.length} questions across ${sorted.length} chapters`);
