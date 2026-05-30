import { readFileSync, readdirSync } from 'fs';

const dir = 'D:/Tanvir Mahfuz/80-20-exam/docs/web/hsc-bangla-1st-paper';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));

// Look for a file with katex annotations and show them
for (const f of files) {
  const html = readFileSync(dir + '/' + f, 'utf8');
  const annots = [];
  let pos = 0;
  while ((pos = html.indexOf('<annotation encoding', pos)) !== -1) {
    const start = html.indexOf('>', pos) + 1;
    const end = html.indexOf('</annotation>', start);
    if (start < end) {
      const text = html.substring(start, end);
      annots.push(text);
    }
    pos = end + 1;
    if (annots.length >= 15) break;
  }
  if (annots.length > 0) {
    console.log(`File: ${f}`);
    console.log(`First ${annots.length} annotations:`);
    for (const a of annots) console.log(`  "${a}"`);
    break;
  }
}
