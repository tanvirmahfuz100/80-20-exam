const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/hsc/production_2nd/english/production_2nd_complete_en.json', 'utf8'));
console.log('Final Total Questions (EN):', data.length);
console.log('IDs with gaps:', data.filter((q, i) => i > 0 && q.id !== data[i-1].id + 1).map(q => q.id));
