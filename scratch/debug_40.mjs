import fs from 'fs';
import path from 'path';

async function fetchPage(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();
  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    || html.match(/<div[^>]*class="entry-content"[^>]*>([\s\S]*?)<\/div>/i)
    || html.match(/<div[^>]*class="post-content"[^>]*>([\s\S]*?)<\/div>/i);
  const content = article ? article[1] : html;
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

const url = 'https://bcsanalysis.com/40th-bcs-preli-question/';
const text = await fetchPage(url);

// Save for analysis
fs.writeFileSync(path.join(import.meta.dirname, '../public/bcs/bcs_40_raw_debug.txt'), text);
console.log('Saved raw text, length:', text.length);

// Normalize
let normalized = text.replace(/([^\n])(?=[০-৯\d]+[\.।]\s)/g, '$1\n');
const blocks = normalized.split(/\n(?=[০-৯\d]+[\.।])/);
console.log('Total blocks:', blocks.length);

// Find relevant blocks
const qBlocks = blocks.filter(b => b.match(/^[০-৯\d]+[\.।]\s/));
console.log('Question blocks:', qBlocks.length);

const ids = qBlocks.map(b => {
  const m = b.match(/^([০-৯\d]+)[\.।]\s/);
  return m ? parseInt(m[1].replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d))) : -1;
});
console.log('Question IDs:', ids.join(', '));
const minId = Math.min(...ids.filter(i => i > 0));
const maxId = Math.max(...ids.filter(i => i > 0));
console.log('Range:', minId, '-', maxId);

// Check for gap at 158
const start158 = normalized.indexOf('১৫৮।');
if (start158 >= 0) {
  console.log('\n--- Around 158 ---');
  console.log(normalized.substring(start158, start158 + 400));
}

// Check blocks around 157-158
for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  if (b.includes('১৫৭') || b.includes('১৫৮')) {
    console.log('\nBlock', i, '(contains 157/158):');
    const lines = b.split('\n').filter(l => l.trim());
    console.log('Lines:', lines.length);
    console.log('Content:', b.substring(0, 500));
  }
}
