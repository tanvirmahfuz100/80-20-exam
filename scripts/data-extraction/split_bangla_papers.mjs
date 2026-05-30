import { readFileSync, writeFileSync } from 'fs';

const indexPath = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(indexPath, 'utf8');
raw = raw.replace(/^\uFEFF/, '');
const idx = JSON.parse(raw);

const bangla = idx.subjects.find(s => s.id === 'bangla');
if (!bangla) { console.error('bangla subject not found'); process.exit(1); }

// 2nd paper file numbers
const secondPaperFiles = new Set([125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138]);

function isSecondPaper(filePath) {
  const match = filePath.match(/(\d+)\.json$/);
  if (!match) return false;
  const num = parseInt(match[1]);
  return secondPaperFiles.has(num);
}

// Clone a topic/chapter
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const bangla1st = {
  id: 'bangla_1st',
  name: 'Bangla 1st Paper',
  icon: 'BookOpen',
  name_en: 'Bangla 1st Paper',
  name_bn: 'বাংলা ১ম পত্র',
  topics: []
};

const bangla2nd = {
  id: 'bangla_2nd',
  name: 'Bangla 2nd Paper',
  icon: 'BookOpen',
  name_en: 'Bangla 2nd Paper',
  name_bn: 'বাংলা ২য় পত্র',
  topics: []
};

for (const topic of bangla.topics) {
  const firstChapters = topic.chapters.filter(ch => !isSecondPaper(ch.file));
  const secondChapters = topic.chapters.filter(ch => isSecondPaper(ch.file));

  if (firstChapters.length > 0) {
    bangla1st.topics.push({
      ...clone(topic),
      chapters: firstChapters
    });
  }
  if (secondChapters.length > 0) {
    bangla2nd.topics.push({
      ...clone(topic),
      chapters: secondChapters
    });
  }
}

// Replace bangla with bangla_1st and bangla_2nd in subjects array
const banglaIdx = idx.subjects.findIndex(s => s.id === 'bangla');
idx.subjects.splice(banglaIdx, 1, bangla1st, bangla2nd);

const output = JSON.stringify(idx, null, 4);
writeFileSync(indexPath, '\uFEFF' + output, 'utf8');
console.log('Done. Subjects now:');
for (const s of idx.subjects) {
  const count = s.topics.reduce((sum, t) => sum + t.chapters.length, 0);
  console.log(`  ${s.id} (${s.name_bn || s.name}): ${count} chapters`);
}
