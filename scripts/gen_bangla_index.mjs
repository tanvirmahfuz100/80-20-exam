import { readFileSync, writeFileSync } from 'fs';

const lines = readFileSync('D:/Tanvir Mahfuz/80-20-exam/public/hsc/bangla_1st/_mapping.txt', 'utf8').trim().split('\n');

const bnToEnYear = {
  '২০২০': '2020', '২০২১': '2021', '২০২২': '2022', '২০২৩': '2023',
  '২০২৪': '2024', '২০২৫': '2025', '২০২৬': '2026',
  '২০১৭': '2017', '২০১৮': '2018', '২০১৯': '2019',
};

function extractYearEn(source) {
  const bnYear = source.match(/[২০-৯]{4}/);
  if (bnYear && bnToEnYear[bnYear[0]]) return bnToEnYear[bnYear[0]];
  return null;
}

function extractYearBn(source) {
  const m = source.match(/([২০-৯]{4})/);
  return m ? m[1] : null;
}

function isBoard(source) {
  return source.includes('বোর্ড');
}

function isCadet(source) {
  return source.includes('ক্যাডেট');
}

const yearGroups = {};
for (const line of lines) {
  const [file, qty, source] = line.split('|');
  const yearEn = extractYearEn(source);
  if (!yearEn) continue;
  if (!yearGroups[yearEn]) yearGroups[yearEn] = [];
  yearGroups[yearEn].push({ file, qty: parseInt(qty), source });
}

// Sort years
const sortedYears = Object.keys(yearGroups).sort();

const subjectEntry = {
  id: 'bangla_1st',
  name: 'Bangla 1st Paper',
  icon: 'BookOpen',
  topics: sortedYears.map(year => {
    const entries = yearGroups[year];
    return {
      id: `year_${year}`,
      name: `${year}`,
      name_bn: `${entries[0].source.match(/([২০-৯]{4})/)[1]} সাল`,
      name_en: `${year}`,
      chapters: entries.map(e => ({
        id: `hsc_bangla1_${e.file.replace('.json', '')}`,
        name: e.source,
        name_bn: e.source,
        name_en: e.source,
        file: `/hsc/bangla_1st/${e.file}`,
      })),
    };
  }),
  name_bn: 'বাংলা ১ম পত্র',
  name_en: 'Bangla 1st Paper',
};

writeFileSync('D:/Tanvir Mahfuz/80-20-exam/scripts/bangla_index_entry.json', JSON.stringify(subjectEntry, null, 2), 'utf8');
console.log('Written to scripts/bangla_index_entry.json');
console.log(`Total topics (years): ${subjectEntry.topics.length}`);
console.log(`Total chapters: ${subjectEntry.topics.reduce((s,t) => s + t.chapters.length, 0)}`);
