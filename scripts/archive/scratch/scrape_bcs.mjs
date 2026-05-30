import fs from 'fs';
import path from 'path';

const outputDir = path.join(import.meta.dirname, '../public/bcs');

const examConfigs = [
  {
    key: 'bcs_35',
    name: '35th BCS',
    code: '',
    url: 'https://bcsanalysis.com/35th-bcs-preliminary-question/',
  },
  {
    key: 'bcs_36',
    name: '36th BCS',
    code: '',
    url: 'https://bcsanalysis.com/36th-bcs-preliminary-question/',
  },
  {
    key: 'bcs_37',
    name: '37th BCS',
    code: '',
    url: 'https://10minuteschool.com/content/37th-bcs-question-bank-solution/',
  },
  {
    key: 'bcs_38',
    name: '38th BCS',
    code: '',
    url: 'https://bcsanalysis.com/38th-bcs-preliminary-question/',
  },
  {
    key: 'bcs_40',
    name: '40th BCS',
    code: '',
    url: 'https://bcsanalysis.com/40th-bcs-preli-question/',
  },
];

// Option patterns used in different sources
const OPT_PATTERNS = [
  // (ক) / (খ) / (গ) / (ঘ) - Bengali brackets
  { a: /[\(（]\s*[কখগঘ]\s*[\)）]/, b: /[\(（]\s*[ক]\s*[\)）]/, c: /[\(（]\s*[খ]\s*[\)）]/, d: /[\(（]\s*[গ]\s*[\)）]/, e: /[\(（]\s*[ঘ]\s*[\)）]/ },
  // ক. / খ. / গ. / ঘ. - Bengali with dots
  { a: /(?:^|\s)[কখগঘ]\.\s*/, b: /(?:^|\s)ক\.\s*/, c: /(?:^|\s)খ\.\s*/, d: /(?:^|\s)গ\.\s*/, e: /(?:^|\s)ঘ\.\s*/ },
  // (A) / (B) / (C) / (D) - English brackets
  { a: /[\(（]\s*[A-Da-d]\s*[\)）]/, b: /[\(（]\s*[Aa]\s*[\)）]/, c: /[\(（]\s*[Bb]\s*[\)）]/, d: /[\(（]\s*[Cc]\s*[\)）]/, e: /[\(（]\s*[Dd]\s*[\)）]/ },
];

const BANGLA_NUMS = '০১২৩৪৫৬৭৮৯';

function convertBanglaNum(str) {
  if (!str) return '';
  return str.replace(/[০-৯]/g, d => String(BANGLA_NUMS.indexOf(d)));
}

function toBanglaNum(n) {
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]).join('');
}

// Map answer letter (Bangla) to A/B/C/D
const BANGLA_ANS_MAP = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };

function parseAnswerText(text) {
  if (!text) return '';
  // উত্তরঃ (ক) / উত্তরঃ ক / Ans: (A) / Ans: A
  // Priority 1: letter in parentheses (ক) / (A)
  let m = text.match(/উত্তর\s*[:ঃ：]\s*[\(\（]?\s*([কখগঘA-Da-d])\s*[\)\）]/);
  if (m) {
    const ans = m[1];
    if (ans in BANGLA_ANS_MAP) return BANGLA_ANS_MAP[ans];
    return ans.toUpperCase();
  }
  // Priority 2: letter directly after colon with Bengali danda separator
  m = text.match(/উত্তর\s*[:ঃ：]\s*([কখগঘA-Da-d])\s*[।\.]/);
  if (m) {
    const ans = m[1];
    if (ans in BANGLA_ANS_MAP) return BANGLA_ANS_MAP[ans];
    return ans.toUpperCase();
  }
  // Priority 3: just a letter after colon, no separator
  m = text.match(/উত্তর\s*[:ঃ：]\s*([কখগঘA-Da-d])\b/);
  if (m) {
    const ans = m[1];
    if (ans in BANGLA_ANS_MAP) return BANGLA_ANS_MAP[ans];
    return ans.toUpperCase();
  }
  return '';
}

// Normalise whitespace
function clean(str) {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

async function fetchPage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BCSBot/1.0)' }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.text();
    } catch (e) {
      if (i < retries - 1) {
        console.log(`  Retry ${i+1}/${retries} for ${url}: ${e.message}`);
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw e;
      }
    }
  }
}

function extractTextFromHTML(html) {
  // Remove script/style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove all HTML tags, replace <br> and <p> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '\n');
  text = text.replace(/<div[^>]*>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&#?[a-z0-9]+;/g, ' ');
  // Remove excessive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

function parseQuestionsFromText(text, is10MS = false) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  let currentQuestion = null;
  let currentAnswer = '';
  let inExplanation = false;
  let explanationLines = [];

  const questionStartRe = /^(\d+)[.\.\s]+(.+)/;
  const banglaQStartRe = /^[০-৯]+[.\.\s]+(.+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header/irrelevant lines
    if (line.match(/^(#|##|home|search|menu|toggle|skip|table|content)/i)) continue;
    if (line.length < 2) continue;
    if (line.startsWith('http') || line.startsWith('www')) continue;
    if (line.match(/^(BCS|বিসিএস).*(প্রশ্ন|সমাধান|Question|Solution)/i)) continue;
    
    // Check for "Explanation:" marker (10MS format)
    if (line.match(/^Explanation\s*[:：]/i) || line.match(/^ব্যাখ্যা\s*[:：]/)) {
      inExplanation = true;
      explanationLines = [line.replace(/^(Explanation|ব্যাখ্যা)\s*[:：]/i, '').trim()];
      continue;
    }
    
    if (inExplanation) {
      // Check if this line starts a new question
      if (line.match(questionStartRe) || line.match(banglaQStartRe) || line.match(/^\d+[.\.]/)) {
        inExplanation = false;
        if (currentQuestion) {
          currentQuestion.explanation = clean(explanationLines.join(' '));
          questions.push(currentQuestion);
        }
        currentQuestion = null;
        currentAnswer = '';
        explanationLines = [];
        // Fall through to process as new question
      } else {
        // Check for answer marker in explanation
      if (line.match(/^উত্তর\s*[:ঃ：]/) || line.match(/^Answer\s*[:ঃ：]/i)) {
          const ans = parseAnswerText(line);
          if (ans) currentAnswer = ans;
        }
        explanationLines.push(line);
        continue;
      }
    }

    // Check for Bengali-numbered question (bcsanalysis format): ১। ... or ১. ...
    const bnMatch = line.match(/^[০-৯]+[\.।]\s*(.+)/);
    if (bnMatch) {
      if (currentQuestion) {
        // Save previous question
        if (currentAnswer) currentQuestion.answer = currentAnswer;
        questions.push(currentQuestion);
      }
      const qNum = parseInt(convertBanglaNum(line.match(/^([০-৯]+)/)[1]));
      currentQuestion = {
        id: qNum,
        question: clean(bnMatch[1]),
        options: { A: '', B: '', C: '', D: '' },
        answer: '',
        explanation: ''
      };
      currentAnswer = '';
      continue;
    }

    // Check for English-numbered question (10MS format): 1. ... or 1) ...
    const enMatch = line.match(/^(\d+)[.\.\)\s]\s*(.+)/);
    if (enMatch) {
      if (currentQuestion) {
        if (currentAnswer) currentQuestion.answer = currentAnswer;
        questions.push(currentQuestion);
      }
      currentQuestion = {
        id: parseInt(enMatch[1]),
        question: clean(enMatch[2]),
        options: { A: '', B: '', C: '', D: '' },
        answer: '',
        explanation: ''
      };
      currentAnswer = '';
      continue;
    }

    // Check for option lines
    if (currentQuestion) {
      // Bengali option (ক) / (খ) / (গ) / (ঘ)
      let optMatch = line.match(/[\(（]\s*([কখগঘ])\s*[\)）]\s*(.*)/);
      if (optMatch) {
        const optKey = BANGLA_ANS_MAP[optMatch[1]];
        if (optKey) {
          currentQuestion.options[optKey] = clean(optMatch[2]);
          continue;
        }
      }

      // Bengali option ক. / খ. / গ. / ঘ. 
      optMatch = line.match(/^([কখগঘ])[\.।]\s*(.*)/);
      if (optMatch) {
        const optKey = BANGLA_ANS_MAP[optMatch[1]];
        if (optKey) {
          currentQuestion.options[optKey] = clean(optMatch[2]);
          continue;
        }
      }

      // English option (A) / (B) / (C) / (D)
      optMatch = line.match(/[\(（]\s*([A-Da-d])\s*[\)）]\s*(.*)/);
      if (optMatch) {
        currentQuestion.options[optMatch[1].toUpperCase()] = clean(optMatch[2]);
        continue;
      }

      // English option A. / B. / C. / D.
      optMatch = line.match(/^([A-Da-d])[.\.\)]\s+(.*)/);
      if (optMatch) {
        currentQuestion.options[optMatch[1].toUpperCase()] = clean(optMatch[2]);
        continue;
      }

      // Check for answer line: উত্তরঃ ... or Ans: ...
      if (line.match(/^উত্তর\s*[:ঃ：]/) || line.match(/^Answer\s*[:ঃ：]/i)) {
        const ans = parseAnswerText(line);
        if (ans) {
          currentAnswer = ans;
        }
        continue;
      }

      // For 10MS format, answer might be bolded or in a specific format
      // "সঠিক উত্তর: 25%" or "উত্তরঃ খ"
      if (line.match(/সঠিক উত্তর/)) {
        const ansMatch = line.match(/[ঃ:]\s*([কখগঘA-Da-d])/);
        if (ansMatch) {
          const a = ansMatch[1];
          currentAnswer = (a in BANGLA_ANS_MAP) ? BANGLA_ANS_MAP[a] : a.toUpperCase();
        }
        continue;
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion) {
    if (currentAnswer) currentQuestion.answer = currentAnswer;
    questions.push(currentQuestion);
  }

  return questions;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const config of examConfigs) {
    const outputFile = path.join(outputDir, `${config.key}.json`);
    
    // Skip if already exists
    if (fs.existsSync(outputFile)) {
      console.log(`Skipping ${config.key} - already exists`);
      continue;
    }

    console.log(`\nFetching ${config.name} from ${config.url}`);
    
    try {
      const html = await fetchPage(config.url);
      const text = extractTextFromHTML(html);
      
      // Save raw text for debugging
      fs.writeFileSync(path.join(outputDir, `${config.key}_raw.txt`), text);

      const is10MS = config.url.includes('10minuteschool');
      const questions = parseQuestionsFromText(text, is10MS);

      // Filter out empty/invalid questions
      const validQuestions = questions.filter(q => 
        q.question && (q.options.A || q.options.B || q.options.C || q.options.D)
      );

      if (validQuestions.length === 0) {
        console.log(`  ⚠️ No questions parsed from ${config.name}`);
        console.log(`  Raw text saved to ${config.key}_raw.txt for debugging`);
        continue;
      }

      // Renumber sequentially
      validQuestions.forEach((q, idx) => q.id = idx + 1);

      // Remove explanation from questions that don't have one
      for (const q of validQuestions) {
        if (!q.explanation) delete q.explanation;
        // Standardise empty answers
        if (!q.answer) q.answer = '';
      }

      fs.writeFileSync(outputFile, JSON.stringify(validQuestions, null, 2));
      const withAns = validQuestions.filter(q => q.answer).length;
      const withExp = validQuestions.filter(q => q.explanation).length;
      console.log(`  ✅ ${validQuestions.length} questions saved`);
      console.log(`     ${withAns} with answers, ${withExp} with explanations`);

    } catch (e) {
      console.error(`  ❌ Error processing ${config.name}: ${e.message}`);
    }

    // Be nice to servers
    await new Promise(r => setTimeout(r, 1000));
  }

  // Update index.json
  const indexPath = path.join(outputDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const existingIds = new Set(index.map(i => i.id));

    for (const config of examConfigs) {
      const jsonPath = path.join(outputDir, `${config.key}.json`);
      if (fs.existsSync(jsonPath) && !existingIds.has(config.key)) {
        const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        index.push({
          id: config.key,
          name: config.name,
          code: config.code,
          questionCount: questions.length
        });
        console.log(`Added ${config.key} to index.json`);
      }
    }

    index.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''));
      const numB = parseInt(b.id.replace(/\D/g, ''));
      return numB - numA;
    });

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`\nUpdated ${indexPath}`);
  }

  console.log('\nDone!');
}

main();
