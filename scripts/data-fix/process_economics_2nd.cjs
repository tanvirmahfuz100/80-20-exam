const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'docs', 'hsc', 'eco 2nd');
const OUT_DIR = path.join(__dirname, '..', 'public', 'hsc', 'economics_2nd');

const all = [];
const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'));
files.forEach(f => {
  const fp = path.join(RAW_DIR, f);
  try {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    all.push(...data);
  } catch (e) {
    console.error(`Error parsing ${f}: ${e.message}`);
  }
});

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

const bnDigitMap = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
const toAsciiDigit = (s) => [...s].map(c => bnDigitMap[c] || c).join('');

const sorted = Object.entries(chMap).sort((a, b) => {
  if (a[0] === 'unknown') return 1;
  if (b[0] === 'unknown') return -1;
  return parseInt(toAsciiDigit(a[0])) - parseInt(toAsciiDigit(b[0]));
});

fs.mkdirSync(OUT_DIR, { recursive: true });

sorted.forEach(([ch, qs]) => {
  const asciiCh = toAsciiDigit(ch);
  const filePath = path.join(OUT_DIR, `chapter_${asciiCh}.json`);
  fs.writeFileSync(filePath, JSON.stringify(qs, null, 2), 'utf8');
  console.log(`Written chapter_${asciiCh}.json (${qs.length} questions)`);
});

console.log(`\nTotal: ${all.length} questions across ${sorted.length} chapters`);
