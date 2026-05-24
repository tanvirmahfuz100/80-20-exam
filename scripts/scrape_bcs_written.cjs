const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WRITTEN_DIR = path.join(__dirname, '..', 'public', 'bcs', 'written');

const SUBJECT_MAP = {
  'বাংলা': 'Bangla',
  'ইংরেজি': 'English',
  'English': 'English',
  'গণিত': 'Math',
  'গাণিতিক যুক্তি': 'Mathematical_Reasoning',
  'মানসিক দক্ষতা': 'Mental_Ability',
  'সাধারণ বিজ্ঞান': 'General_Science',
  'সাধারণ বিজ্ঞান ও প্রযুক্তি': 'General_Science_Technology',
  'সাধারণ বিজ্ঞান ও প্রযুক্তিঃ': 'General_Science_Technology',
  'বাংলাদেশ বিষয়াবলি': 'Bangladesh_Affairs',
  'বাংলাদেশ বিষয়াবলি': 'Bangladesh_Affairs',
  'বাংলাদেশ বিষয়াবলী': 'Bangladesh_Affairs',
  'আন্তর্জাতিক বিষয়াবলি': 'International_Affairs',
  'আন্তর্জাতিক বিষয়াবলি': 'International_Affairs',
  'আন্তর্জাতিক বিষয়াবলী': 'International_Affairs',
  'কম্পিউটার ও তথ্য প্রযুক্তি': 'Computer_IT',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const fetcher = url.startsWith('https') ? https : http;
    fetcher.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function htmlDecode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, m => String.fromCharCode(m.replace(/&#(\d+);/, '$1')))
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    .trim();
}

function stripHtmlTags(text) {
  return text.replace(/<[^>]+>/g, '').trim();
}

function bnDigitToNum(s) {
  const BN = '০১২৩৪৫৬৭৮৯';
  let r = 0;
  for (const c of s) {
    const i = BN.indexOf(c);
    if (i >= 0) r = r * 10 + i;
  }
  return r;
}

/**
 * Parse the HTML to extract subject sections.
 * Each section is an <h3> containing "বিষয়:" or "Subject:" followed by content
 * until the next subject h3.
 */
function parseSubjectSections(html) {
  const sections = [];
  
  // Find all <h3> tag positions
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  const subjectHeaders = [];
  let h3Match;
  
  while ((h3Match = h3Regex.exec(html)) !== null) {
    const inner = h3Match[1];
    let subjectMatch = inner.match(/বিষয়[:\s]\s*([^<]+)/);
    let isEnglish = false;
    if (!subjectMatch) {
      subjectMatch = inner.match(/Subject[:\s]\s*([^<]+)/i);
      if (subjectMatch) isEnglish = true;
    }
    if (subjectMatch) {
      const name = stripHtmlTags(subjectMatch[1]).trim();
      if (name) {
        subjectHeaders.push({
          name,
          isEnglish,
          startIdx: h3Match.index,
          endIdx: h3Match.index + h3Match[0].length,
        });
      }
    }
  }
  
  // For each subject header, extract content from end of its </h3> to next subject's <h3>
  for (let i = 0; i < subjectHeaders.length; i++) {
    const h = subjectHeaders[i];
    const contentStart = h.endIdx;
    const contentEnd = i + 1 < subjectHeaders.length ? subjectHeaders[i + 1].startIdx : html.length;
    
    let content = html.substring(contentStart, contentEnd).trim();
    
    // Remove HTML tags but keep text structure
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<p[^>]*>/gi, '\n');
    content = content.replace(/<\/p>/gi, '\n');
    content = content.replace(/<[^>]+>/g, '');
    
    // Extract metadata from first 1000 chars of content (Bangla + English)
    const header = content.substring(0, 1000);
    const codeMatch = header.match(/বিষয় কোড[\s\-–:]*\s*([০-৯]+)/) || header.match(/Subject Code[\s\-–:]*\s*(\d+)/i);
    const code = codeMatch ? codeMatch[1] : '';
    const marksMatch = header.match(/পূর্ণমান[\s\-–:]*\s*([০-৯]+)/) || header.match(/Full\s*Marks?[\s\-–:]*\s*(\d+)/i);
    const fullMarks = marksMatch ? parseInt(bnDigitToNum(marksMatch[1]) || marksMatch[1]) : 0;
    const timeMatch = header.match(/(?:নির্ধারিত সময়|সময়)[\s\-–:]*\s*([^\n]{1,30})/) || header.match(/Time[\s\-–:]*\s*([^\n]{1,30})/i);
    const time = timeMatch ? timeMatch[1].trim() : '';
    
    sections.push({
      name: h.name,
      isEnglish: h.isEnglish,
      code,
      fullMarks,
      time,
      html: content,
    });
  }
  
  return sections;
}

/**
 * Parse questions from a subject section's text content
 */
function parseQuestions(text, subjectName) {
  const questions = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentQ = null;
  let currentText = '';
  let currentSubs = [];
  let inQuestion = false;
  let pendingIntro = '';
  
  // Bengali digit pattern for question numbering: ০১। ০২। or ০১. etc
  // Also English digits: 1. 2. 01. etc
  // Also bold patterns like **০১।**
  
  for (let li = 0; li < lines.length; li++) {
    let line = lines[li];
    
    // Skip metadata lines
    if (/^(বিষয় কোড|Subject Code|নির্ধারিত সময়|সময়|পূর্ণমান|Full Marks|দ্রষ্টব্য|\[দ্রষ্টব্য)/i.test(line)) continue;
    if (/^(Part|পার্ট)/i.test(line) && /[A-Z\-]/.test(line)) {
      // Part headers - keep as context but not as question
      continue;
    }
    if (/^Page\s+\d+/i.test(line)) continue;
    if (/^===+/.test(line)) continue;
    if (/^[\d\s]*of\s+[\d\s]*$/i.test(line)) continue;
    
    // Check for question number pattern: Bangla or English digits followed by । or .
    let qMatch = null;
    
    // Try Bold Bangla digits: **০১।**
    const boldMatch = line.match(/^\*\*([০-৯]+)\s*[.।]\s*\*\*/);
    if (boldMatch) {
      qMatch = { num: boldMatch[1], rest: line.substring(boldMatch[0].length).trim() };
    }
    
    if (!qMatch) {
      // Try Bangla digits: ০১। ০১. (০১)
      const bnMatch = line.match(/^[\(（]?([০-৯]+)[)）.।]\s*/);
      if (bnMatch) {
        qMatch = { num: bnMatch[1], rest: line.substring(bnMatch[0].length).trim() };
      }
    }
    
    if (!qMatch) {
      // Try English digits: 1. 01. (1) (01)
      const enMatch = line.match(/^[\(（]?(\d+)[)）.।]\s*/);
      if (enMatch) {
        const num = parseInt(enMatch[1]);
        if (num >= 1 && num <= 30) {
          qMatch = { num: enMatch[1], rest: line.substring(enMatch[0].length).trim() };
        }
      }
    }
    
    if (qMatch) {
      // Save previous question
      if (currentQ !== null && currentText.length > 3) {
        questions.push({
          number: currentQ,
          text: currentText.trim(),
          subQuestions: currentSubs.length > 0 ? currentSubs : undefined,
        });
      }
      
      const numVal = bnDigitToNum(qMatch.num) || parseInt(qMatch.num);
      currentQ = numVal > 0 ? numVal : (questions.length + 1);
      currentText = qMatch.rest;
      currentSubs = [];
      inQuestion = true;
      continue;
    }
    
    // Check for Bangla sub-question labels: ক) খ) (ক) (খ) ক. খ.
    const bnSubMatch = line.match(/^[\(（]?\s*([কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ])\s*[)）.।]\s*/);
    if (bnSubMatch && inQuestion) {
      currentSubs.push({
        label: bnSubMatch[1],
        text: line.substring(bnSubMatch[0].length).trim(),
      });
      continue;
    }
    
    // Check for English sub-question labels: (a) (b) a. b.
    if (subjectName.toLowerCase().includes('english')) {
      const enSubMatch = line.match(/^[\(（]?\s*([a-eA-E])\s*[)）.।]\s*/);
      if (enSubMatch) {
        if (inQuestion) {
          currentSubs.push({
            label: enSubMatch[1],
            text: line.substring(enSubMatch[0].length).trim(),
          });
        } else if (!inQuestion) {
          inQuestion = true;
          currentQ = questions.length + 1;
          currentText = pendingIntro.trim();
          pendingIntro = '';
          currentSubs = [];
          currentSubs.push({
            label: enSubMatch[1],
            text: line.substring(enSubMatch[0].length).trim(),
          });
        }
        continue;
      }
    }
    
    if (inQuestion) {
      currentText += ' ' + line;
    } else if (subjectName.toLowerCase().includes('english') && !/^(Subject Code|Time|Full Marks|Part-)/i.test(line)) {
      pendingIntro += ' ' + line;
    }
  }
  
  // Push last question
  if (currentQ !== null && currentText.length > 3) {
    questions.push({
      number: currentQ,
      text: currentText.trim(),
      subQuestions: currentSubs.length > 0 ? currentSubs : undefined,
    });
  }
  
  return questions;
}

function extractPageContent(html, year) {
  const sections = parseSubjectSections(html);
  const subjects = [];
  
  for (const section of sections) {
    const textContent = htmlDecode(section.html);
    const questions = parseQuestions(textContent, section.name);
    
    subjects.push({
      name: section.name,
      code: section.code,
      fullMarks: section.fullMarks,
      time: section.time,
      questions,
    });
  }
  
  return { year, subjects };
}

async function scrapeAndSave(url, year, sourceName) {
  console.log(`\n[${year || '?'}] ${sourceName}`);
  console.log(`  Fetching ${url}...`);
  
  try {
    const html = await fetchUrl(url);
    console.log(`  -> Received ${(html.length / 1024).toFixed(1)} KB`);
    
    const data = extractPageContent(html, year);
    
    if (!fs.existsSync(WRITTEN_DIR)) {
      fs.mkdirSync(WRITTEN_DIR, { recursive: true });
    }
    
    const filename = year ? `bcs_${year}.json` : `bcs_${sourceName.replace(/[^a-z0-9]/gi, '_')}.json`;
    const outPath = path.join(WRITTEN_DIR, filename);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
    
    const totalQs = data.subjects.reduce((sum, s) => sum + s.questions.length, 0);
    console.log(`  -> Saved: ${data.subjects.length} subjects, ${totalQs} questions`);
    
    for (const subj of data.subjects) {
      console.log(`     ${subj.name} (${subj.code || 'N/A'}): ${subj.questions.length} questions`);
    }
    
    return data;
  } catch (err) {
    console.error(`  [ERROR] ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== BCS Written Question Scraper ===\n');
  
  const sources = [
    { url: 'https://web.livewritten.com/35th-bcs-written-question-pdf/', year: 35, name: 'livewritten' },
    { url: 'https://web.livewritten.com/36th-bcs-written-question-pdf/', year: 36, name: 'livewritten' },
    // 37th-47th BCS use PDF/flipbook embeds (no inline HTML) — need a PDF parser
  ];
  
  const results = {};
  
  for (const source of sources) {
    const data = await scrapeAndSave(source.url, source.year, `${source.name} ${source.year}th`);
    if (data && data.year) {
      // Keep best result per year (prefer one with more subjects/questions)
      const existing = results[data.year];
      const qCount = data.subjects.reduce((sum, s) => sum + s.questions.length, 0);
      const existingQCount = existing ? existing.subjects.reduce((sum, s) => sum + s.questions.length, 0) : 0;
      if (!existing || qCount > existingQCount) {
        results[data.year] = data;
      }
    }
  }
  
  // Create index.json
  const index = Object.keys(results)
    .sort((a, b) => b - a)
    .map(year => {
      const d = results[year];
      return {
        id: `bcs_written_${year}`,
        name: `${year}th BCS Written`,
        year: parseInt(year),
        subjects: d.subjects.map(s => ({
          name: s.name,
          code: s.code,
          fullMarks: s.fullMarks,
          questionCount: s.questions.length,
        })),
      };
    });
  
  fs.writeFileSync(path.join(WRITTEN_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  
  console.log(`\n=== SUMMARY ===`);
  for (const entry of index) {
    console.log(`\n${entry.name}:`);
    for (const s of entry.subjects) {
      console.log(`  ${s.name}: ${s.questionCount} questions`);
    }
  }
  console.log(`\nAll files saved to: ${WRITTEN_DIR}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
