const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('public/bcs/bcs_43.json', 'utf8'));
let n = 0;
for (const q of qs) {
  if (!q.answer || q.answer.length > 1 || !/^[A-D]$/.test(q.answer)) {
    n++;
    console.log('Q' + q.id + ': answer=' + JSON.stringify(q.answer));
  }
}
console.log('Total non-standard: ' + n);

// Also check what answer keys say for these
console.log('\n--- Checking answer keys ---');
const ansKey = eval('(' + fs.readFileSync('public/bcs/answers/bcs-43-answers.js', 'utf8') + ')');
for (const q of qs) {
  if (q.answer === 'CANCELLED' || q.answer.includes('মুনাফা')) {
    const key = ansKey[q.id];
    if (key) console.log('Q' + q.id + ': current=' + JSON.stringify(q.answer) + ', key=' + JSON.stringify(key.answer));
  }
}
