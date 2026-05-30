import { readFileSync, writeFileSync } from 'fs';

const path = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';
let raw = readFileSync(path, 'utf8');

const target = `মাদ্রাসা বোর্ড ২০২০"
                        }
                    ]
                },
                        {
                            "id": "board_madrasah_2018",`;

const idx = raw.indexOf(target);
if (idx >= 0) {
  const afterTarget = idx + target.length;

  // Find the next proper topic opening
  const nextTopic = raw.indexOf('\n                {\n', afterTarget);
  if (nextTopic >= 0) {
    raw = raw.substring(0, afterTarget - 8) + raw.substring(nextTopic);
    writeFileSync(path, raw, 'utf8');
    console.log('Orphan removed. Verifying JSON...');
    try {
      JSON.parse(raw.replace(/^\uFEFF/, ''));
      console.log('JSON is now valid!');
    } catch(e) {
      console.log('JSON still invalid:', e.message);
    }
  }
} else {
  console.log('Target not found. Checking file...');
  const orphanIdx = raw.indexOf('board_madrasah_2018');
  if (orphanIdx >= 0) {
    console.log('Context:', raw.substring(Math.max(0, orphanIdx - 150), orphanIdx + 200));
  } else {
    console.log('board_madrasah_2018 not found - already fixed?');
    try {
      JSON.parse(raw.replace(/^\uFEFF/, ''));
      console.log('JSON is already valid!');
    } catch(e) {
      console.log('JSON invalid:', e.message);
    }
  }
}
