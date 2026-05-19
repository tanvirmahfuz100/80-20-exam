const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/hsc/production_2nd/english/production_2nd_complete_en.json', 'utf8'));
console.log('Total Questions:', data.length);
console.log('IDs:', data.map(q => q.id).join(', '));
