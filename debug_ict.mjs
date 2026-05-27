import { readFileSync } from 'fs';
const html = readFileSync('D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\ssc-ict\\ঢাকা বোর্ড ২০২৬.html', 'utf8');

const startIdx = html.indexOf('<div class="w-full">');
if (startIdx >= 0) {
  let depth = 0;
  let end = startIdx;
  for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '<') {
      if (html.startsWith('</div>', i)) {
        if (depth === 0) { end = i + 6; break; }
        depth--;
        i += 5;
      } else if (html.startsWith('<div', i)) {
        depth++;
        i += 3;
      }
    }
  }
  const block = html.substring(startIdx, end);
  console.log('Block length:', block.length);
  console.log('Has w-full:', block.includes('w-full'));
  console.log('Has text-card-foreground:', block.includes('text-card-foreground'));
  console.log('Has grid:', block.includes('grid grid-cols-1 gap-2 md:grid-cols-2'));
  console.log('Has correct bg:', block.includes('bg-[#017A471A]'));

  process.exit(0);
}
console.log('No w-full block found');
