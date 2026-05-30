import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

function htmlDecode(text) {
  return text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/').replace(/&nbsp;/g, ' ');
}

function getAnswerFromBlock(block) {
  const bnMap = { '\u0995': 'A', '\u0996': 'B', '\u0997': 'C', '\u0998': 'D' };

  // Priority 1: green marker
  let m = block.match(/<button[^>]*bg-\[#017A471A\][^>]*>[\s\S]*?<\/button>/);
  if (m) {
    const lm = m[0].match(/([ক-ঘ])/);
    if (lm) return bnMap[lm[1]];
  }

  // Priority 2: yellow marker
  m = block.match(/<button[^>]*bg-\[#F59E0B1F\][^>]*>[\s\S]*?<\/button>/);
  if (m) {
    const lm = m[0].match(/([ক-ঘ])/);
    if (lm) return bnMap[lm[1]];
  }

  // Priority 3: text fallback
  m = block.match(/সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])/);
  if (m) return bnMap[m[1]];
  m = block.match(/সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?([ক-ঘ])/);
  if (m) return bnMap[m[1]];

  return null;
}

function extractQuestions(html) {
  const questions = [];

  const blockRegex = /<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5[^"]*">/g;
  let match;
  const blocks = [];

  while ((match = blockRegex.exec(html)) !== null) {
    const start = match.index;
    let depth = 0, end = start, found = false;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '<') {
        if (html.startsWith('</div>', i)) {
          if (depth === 0) { end = i + 6; found = true; break; }
          depth--;
          i += 5;
        } else if (html.startsWith('<div', i)) {
          depth++;
          i += 3;
        }
      }
    }
    if (found) blocks.push(html.substring(start, end));
  }

  if (blocks.length === 0) {
    const qRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">/g;
    while ((match = qRegex.exec(html)) !== null) {
      const start = match.index;
      const parentStart = html.lastIndexOf('<div class="w-full">', start);
      if (parentStart >= 0) {
        let depth = 0, end = parentStart, found = false;
        for (let i = parentStart; i < html.length; i++) {
          if (html[i] === '<') {
            if (html.startsWith('</div>', i)) {
              if (depth === 0) { end = i + 6; found = true; break; }
              depth--;
              i += 5;
            } else if (html.startsWith('<div', i)) {
              depth++;
              i += 3;
            }
          }
        }
        if (found) {
          const blockStr = html.substring(parentStart, end);
          if (!blocks.some(b => b.includes(blockStr.substring(0, 100)))) {
            blocks.push(blockStr);
          }
        }
      }
    }
  }

  for (const block of blocks) {
    // Extract question text
    const qDivRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/;
    const qMatch = block.match(qDivRegex);
    if (!qMatch) continue;

    let questionText = qMatch[1];
    const parts = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pm;
    while ((pm = pRegex.exec(questionText)) !== null) {
      parts.push(htmlDecode(pm[1].replace(/<[^>]*>/g, '').trim()));
    }
    questionText = parts.join(' ').replace(/\s+/g, ' ').trim();
    questionText = questionText.replace(/^\d+\.\s*/, '').trim();
    if (!questionText) continue;

    // Extract options from first grid
    const options = {};
    const optionKeys = ['A', 'B', 'C', 'D'];
    const gridMatch = block.match(/<div class="grid grid-cols-1 gap-2 md:grid-cols-2\s*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    if (!gridMatch) continue;

    const gridContent = gridMatch[1];
    const btnRegex = /<button[\s\S]*?<\/button>/g;
    let btnMatch;
    let optIdx = 0;
    while ((btnMatch = btnRegex.exec(gridContent)) !== null && optIdx < 4) {
      const pContents = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let pm;
      while ((pm = pRegex.exec(btnMatch[0])) !== null) {
        const txt = htmlDecode(pm[1].replace(/<[^>]*>/g, '').trim());
        if (txt) pContents.push(txt);
      }
      const optText = pContents.length > 0 ? pContents[pContents.length - 1] : '';
      if (optText) options[optionKeys[optIdx]] = optText;
      optIdx++;
    }

    if (Object.keys(options).length < 2) continue;

    // Extract answer
    const correctAnswer = getAnswerFromBlock(block);
    if (!correctAnswer) continue;

    questions.push({
      question: questionText,
      options,
      answer: correctAnswer,
    });
  }

  return questions;
}

function normalize(str) {
  return str.replace(/\s+/g, ' ').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
}

const subjects = [
  { name: 'general_science', htmlDir: 'D:/Tanvir Mahfuz/80-20-exam/docs/web/ssc-general-science', jsonDir: 'D:/Tanvir Mahfuz/80-20-exam/public/ssc/general_science' },
  { name: 'agriculture', htmlDir: 'D:/Tanvir Mahfuz/80-20-exam/docs/web/ssc-agricultural', jsonDir: 'D:/Tanvir Mahfuz/80-20-exam/public/ssc/agriculture' },
  { name: 'islam', htmlDir: 'D:/Tanvir Mahfuz/80-20-exam/docs/web/ssc-islam', jsonDir: 'D:/Tanvir Mahfuz/80-20-exam/public/ssc/islam' },
  { name: 'math', htmlDir: 'D:/Tanvir Mahfuz/80-20-exam/docs/web/ssc-general-math', jsonDir: 'D:/Tanvir Mahfuz/80-20-exam/public/ssc/math' },
];

const resultLines = [];

for (const subject of subjects) {
  console.log(`\n========== ${subject.name.toUpperCase()} ==========`);
  resultLines.push(`\n========== ${subject.name.toUpperCase()} ==========`);

  const mappingPath = join(subject.jsonDir, '_mapping.txt');
  let mapping = [];
  try {
    const lines = readFileSync(mappingPath, 'utf8').trim().split('\n');
    mapping = lines.map(l => {
      const [file, count, ...srcParts] = l.split('|');
      return { jsonFile: file, count: parseInt(count), source: srcParts.join('|') };
    });
  } catch {
    console.log('  No mapping file');
    resultLines.push('  No mapping file');
    continue;
  }

  const htmlFiles = readdirSync(subject.htmlDir)
    .filter(f => f.endsWith('.html'))
    .sort((a, b) => a.localeCompare(b, 'bn'));

  let totalExtracted = 0;
  let totalJson = 0;
  let totalMismatches = 0;
  let totalTextDiffs = 0;
  let totalOptDiffs = 0;
  let countDiffFiles = 0;
  let fullMatchFiles = 0;
  let skippedExtractions = 0;

  for (let i = 0; i < mapping.length; i++) {
    const m = mapping[i];
    const htmlFile = htmlFiles[i];
    if (!htmlFile) continue;

    const html = readFileSync(join(subject.htmlDir, htmlFile), 'utf8');
    const extracted = extractQuestions(html);
    totalExtracted += extracted.length;

    const jsonData = JSON.parse(readFileSync(join(subject.jsonDir, m.jsonFile), 'utf8'));
    totalJson += jsonData.length;

    if (extracted.length === 0) {
      skippedExtractions++;
    }

    const minLen = Math.min(extracted.length, jsonData.length);
    let fileHasDiff = false;

    for (let q = 0; q < minLen; q++) {
      const e = extracted[q];
      const j = jsonData[q];

      if (e.answer !== j.answer) {
        totalMismatches++;
        fileHasDiff = true;
        const line = `  ${htmlFile}[q${q}]: Re-extracted="${e.answer}" JSON="${j.answer}" — ${j.question.substring(0, 60)}`;
        console.log(line);
        resultLines.push(line);
      }

      if (normalize(e.question) !== normalize(j.question)) {
        totalTextDiffs++;
        fileHasDiff = true;
        if (totalTextDiffs <= 5) {
          const line = `  TEXT DIFF: ${htmlFile}[q${q}]`;
          console.log(line);
          resultLines.push(line);
          console.log(`    Re-extracted: "${e.question.substring(0, 60)}"`);
          console.log(`    JSON:         "${j.question.substring(0, 60)}"`);
        }
      }

      if (JSON.stringify(e.options) !== JSON.stringify(j.options)) {
        totalOptDiffs++;
        fileHasDiff = true;
        if (totalOptDiffs <= 5) {
          const line = `  OPT DIFF: ${htmlFile}[q${q}]`;
          console.log(line);
          resultLines.push(line);
          console.log(`    Re-extracted: ${JSON.stringify(e.options)}`);
          console.log(`    JSON:         ${JSON.stringify(j.options)}`);
        }
      }
    }

    if (fileHasDiff) countDiffFiles++;
    else if (extracted.length === jsonData.length) fullMatchFiles++;
  }

  const summary = `  Extracted: ${totalExtracted} | JSON: ${totalJson} | Full-match files: ${fullMatchFiles} | Answer mismatches: ${totalMismatches} | Text diffs: ${totalTextDiffs} | Option diffs: ${totalOptDiffs} | Count-diff files: ${countDiffFiles}`;
  console.log(summary);
  resultLines.push(summary);
}

const reportPath = 'D:/Tanvir Mahfuz/80-20-exam/scripts/audit_report.txt';
writeFileSync(reportPath, resultLines.join('\n'), 'utf8');
console.log(`\nReport saved to: ${reportPath}`);
