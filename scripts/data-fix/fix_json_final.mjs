import { readFileSync, writeFileSync } from 'fs';
const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

// The orphaned fragment: lines starting with just '"id": "board_madrasah_2026",'
// up to the line '"                        }"' (closing the object)
// Remove lines 87-91 (0-indexed: 86-90)
const lines = raw.split('\n');
console.log('Total lines:', lines.length);
console.log('Lines 87-91:');
for (let i = 85; i < 93; i++) {
  console.log('  ' + (i+1) + ': ' + JSON.stringify(lines[i].substring(0, 80)));
}

// Remove the orphan part: line 87 to 91 (inclusive)
const orphanLines = lines.slice(86, 91);
console.log('\nOrphan lines to remove:');
orphanLines.forEach((l, i) => console.log('  ' + JSON.stringify(l)));

// Splice them out
lines.splice(86, 5);
raw = lines.join('\n');

writeFileSync(path, raw, 'utf8');
console.log('\nWritten. Verifying...');
try {
  JSON.parse(raw.replace(/^\uFEFF/, ''));
  console.log('JSON is valid!');
  const idx = JSON.parse(raw.replace(/^\uFEFF/, ''));
  const ict = idx.subjects.find(s => s.id === 'ict');
  if (ict) {
    ict.topics.forEach(t => {
      console.log('  ' + t.id + ': ' + t.chapters.length + ' chapters');
      t.chapters.forEach(c => {
        if (c.id.includes('madrasah')) console.log('    - ' + c.id + ': ' + c.file);
      });
    });
    const total = ict.topics.reduce((s, t) => s + t.chapters.length, 0);
    console.log('\nTotal ICT chapters:', total);
    console.log('Expected: 99 (100 files - 1 skipped)');
  }
} catch(e) {
  console.log('Invalid:', e.message);
}
