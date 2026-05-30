const fs = require('fs');
const files = ['bcs_30.json','bcs_31.json','bcs_32.json','bcs_33.json','bcs_34.json'];
files.forEach(f => {
  const qs = JSON.parse(fs.readFileSync('public/bcs/' + f, 'utf8'));
  console.log('=== ' + f + ' ===');
  qs.forEach(q => {
    const hasB = /[\u0980-\u09FF]/.test(q.question);
    const expE = /^[ -~]+$/.test(q.explanation);
    if (hasB && expE && !q.explanation.startsWith('\u26a0')) {
      console.log('Q' + q.id + ': ' + q.explanation.substring(0, 90));
    }
  });
});
