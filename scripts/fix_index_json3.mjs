import { readFileSync, writeFileSync } from 'fs';
const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

// Find the broken area: extra '"id": "board_madrasah_2026"'
// The fragment is: 
//   "id": "
// board_madrasah_2026"
// It needs to be: "id": "board_madrasah_2026"
const broken = `"id": "
board_madrasah_2026"`;
const fixed = `"id": "board_madrasah_2026"`;
raw = raw.replace(broken, fixed);
// Also fix the orphan '{' before it with extra whitespace
const extraOpen = '                        },\n                                                    {"id"';
const extraOpenFixed = '                        },\n                        {\n                            "id"';
raw = raw.replace(extraOpen, extraOpenFixed);

writeFileSync(path, raw, 'utf8');
console.log('Fixed. Verifying...');
try {
  JSON.parse(raw.replace(/^\uFEFF/, ''));
  console.log('JSON is now valid!');
} catch(e) {
  console.log('Still invalid: ' + e.message);
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const pos = parseInt(m[1]);
    console.log('Context:', raw.substring(Math.max(0, pos - 50), pos + 50));
  }
}
