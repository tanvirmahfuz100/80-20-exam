const fs = require('fs');
const files = ['bcs_30.json','bcs_31.json','bcs_32.json','bcs_33.json','bcs_34.json'];
files.forEach(f => {
  const qs = JSON.parse(fs.readFileSync('public/bcs/' + f, 'utf8'));
  let count = 0;
  console.log('\n=== ' + f + ' ===');
  qs.forEach((q, i) => {
    const hasB = /[\u0980-\u09FF]/.test(q.question);
    const expE = /^[ -~]+$/.test(q.explanation);
    if (hasB && expE && !q.explanation.startsWith('\u26a0') && count < 5) {
      count++;
      console.log('Q' + q.id + ': ' + q.question.substring(0, 55));
      console.log('  EN: ' + q.explanation.substring(0, 70));
    }
  });
});
