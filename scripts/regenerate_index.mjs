import { readFileSync, writeFileSync } from 'fs';

const origPath = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index_original.json';
const indexPath = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\index.json';

// Try to load the original pre-split version from git / backup
// Since we don't have a backup, let me construct the base structure

// Read the current broken file and fix it programmatically
let raw = readFileSync(indexPath, 'utf8');

// Remove BOM if present
raw = raw.replace(/^\uFEFF/, '');

// Remove the orphaned fragment: everything from orphan start to before next valid topic
// The pattern is: after the valid board_madrasah_2026 closing `},`, there's an extra fragment
// Find: board_madrasah_2026 entries closing, then orphan
// Let me just parse out the bad sections by rebuilding the JSON structure

// Strategy: find the ict subject in the file and rewrite it properly
const idxIct = raw.indexOf('"id": "ict"');
if (idxIct >= 0) {
  // Find the start of ict subject object
  const ictStart = raw.lastIndexOf('{', idxIct);
  // Find the end of ict subject - find the closing of the subjects array item
  // Count braces from ictStart
  let depth = 0;
  let ictEnd = ictStart;
  for (let i = ictStart; i < raw.length; i++) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') {
      depth--;
      if (depth === 0) {
        ictEnd = i + 1;
        break;
      }
    }
  }

  // Extract the ict subject
  const ictRaw = raw.substring(ictStart, ictEnd);
  console.log('ICT object length:', ictRaw.length);

  // Parse the full JSON to find other subjects
  let rawBefore = raw.substring(0, ictStart);
  let rawAfter = raw.substring(ictEnd);

  // Find the subjects array start
  const subjectsStart = rawBefore.indexOf('"subjects": [');
  if (subjectsStart < 0) {
    console.log('ERROR: subjects array not found');
    process.exit(1);
  }

  // Parse subjects list (everything before ict)
  // The subjects array contains: english, ict, bangla_1st, bangla_2nd, accounting
  // We need to separate ict and rebuild without it, then add it back properly
  
  // Let me just try to fix the JSON by removing non-printable chars and fixing the broken fragment
  // The specific issue is around 'board_madrasah_2026' 
  
  // Find the extra '"id": "board_madrasah_2026"' that's orphaned
  // and merge it with the actual broken fragment
} else {
  console.log('ICT not found - trying to parse what we have');
}

// Alternative approach: just parse what we can, remove bad characters, and rebuild
try {
  // Remove any orphaned lines that contain incomplete JSON objects
  // Find lines with just '{' followed by '"id" without a matching '}'
  const lines = raw.split('\n');
  const cleaned = [];
  let skipNext = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    // Skip orphaned objects (a lone '{' that's followed by an incomplete line)
    if (skipNext) {
      skipNext = false;
      continue;
    }
    if (trimmed === '{' && i + 1 < lines.length) {
      const nextTrimmed = lines[i + 1].trim();
      if (nextTrimmed.startsWith('"id": "board_madrasa') && !nextTrimmed.endsWith('",')) {
        // Skip this orphan object
        skipNext = true;
        console.log('Skipping orphan at line', i + 1);
        continue;
      }
    }
    cleaned.push(line);
  }
  raw = cleaned.join('\n');

  writeFileSync(indexPath, '\uFEFF' + raw, 'utf8');
  
  try {
    JSON.parse(raw);
    console.log('JSON is now valid!');
  } catch(e) {
    console.log('Still invalid: ' + e.message);
    const m = e.message.match(/position (\d+)/);
    if (m) {
      const pos = parseInt(m[1]);
      console.log('Context:', JSON.stringify(raw.substring(Math.max(0, pos - 80), pos + 80)));
      // Show line number
      const lineStart = raw.lastIndexOf('\n', pos) + 1;
      const lineEnd = raw.indexOf('\n', pos);
      console.log('Line:', raw.substring(lineStart, lineEnd >= 0 ? lineEnd : undefined));
    }
  }
}
