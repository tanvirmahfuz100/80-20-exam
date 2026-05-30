import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, parse } from 'path';

const srcDir = 'D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\ssc-ict';
const outDir = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\ssc\\ict';

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

function htmlDecode(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');
}

function extractQuestions(html, source) {
  const questions = [];
  let id = 0;

  // Find all question blocks
  const blockRegex = /<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5[^"]*">/g;
  let blockMatch;
  const blocks = [];

  while ((blockMatch = blockRegex.exec(html)) !== null) {
    const start = blockMatch.index;
    // Find matching closing of the outer w-full div
    let depth = 0;
    let end = start;
    let found = false;
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
    if (found) {
      blocks.push(html.substring(start, end));
    }
  }

  // Also try finding blocks by looking for outer container
  // Sometimes the structure is different - let's also try an alternative
  if (blocks.length === 0) {
    // Fallback: look for question-text-card-foreground directly
    const qRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">/g;
    let qm;
    while ((qm = qRegex.exec(html)) !== null) {
      const start = qm.index;
      // Find the parent block by looking back for w-full
      const parentStart = html.lastIndexOf('<div class="w-full">', start);
      if (parentStart >= 0) {
        // Check if we already have this block
        const blockStr = html.substring(parentStart, start + 200);
        if (!blocks.some(b => b.includes(blockStr.substring(0, 100)))) {
          // Find the end
          let depth = 0;
          for (let i = parentStart; i < html.length; i++) {
            if (html[i] === '<') {
              if (html.startsWith('</div>', i)) {
                if (depth === 0) { blocks.push(html.substring(parentStart, i + 6)); break; }
                depth--;
                i += 5;
              } else if (html.startsWith('<div', i)) {
                depth++;
                i += 3;
              }
            }
          }
        }
      }
    }
  }

  for (const block of blocks) {
    id++;

    // Extract question text
    const qDivRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/;
    const qMatch = block.match(qDivRegex);
    if (!qMatch) continue;

    let questionText = qMatch[1];
    // Extract all <p> content within
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    const parts = [];
    while ((pMatch = pRegex.exec(questionText)) !== null) {
      parts.push(htmlDecode(pMatch[1].replace(/<[^>]*>/g, '').trim()));
    }
    questionText = parts.join(' ').replace(/\s+/g, ' ').trim();
    // Remove leading number like "1. " or "7. "
    questionText = questionText.replace(/^\d+\.\s*/, '').trim();
    if (!questionText) continue;

    // Extract options
    const options = {};
    const optionKeys = ['A', 'B', 'C', 'D'];
    const gridMatch = block.match(/<div class="grid grid-cols-1 gap-2 md:grid-cols-2\s*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
    if (!gridMatch) continue;

    const gridContent = gridMatch[1];
    const btnRegex = /<button[\s\S]*?<\/button>/g;
    let btnMatch;
    let optIdx = 0;
    while ((btnMatch = btnRegex.exec(gridContent)) !== null && optIdx < 4) {
      const btnHtml = btnMatch[0];
      // Get all <p> content in the button
      const pContents = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let pm;
      while ((pm = pRegex.exec(btnHtml)) !== null) {
        const txt = htmlDecode(pm[1].replace(/<[^>]*>/g, '').trim());
        if (txt) pContents.push(txt);
      }
      // Use the last non-empty <p> content (avoid label from math rendering)
      const optText = pContents.length > 0 ? pContents[pContents.length - 1] : '';
      if (optText) {
        options[optionKeys[optIdx]] = optText;
      }
      optIdx++;
    }

    if (Object.keys(options).length < 2) continue;

    // Find correct answer
    let correctAnswer = '';
    const bnMap = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };

    // Try green first (correct answer marker)
    const greenBtnRegex = /<button[^>]*bg-\[#017A471A\][^>]*>[\s\S]*?<\/button>/;
    const greenMatch = block.match(greenBtnRegex);
    if (greenMatch) {
      const letterMatch = greenMatch[0].match(/([ক-ঘ])/);
      if (letterMatch) {
        correctAnswer = bnMap[letterMatch[1]] || '';
      }
    }

    // If no green, try yellow (some files mark correct answer in yellow)
    if (!correctAnswer) {
      const yellowBtnRegex = /<button[^>]*bg-\[#F59E0B1F\][^>]*>[\s\S]*?<\/button>/;
      const yellowMatch = block.match(yellowBtnRegex);
      if (yellowMatch) {
        const letterMatch = yellowMatch[0].match(/([ক-ঘ])/);
        if (letterMatch) {
          correctAnswer = bnMap[letterMatch[1]] || '';
        }
      }
    }

    // Fallback: extract from explanation text
    if (!correctAnswer) {
      const ansRegex = /সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?<strong>([ক-ঘ])/;
      const ansMatch = block.match(ansRegex);
      if (ansMatch) {
        correctAnswer = bnMap[ansMatch[1]] || '';
      }
    }

    if (!correctAnswer) {
      const ansRegex2 = /সঠিক উত্তর[ঃ:\s]*(?:হলো\s*)?([ক-ঘ])/;
      const ansMatch2 = block.match(ansRegex2);
      if (ansMatch2) {
        correctAnswer = bnMap[ansMatch2[1]] || '';
      }
    }

    if (!correctAnswer) continue;

    questions.push({
      id,
      question: questionText,
      options,
      answer: correctAnswer,
      source,
    });
  }

  return questions;
}

// Process all HTML files
const files = readdirSync(srcDir)
  .filter(f => f.endsWith('.html'))
  .sort((a, b) => a.localeCompare(b, 'bn'));

console.log(`Found ${files.length} HTML files`);

let totalQuestions = 0;
const mapping = [];
const htmlSources = [];

for (const file of files) {
  const html = readFileSync(join(srcDir, file), 'utf8');

  // Extract source name from h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const source = h1Match ? h1Match[1].trim() : parse(file).name;
  htmlSources.push({ file, source });

  const questions = extractQuestions(html, source);
  if (questions.length === 0) {
    console.log(`  SKIPPED: ${file} (0 questions extracted)`);
    continue;
  }

  const fileNum = mapping.length + 1;
  const jsonFile = `${fileNum}.json`;
  const jsonPath = join(outDir, jsonFile);
  writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');

  mapping.push(`${jsonFile}|${questions.length}|${source}`);
  totalQuestions += questions.length;
  console.log(`  ${fileNum}. ${source}: ${questions.length} questions`);
}

// Write mapping file
const mappingPath = join(outDir, '_mapping.txt');
writeFileSync(mappingPath, mapping.join('\n'), 'utf8');

console.log(`\nTotal: ${files.length} files processed, ${mapping.length} JSON files, ${totalQuestions} questions`);
