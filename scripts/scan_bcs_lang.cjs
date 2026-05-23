const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('public/bcs').filter(f =>
  f.endsWith('.json') && !f.includes('answers') && !f.includes('_med')
);

files.forEach(file => {
  const qs = JSON.parse(fs.readFileSync(path.join('public/bcs', file), 'utf8'));
  if (!Array.isArray(qs)) return;
  let banglaQs = 0;
  let englishExp = 0;
  qs.forEach(q => {
    const hasB = /[\u0980-\u09FF]/.test(q.question);
    const expE = /^[ -~]+$/.test(q.explanation);
    if (hasB) banglaQs++;
    if (hasB && expE && !q.explanation.startsWith('\u26a0')) englishExp++;
  });
  if (englishExp > 0) {
    console.log(file + ': ' + englishExp + '/' + banglaQs + ' Bangla Qs need translation');
  }
});
