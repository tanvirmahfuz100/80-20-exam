const fs = require('fs');
const path = require('path');

const dir = 'public/hsc/finance_2nd';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0]);
    const nb = parseInt(b.match(/\d+/)[0]);
    return na - nb;
});

let total = 0;
files.forEach(f => {
    const content = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    console.log(`${f}: ${content.length} questions`);
    total += content.length;
});
console.log(`Total: ${total}`);
