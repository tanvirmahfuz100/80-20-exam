import { readFileSync, writeFileSync } from 'fs';

const indexJsonPath = 'D:/Tanvir Mahfuz/80-20-exam/public/hsc/index.json';
const entryPath = 'D:/Tanvir Mahfuz/80-20-exam/scripts/bangla_index_entry.json';

const index = JSON.parse(readFileSync(indexJsonPath, 'utf8'));
const entry = JSON.parse(readFileSync(entryPath, 'utf8'));

// Insert at the beginning
index.subjects.unshift(entry);

writeFileSync(indexJsonPath, JSON.stringify(index, null, 2), 'utf8');
console.log('Added bangla_1st to public/hsc/index.json');
console.log(`Total subjects: ${index.subjects.length}`);
