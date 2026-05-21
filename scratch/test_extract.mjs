import fs from 'fs';
import * as pdfjsLib from '../node_modules/pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2];
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjsLib.getDocument({ data }).promise;
let text = '';
for (let i = 1; i <= Math.min(doc.numPages, 3); i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const strings = content.items.map(item => item.str);
  text += `--- Page ${i} ---\n` + strings.join(' ') + '\n';
}
console.log(text);
