const fs = require('fs');
const files = ['bcs_37.json','bcs_41.json','bcs_44.json','bcs_45.json','bcs_48_1.json'];
files.forEach(f => {
  const qs = JSON.parse(fs.readFileSync('public/bcs/' + f, 'utf8'));
  console.log('=== ' + f + ' ===');
  qs.forEach((q, i) => {
    const hasB = /[\u0980-\u09FF]/.test(q.question);
    const expE = /^[ -~]+$/.test(q.explanation);
    if (hasB && expE && !q.explanation.startsWith('\u26a0')) {
      console.log('Q' + q.id + ': ' + q.question.substring(0, 60));
      console.log('  EN exp: ' + q.explanation.substring(0, 80));
    }
  });
});
