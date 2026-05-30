import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dir = 'D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\ssc-ict';
const files = readdirSync(dir).filter(f => f.endsWith('.html'));
console.log(`Total HTML files: ${files.length}`);

// Check one file for structure
const sample = join(dir, files[0]);
const c = readFileSync(sample, 'utf8');

const hasPaper = c.includes('পত্র');
const has1st = c.includes('১ম পত্র');
const has2nd = c.includes('২য় পত্র');

const h3m = c.match(/<h3[^>]*>([^<]+)<\/h3>/);
const h1m = c.match(/<h1[^>]*>([^<]+)<\/h1>/);

console.log(`\nSample: ${files[0]}`);
console.log(`H1: ${h1m ? h1m[1] : 'none'}`);
console.log(`H3: ${h3m ? h3m[1] : 'none'}`);
console.log(`1st paper: ${has1st}, 2nd paper: ${has2nd}, hasPaper: ${hasPaper}`);

// Check if it has the same chorcha structure
const hasCardForeground = c.includes('text-card-foreground');
const hasCorrectBtn = c.includes('bg-[#017A471A]');
const hasGrid = c.includes('grid grid-cols-1 gap-2 md:grid-cols-2');

console.log(`has text-card-foreground: ${hasCardForeground}`);
console.log(`has correct btn: ${hasCorrectBtn}`);
console.log(`has options grid: ${hasGrid}`);

// Count questions by text-card-foreground divs
const matches = c.match(/text-card-foreground/g);
console.log(`Question divs count: ${matches ? matches.length : 0}`);

// Check if it says "ICT" or other subject name
const ictIdx = c.indexOf('আইসিটি');
const ictIdx2 = c.indexOf('ICT');
console.log(`আইসিটি found at: ${ictIdx}, ICT found at: ${ictIdx2}`);

if (ictIdx >= 0) {
  console.log(`Context around আইসিটি: ${c.substring(Math.max(0, ictIdx-20), ictIdx+40)}`);
}
