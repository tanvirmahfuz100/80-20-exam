const fs = require('fs');
const path = require('path');

const dir = 'public/hsc/production_2nd/english';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let total = 0;
files.forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    total += data.length;
});
console.log('Total English Questions:', total);
