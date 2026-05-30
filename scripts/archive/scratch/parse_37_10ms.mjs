import fs from 'fs';
import path from 'path';

function normalize(t) {
  return t
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&\w+;/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/[⁠​]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[–—\-]/g, '')
    .trim();
}

function matchAnswer(explanation, options) {
  const exp = normalize(explanation);
  
  // Check for explicit "সঠিক উত্তর:" / "উত্তর:" patterns
  const ansRe = /সঠিক উত্তর\s*[:ঃ]?\s*([^।\n]+)/;
  const m = exp.match(ansRe);
  if (m) {
    const ansText = normalize(m[1]);
    for (const [key, val] of Object.entries(options)) {
      const nv = normalize(val);
      if (nv && (ansText.includes(nv) || nv.includes(ansText))) {
        return key;
      }
    }
  }
  
  // Try matching by option text in explanation (longest match wins)
  let best = '';
  let bestKey = '';
  for (const [key, val] of Object.entries(options)) {
    if (!val) continue;
    const nv = normalize(val);
    if (nv.length < 2) continue;
    if (exp.includes(nv)) {
      if (nv.length > best.length) {
        best = nv;
        bestKey = key;
      }
    }
  }
  if (bestKey) return bestKey;
  
  // Try matching by option text with tighter normalization (remove all spaces)
  for (const [key, val] of Object.entries(options)) {
    if (!val) continue;
    const nv = normalize(val).replace(/\s+/g, '');
    const ne = exp.replace(/\s+/g, '');
    if (nv.length > 0 && ne.includes(nv)) {
      return key;
    }
  }
  
  // For Bengali numerals and short values: match against numbers in explanation
  const bengaliDigitRe = /[০-৯]+/g;
  for (const [key, val] of Object.entries(options)) {
    if (!val) continue;
    const nv = normalize(val).replace(/\s+/g, '');
    const digits = nv.match(bengaliDigitRe);
    if (digits && digits.length > 0) {
      const ne = exp.replace(/\s+/g, '');
      if (digits.every(d => ne.includes(d))) {
        return key;
      }
    }
  }
  
  // Try with individual word matching (more aggressive)
  for (const [key, val] of Object.entries(options)) {
    if (!val) continue;
    const nv = normalize(val);
    const words = nv.split(/[\s,]+/).filter(w => w.length > 1);
    if (words.length > 0) {
      const matchCount = words.filter(w => exp.includes(w)).length;
      if (matchCount >= Math.ceil(words.length * 0.5)) {
        return key;
      }
    }
  }
  
  // Try with individual character matching for short options
  for (const [key, val] of Object.entries(options)) {
    if (!val) continue;
    const nv = normalize(val);
    const chars = [...new Set(nv.replace(/\s/g, '').split(''))].filter(c => /[^\s\w\d]/.test(c) || /\w/.test(c));
    if (chars.length >= 3) {
      const matchCount = chars.filter(c => exp.includes(c)).length;
      if (matchCount >= Math.ceil(chars.length * 0.7)) {
        return key;
      }
    }
  }
  
  return '';
}

const outputDir = path.join(import.meta.dirname, '../public/bcs');
const rawPath = path.join(outputDir, 'bcs_37_raw_10ms.txt');
const text = fs.readFileSync(rawPath, 'utf-8')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s+/g, '\n')
  .replace(/\n{3,}/g, '\n\n');

const blocks = text.split(/\n(?=\d+[\.।]\s)/);

const questions = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 5) continue;
  
  const firstLine = lines[0];
  const qMatch = firstLine.match(/^(\d+)[\.।]\s*(.*)/);
  if (!qMatch) continue;
  
  const qNum = parseInt(qMatch[1]);
  let qText = qMatch[2].replace(/\s*\.\s*$/, '').trim();
  if (!qText || qNum < 1 || qNum > 200) continue;
  
  const expIdx = lines.findIndex(l => /^Explanation\s*[:ঃ]?\s*/i.test(l));
  if (expIdx < 0 || expIdx < 2) continue;
  
  const optLines = lines.slice(1, expIdx).filter(l => !/^Explanation/i.test(l));
  
  const opts = { A: '', B: '', C: '', D: '' };
  const optKeys = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < Math.min(4, optLines.length); i++) {
    let opt = optLines[i]
      .replace(/^[\(\（]\s*[কখগঘA-Da-d]\s*[\)）]\s*/, '')
      .replace(/^([কখগঘA-Da-d])[\.।\)）]\s*/, '')
      .replace(/^\)\s*/, '')
      .trim();
    opts[optKeys[i]] = opt;
  }
  
  const explanation = lines[expIdx].replace(/^Explanation\s*[:ঃ]?\s*/i, '').trim();
  
  const answer = matchAnswer(explanation, opts);
  
  if (qText && (opts.A || opts.B || opts.C || opts.D)) {
    questions.push({
      id: qNum,
      question: qText,
      options: opts,
      answer: answer,
      explanation: explanation
    });
  }
}

console.log(`Total: ${questions.length}`);

// Renumber
questions.forEach((q, i) => q.id = i + 1);

const withAns = questions.filter(q => q.answer).length;
console.log(`With answers: ${withAns}`);

const jsonPath = path.join(outputDir, 'bcs_37.json');
fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2));
console.log(`Saved`);

// Update index.json
const indexPath = path.join(outputDir, 'index.json');
if (fs.existsSync(indexPath)) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const existing = index.find(e => e.id === 'bcs_37');
  if (existing) {
    existing.questionCount = questions.length;
  } else {
    index.push({
      id: 'bcs_37',
      name: '37th BCS',
      code: '',
      questionCount: questions.length
    });
  }
  index.sort((a, b) => parseInt(b.id.replace(/\D/g, '')) - parseInt(a.id.replace(/\D/g, '')));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('Updated index.json');
}
