import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { fileURLToPath } from 'url';

const pdfPath = process.argv[2];
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjsLib.getDocument({ data }).promise;
let text = '';
for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(' ') + '\n';
}
fs.writeFileSync('./output2.txt', text);
console.log('Done');
