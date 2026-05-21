import fs from 'fs';
import path from 'path';

const outputDir = path.join(import.meta.dirname, '../public/bcs');

const examConfigs = [
  { key: 'bcs_35', name: '35th BCS', code: '', url: 'https://bcsanalysis.com/35th-bcs-preliminary-question/', bcsanalysis: true },
  { key: 'bcs_36', name: '36th BCS', code: '', url: 'https://bcsanalysis.com/36th-bcs-preliminary-question/', bcsanalysis: true },
  { key: 'bcs_38', name: '38th BCS', code: '', url: 'https://bcsanalysis.com/38th-bcs-preliminary-question/', bcsanalysis: true },
  { key: 'bcs_40', name: '40th BCS', code: '', url: 'https://bcsanalysis.com/40th-bcs-preli-question/', bcsanalysis: true },
];

const BANGLA_ANS = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };

function extractAnswer(text) {
  if (!text) return '';
  // উত্তরঃ (ক) / উত্তরঃ ক / উত্তর: ক
  // Also handle leading punctuation like উত্তরঃ ,(গ)
  let m = text.match(/উত্তর\s*[:ঃ：,]*\s*[,.]?\s*[\(\（]?\s*([কখগঘA-Da-d])\s*[\)\）]?/);
  if (m) {
    const a = m[1];
    return a in BANGLA_ANS ? BANGLA_ANS[a] : a.toUpperCase();
  }
  // Handle উত্তরঃ without colon
  m = text.match(/উত্তর\s*[ঃ]?\s*[,.]?\s*[\(\（]?\s*([কখগঘA-Da-d])\s*[\)\）]?/);
  if (m) {
    const a = m[1];
    return a in BANGLA_ANS ? BANGLA_ANS[a] : a.toUpperCase();
  }
  return '';
}

async function fetchPage(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();
  // Extract text content from the article/main content
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Keep important block elements as line breaks
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|td|th|blockquote|pre|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Normalise whitespace: collapse multiple spaces, remove tabs before line starts
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s+/g, '\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text;
}

function parseBCS(text) {
  const questions = [];
  const blocks = text.split(/\n(?=[০-৯\d]+[\.।]\s)/);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) continue;
    
    const firstLine = lines[0];
    let qMatch = firstLine.match(/^([০-৯\d]+)[\.।]\s*(.+)/);
    if (!qMatch) continue;
    
    let qNum = parseInt(qMatch[1].replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)));
    let qText = qMatch[2].trim();
    
    // If qText is empty (e.g. "১৮২। " with nothing after), try next line
    if (!qText && lines.length > 1) {
      const secondMatch = lines[1].match(/^([০-৯\d]+)[\.।]\s*(.+)/);
      if (secondMatch) {
        qNum = parseInt(secondMatch[1].replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d)));
        qText = secondMatch[2].trim();
        lines.splice(1, 1); // remove consumed line
      }
    }
    const opts = { A: '', B: '', C: '', D: '' };
    let answer = '';
    
    // Process remaining lines for options and answer
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      if (!line) continue;
      
      // উত্তর: answer line
      if (line.startsWith('উত্তর') || line.startsWith('Ans')) {
        const a = extractAnswer(line);
        if (a) answer = a;
        continue;
      }
      
      // Skip lines that look like another question number (false split)
      if (line.match(/^[০-৯\d]+[\.।]\s/)) continue;
      
      // Try inline parse: all options + answer on one line
      // e.g. "(ক) OMR (খ) OCR (গ) MICR (ঘ) Scanner উত্তরঃ (খ) OCR"
      const inlineOpts = line.match(/[\(\（]\s*[কখগঘ]\s*[\)）]/g);
      if (inlineOpts && inlineOpts.length >= 3) {
        // Extract each option individually
        const optMatches = [...line.matchAll(/[\(\（]\s*([কখগঘ])\s*[\)）]\s*([^(উত্তর)]*?)(?=[\(\（]\s*[কখগঘ]\s*[\)）]|উত্তর|$)/g)];
        for (const om of optMatches) {
          const key = BANGLA_ANS[om[1]];
          if (key) opts[key] = om[2].trim();
        }
        // Also extract answer from same line
        const inlineAns = extractAnswer(line);
        if (inlineAns) answer = inlineAns;
        continue;
      }
      
      // (ক) (খ) (গ) (ঘ) options on individual lines
      const bOpt = line.match(/^[\(\（]\s*([কখগঘ])\s*[\)）]\s*(.*)/);
      if (bOpt) {
        const key = BANGLA_ANS[bOpt[1]];
        if (key) opts[key] = bOpt[2].trim();
        continue;
      }
      
      // Also try without parens: ক. or খ.
      const bOpt2 = line.match(/^([কখগঘ])[\.।]\s*(.*)/);
      if (bOpt2) {
        const key = BANGLA_ANS[bOpt2[1]];
        if (key) opts[key] = bOpt2[2].trim();
        continue;
      }
      
      // (A) (B) (C) (D) options on individual lines
      const eOpt = line.match(/^[\(\（]\s*([A-Da-d])\s*[\)）]\s*(.*)/);
      if (eOpt) {
        opts[eOpt[1].toUpperCase()] = eOpt[2].trim();
        continue;
      }
      
      // A. B. C. D. (English letter + dot, no parens)
      const eOpt2 = line.match(/^([A-Da-d])[\.।]\s*(.*)/);
      if (eOpt2) {
        opts[eOpt2[1].toUpperCase()] = eOpt2[2].trim();
        continue;
      }
    }
    
    if (qText && (opts.A || opts.B || opts.C || opts.D)) {
      // Strip inline options/answer from question text if present
      qText = qText.replace(/[\(\（]\s*[কখগঘ]\s*[\)）][\s\S]*$/, '').trim();
      qText = qText.replace(/[–\-]\s*$/, '').trim();
      if (qText.endsWith('–') || qText.endsWith('-')) qText = qText.slice(0, -1).trim();
      questions.push({
        id: qNum,
        question: qText,
        options: opts,
        answer: answer,
        explanation: ''
      });
    }
  }
  
  return questions;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  
  for (const config of examConfigs) {
    const jsonPath = path.join(outputDir, `${config.key}.json`);
    
    // Skip if already exists
    if (fs.existsSync(jsonPath)) {
      console.log(`Skipping ${config.key} - already exists`);
      continue;
    }
    
    try {
      console.log(`\nFetching ${config.name}...`);
      const rawText = await fetchPage(config.url);
      
      const questions = parseBCS(rawText);
      
      if (questions.length === 0) {
        console.log(`  ⚠️ No questions found for ${config.name}`);
        // Save raw for debugging
        fs.writeFileSync(path.join(outputDir, `${config.key}_raw.txt`), rawText);
        continue;
      }
      
      // Save raw text for debugging (even if successful)
      fs.writeFileSync(path.join(outputDir, `${config.key}_raw.txt`), rawText);
      
      // Renumber sequentially
      questions.forEach((q, i) => q.id = i + 1);
      
      fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2));
      
      const withAns = questions.filter(q => q.answer).length;
      console.log(`  ✅ ${questions.length} questions, ${withAns} with answers`);
      
    } catch (err) {
      console.error(`  ❌ ${config.name}: ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 1500));
  }
  
  // Update index.json
  const indexPath = path.join(outputDir, 'index.json');
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    const existingIds = new Set(index.map(i => i.id));
    
    for (const config of examConfigs) {
      const jsonPath = path.join(outputDir, `${config.key}.json`);
      if (fs.existsSync(jsonPath) && !existingIds.has(config.key)) {
        const qs = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        index.push({
          id: config.key,
          name: config.name,
          code: config.code,
          questionCount: qs.length
        });
        console.log(`Added ${config.key} to index.json`);
      }
    }
    
    index.sort((a, b) => {
      return parseInt(b.id.replace(/\D/g, '')) - parseInt(a.id.replace(/\D/g, ''));
    });
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`\nUpdated index.json`);
  }
  
  console.log('\nDone!');
}

main();
