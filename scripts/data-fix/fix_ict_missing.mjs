import { readFileSync, writeFileSync } from 'fs';

const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

// === Fix 1: Remove corrupt barishal insertion (if any) ===
const corrupt = '                        }\n                        },\n                        {\n                            "id": "board_barishal_2026"';
if (raw.includes(corrupt)) {
  // Remove the barishal entry and the extra closing brace
  raw = raw.replace(corrupt, '                        }');
  console.log('Fixed corrupt barishal entry');
}

// === Fix 2: Add Barishal 2026 (file 51) to board_2026 ===
const pattern = '"/ssc/ict/68.json"\n                        }\n                    ]';
const replacement = '"/ssc/ict/68.json"\n                        },\n                        {\n                            "id": "board_barishal_2026",\n                            "name": "Barishal Board 2026",\n                            "name_bn": "বরিশাল বোর্ড ২০২৬",\n                            "file": "/ssc/ict/51.json"\n                        }\n                    ]';
if (raw.includes(pattern)) {
  raw = raw.replace(pattern, replacement);
  console.log('Added Barishal Board 2026 (file 51)');
}

// === Fix 3: Add board_2018 section for ICT (files 62, 89) ===
// Check if it already exists
const existing2018 = raw.indexOf('"board_2018"', raw.indexOf('"id": "ict"'));
const ictEndIdx = raw.indexOf('"id": "accounting"');
if (existing2018 < 0 || existing2018 > ictEndIdx) {
  // Need to add board_2018 to ICT topics
  // Find board_2017 (which is the last ICT topic) and insert before it
  const board2017 = raw.indexOf('"board_2017"', raw.indexOf('"id": "ict"'));
  if (board2017 >= 0 && (board2017 < ictEndIdx || ictEndIdx < 0)) {
    const objStart = raw.lastIndexOf('{', board2017);
    const newSection = `                {\n                    "id": "board_2018",\n                    "name": "Board Exams 2018",\n                    "name_bn": "বোর্ড পরীক্ষা ২০১৮",\n                    "name_en": "Board Exams 2018",\n                    "chapters": [\n                        {\n                            "id": "board_all_2018",\n                            "name": "All Boards 2018 Combined",\n                            "name_bn": "সকল বোর্ড ২০১৮",\n                            "file": "/ssc/ict/89.json"\n                        },\n                        {\n                            "id": "board_madrasah_2018",\n                            "name": "Madrasah Board 2018",\n                            "name_bn": "মাদ্রাসা বোর্ড ২০১৮",\n                            "file": "/ssc/ict/62.json"\n                        }\n                    ]\n                },\n`;
    raw = raw.substring(0, objStart) + newSection + raw.substring(objStart);
    console.log('Created ICT board_2018 section');
  }
}

writeFileSync(path, raw, 'utf8');
console.log('Written. Verifying...');
try {
  JSON.parse(raw.replace(/^\uFEFF/, ''));
  console.log('JSON valid!');
  const idx_parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
  const ict = idx_parsed.subjects.find(s => s.id === 'ict');
  if (ict) {
    let total = 0;
    ict.topics.forEach(t => {
      console.log('  ' + t.id + ': ' + t.chapters.length + ' chapters');
      total += t.chapters.length;
    });
    console.log('Total: ' + total);
    
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
      console.log('MISSING files: ' + missing.join(', '));
    } else {
      console.log('All 99 files present!');
    }
  }
} catch(e) {
  console.log('Invalid: ' + e.message);
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const pos = parseInt(m[1]);
    console.log('Context:', raw.substring(Math.max(0, pos - 60), pos + 60));
  }
}
