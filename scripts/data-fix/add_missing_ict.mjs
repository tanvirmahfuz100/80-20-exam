import { readFileSync, writeFileSync } from 'fs';

const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

// Add file 51 (Barishal Board 2026) to ICT board_2026 after the Sylhet entry
// Find the last entry in the ICT board_2026 section: file 96 (sylhet)
const sylhetEntry = `"file": "/ssc/ict/96.json"
                        }
                    ]
                },`;
const board2026end = raw.indexOf(sylhetEntry);
if (board2026end >= 0) {
  const insertPoint = board2026end + sylhetEntry.indexOf('                    ]');
  const barishal = `                        },
                        {
                            "id": "board_barishal_2026",
                            "name": "Barishal Board 2026",
                            "name_bn": "বরিশাল বোর্ড ২০২৬",
                            "file": "/ssc/ict/51.json"
                        }`;
  raw = raw.substring(0, insertPoint) + barishal + '\n' + raw.substring(insertPoint);
  console.log('Added Barishal 2026');
}

// Add files 62 and 89 to ICT board_2018
const board2018Section = `                    "id": "board_2018",
                    "name": "Board Exams 2018",
                    "name_bn": "বোর্ড পরীক্ষা ২০১৮",
                    "name_en": "Board Exams 2018",
                    "chapters": [
                        {`;
const b2018idx = raw.indexOf(board2018Section);
if (b2018idx >= 0) {
  // Find the chapters array opening and insert after it
  const chaptersOpen = raw.indexOf('"chapters": [', b2018idx);
  const afterOpen = raw.indexOf('{', chaptersOpen);
  const existingEntry = raw.indexOf('"id": "', afterOpen);
  
  // We need to find where the ICT board_2018 section is (not accounting or bangla)
  // Let me search for /ssc/ict/ within board_2018 context
  const ict2018Context = raw.indexOf('/ssc/ict/62.json');
  if (ict2018Context < 0) {
    // Not found - board_2018 for ICT doesn't exist yet
    // Find the closing of the previous topic and insert before the next one
    const prevTopicEnd = raw.lastIndexOf('],', b2018idx);
    if (prevTopicEnd >= 0) {
      const afterPrev = prevTopicEnd + 2;
      const newSection = `,
                {
                    "id": "board_2018",
                    "name": "Board Exams 2018",
                    "name_bn": "বোর্ড পরীক্ষা ২০১৮",
                    "name_en": "Board Exams 2018",
                    "chapters": [
                        {
                            "id": "board_all_2018",
                            "name": "All Boards 2018 Combined",
                            "name_bn": "সকল বোর্ড ২০১৮",
                            "file": "/ssc/ict/89.json"
                        },
                        {
                            "id": "board_madrasah_2018",
                            "name": "Madrasah Board 2018",
                            "name_bn": "মাদ্রাসা বোর্ড ২০১৮",
                            "file": "/ssc/ict/62.json"
                        }
                    ]
                }`;
      raw = raw.substring(0, afterPrev) + newSection + raw.substring(afterPrev);
      console.log('Added board_2018 section for ICT');
    }
  }
}

writeFileSync(path, raw, 'utf8');
console.log('Written. Verifying...');
try {
  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
  console.log('JSON valid!');
  const ict = parsed.subjects.find(s => s.id === 'ict');
  if (ict) {
    let total = 0;
    ict.topics.forEach(t => {
      console.log('  ' + t.id + ': ' + t.chapters.length + ' chapters');
      total += t.chapters.length;
    });
    console.log('Total: ' + total);
    
    // Check file coverage
    const files = new Set();
    for (const t of ict.topics) {
      for (const c of t.chapters) {
        const m = c.file.match(/(\d+).json/);
        if (m) files.add(parseInt(m[1]));
      }
    }
    const missing = [];
    for (let i = 1; i <= 99; i++) {
      if (!files.has(i)) missing.push(i);
    }
    if (missing.length > 0) {
      console.log('Missing files: ' + missing.join(', '));
    } else {
      console.log('All 99 files present!');
    }
  }
} catch(e) {
  console.log('Invalid: ' + e.message);
}
