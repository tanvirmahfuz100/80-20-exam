const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '..', 'public', 'bcs', 'index.json');
const BCS_DIR = path.join(__dirname, '..', 'public', 'bcs');

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));

// Generate entries for BCS 10-27
function ordinal(n) {
  if (n === 10) return '10th';
  if (n === 11) return '11th';
  if (n === 12) return '12th';
  if (n === 13) return '13th';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const newEntries = [];
for (let n = 10; n <= 27; n++) {
  const filePath = path.join(BCS_DIR, `bcs_${n}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    newEntries.push({
      id: `bcs_${n}`,
      name: `${ordinal(n)} BCS`,
      code: '',
      questionCount: data.length
    });
  }
}

// Prepend new entries before existing ones
index.unshift(...newEntries);

fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
console.log(`Added ${newEntries.length} entries. Total: ${index.length}`);
