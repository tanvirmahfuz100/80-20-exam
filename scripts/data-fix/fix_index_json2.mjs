import { readFileSync, writeFileSync } from 'fs';
const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

const fragment = '                        {\n                            "id": "board_madrasa';
const idx = raw.indexOf(fragment);
if (idx >= 0) {
  const beforeBrace = raw.lastIndexOf('{', idx);
  const eol = raw.indexOf('\n', idx);
  console.log('Fragment: ' + JSON.stringify(raw.substring(beforeBrace, eol)));
  raw = raw.substring(0, beforeBrace) + raw.substring(eol + 1);
  writeFileSync(path, raw, 'utf8');
  try {
    JSON.parse(raw.replace(/^\uFEFF/, ''));
    console.log('JSON is now valid!');
  } catch(e) {
    console.log('Still invalid: ' + e.message);
  }
} else {
  console.log('Fragment not found');
  // check for any other invalid
  try {
    JSON.parse(raw.replace(/^\uFEFF/, ''));
    console.log('JSON is already valid!');
  } catch(e) {
    console.log('Error: ' + e.message);
  }
}
