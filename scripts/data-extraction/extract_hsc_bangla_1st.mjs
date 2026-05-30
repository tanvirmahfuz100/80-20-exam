import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, parse } from 'path';

const srcDir = 'D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\hsc-bangla-1st-paper';
const outDir = 'D:\\Tanvir Mahfuz\\80-20-exam\\public\\hsc\\bangla_1st';

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

function extractHtmlText(html) {
  let r = '';
  let lastEnd = 0;
  const openTag = '<span class="katex">';
  let searchPos = 0;
  let found;
  while ((found = html.indexOf(openTag, searchPos)) !== -1) {
    r += html.substring(lastEnd, found);
    let depth = 1;
    let pos = found + openTag.length;
    while (depth > 0 && pos < html.length) {
      if (html.startsWith('</span>', pos)) {
        depth--;
        pos += 7;
      } else if (html.startsWith('<span', pos) && (html[pos + 5] === ' ' || html[pos + 5] === '>' || html[pos + 5] === '/' || html[pos + 5] === '\t' || html[pos + 5] === '\n')) {
        depth++;
        pos += 5;
      } else {
        const nextTag = html.indexOf('<', pos + 1);
        if (nextTag === -1) { pos = html.length; break; }
        pos = nextTag;
      }
    }
    const katexBlock = html.substring(found, pos);
    const ann = katexBlock.match(/<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>/);
    if (ann) {
      r += ann[1];
    }
    lastEnd = pos;
    searchPos = pos;
  }
  r += html.substring(lastEnd);
  r = htmlDecode(r.replace(/<[^>]*>/g, '').trim());
  r = r.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  return r;
}

function extractQuestions(html, source) {
  const questions = [];
  let id = 0;

  const blockRegex = /<div class="w-full"><div class="border dark:border-gray-700 rounded-xl p-5[^"]*">/g;
  let blockMatch;
  const blocks = [];

  while ((blockMatch = blockRegex.exec(html)) !== null) {
    const start = blockMatch.index;
    let depth = 0;
    let end = start;
    for (let i = start; i < html.length; i++) {
      if (html[i] === '<') {
        if (html.startsWith('</div>', i)) {
          if (depth === 0) { end = i + 6; break; }
          depth--;
          i += 5;
        } else if (html.startsWith('<div', i)) {
          depth++;
          i += 3;
        }
      }
    }
    blocks.push(html.substring(start, end));
  }

  if (blocks.length === 0) {
    const qRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">/g;
    let qm;
    while ((qm = qRegex.exec(html)) !== null) {
      const start = qm.index;
      const parentStart = html.lastIndexOf('<div class="w-full">', start);
      if (parentStart >= 0) {
        const blockStr = html.substring(parentStart, start + 200);
        if (!blocks.some(b => b.includes(blockStr.substring(0, 100)))) {
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

    const qDivRegex = /<div class="[^"]*font-medium text-card-foreground[^"]*">\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/;
    const qMatch = block.match(qDivRegex);
    if (!qMatch) continue;

    let questionText = qMatch[1];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    const parts = [];
    while ((pMatch = pRegex.exec(questionText)) !== null) {
      const text = extractHtmlText(pMatch[1]);
      if (text) parts.push(text);
    }
    questionText = parts.join(' ').replace(/\s+/g, ' ').trim();
    questionText = questionText.replace(/^\d+\.\s*/, '').trim();
    if (!questionText) continue;

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
      const pContents = [];
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let pm;
      while ((pm = pRegex.exec(btnHtml)) !== null) {
        const txt = extractHtmlText(pm[1]);
        if (txt) pContents.push(txt);
      }
      const optText = pContents.length > 0 ? pContents[pContents.length - 1] : '';
      if (optText) {
        options[optionKeys[optIdx]] = optText;
      }
      optIdx++;
    }

    if (Object.keys(options).length < 2) continue;

    let correctAnswer = '';
    const bnMap = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };

    const greenBtnRegex = /<button[^>]*bg-\[#017A471A\][^>]*>[\s\S]*?<\/button>/;
    const greenMatch = block.match(greenBtnRegex);
    if (greenMatch) {
      const letterMatch = greenMatch[0].match(/([ক-ঘ])/);
      if (letterMatch) {
        correctAnswer = bnMap[letterMatch[1]] || '';
      }
    }

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

const files = readdirSync(srcDir)
  .filter(f => f.endsWith('.html'))
  .sort((a, b) => a.localeCompare(b, 'bn'));

console.log(`Found ${files.length} HTML files`);

let totalQuestions = 0;
const mapping = [];

for (const file of files) {
  const html = readFileSync(join(srcDir, file), 'utf8');

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const source = h1Match ? h1Match[1].trim() : parse(file).name;

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

const mappingPath = join(outDir, '_mapping.txt');
writeFileSync(mappingPath, mapping.join('\n'), 'utf8');

console.log(`\nTotal: ${files.length} files, ${mapping.length} JSON files, ${totalQuestions} questions`);
