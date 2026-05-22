const fs = require('fs');
const path = require('path');

const bnDigitMap = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};
function toAsciiDigits(s) {
  return s.replace(/[০-৯]/g, ch => bnDigitMap[ch] || ch);
}

function extractChapter(source) {
  const m = source?.match(/অধ্যায়-(\p{Nd}+)/u);
  if (!m) return null;
  return parseInt(toAsciiDigits(m[1]), 10);
}

// Load all Islamic studies questions
const srcDir = path.join(__dirname, 'docs', 'hsc', 'islamic studies');
const files = ['id 1-20.json', 'id 21-50.json', 'id 51-100.json', 'id 101-150.json'];
const all = [];
files.forEach(f => {
  all.push(...JSON.parse(fs.readFileSync(path.join(srcDir, f), 'utf8')));
});

// Group by chapter
const byCh = {};
all.forEach(q => {
  const ch = extractChapter(q.source);
  if (!byCh[ch]) byCh[ch] = [];
  byCh[ch].push(q);
});

// Create dist directory
const distDir = path.join(__dirname, 'dist', 'hsc', 'islamic_studies');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Write chapter files
Object.entries(byCh).sort((a, b) => a[0] - b[0]).forEach(([ch, questions]) => {
  // Re-number questions sequentially within each chapter
  questions.forEach((q, idx) => { q.id = idx + 1; });
  const filePath = path.join(distDir, `chapter_${ch}.json`);
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Written chapter_${ch}.json: ${questions.length} questions`);
});

// Read and update index.json
const indexPath = path.join(__dirname, 'dist', 'hsc', 'index.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

// Check if islamic_studies already exists
const existing = index.subjects.find(s => s.id === 'islamic_studies');
if (existing) {
  console.log('Islamic studies already in index.json, updating...');
  // Update existing entry
} else {
  const chapterTopics = Object.entries(byCh).sort((a, b) => a[0] - b[0]).map(([ch, questions]) => ({
    id: `chapter_${ch}`,
    name: `Chapter ${ch}`,
    chapters: [{
      id: `hsc_islam_ch${ch}`,
      name: `Chapter ${ch} Questions`,
      file_bn: `/hsc/islamic_studies/chapter_${ch}.json`
    }],
    name_bn: `অধ্যায় ${ch}`,
    name_en: `Chapter ${ch}`
  }));

  index.subjects.push({
    id: 'islamic_studies',
    name: 'Islamic Studies',
    icon: 'Book',
    topics: chapterTopics,
    name_bn: 'ইসলামের ইতিহাস ও সংস্কৃতি',
    name_en: 'Islamic History and Culture'
  });

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log('\nUpdated dist/hsc/index.json with Islamic Studies entry');
}

console.log('\nMigration complete!');
