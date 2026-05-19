/**
 * Parse SSC Business Entrepreneurship Chapter 2 from markdown file.
 */
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'docs', 'ssc', 'bus_entre_chap2.txt');
const OUT_DIR = path.join(__dirname, '..', 'public', 'ssc', 'business_entrepreneurship');

const text = readFileSync(SRC, 'utf-8');
const lines = text.split('\n');

// Bangla digit helper
const BN = c => '০১২৩৪৫৬৭৮৯'.indexOf(c);
const toAr = s => Array.from(s).map(c => { const d = BN(c); return d >= 0 ? String(d) : c; }).join('');

// Match **[digit(s)].** pattern for MCQ questions
const Q_RE = /^\*\*([\u09E6-\u09EF০-৯0-9]+)[\.\)]\s*(.*?)\*\*\s*$/;
const OPT_RE = /^[কখগঘ]\)\s*(.*)/;
const LABELS = ['A', 'B', 'C', 'D'];
const LABEL_IDX = { 'ক': 0, 'খ': 1, 'গ': 2, 'ঘ': 3 };

let mcqs = [];
let mcqId = 1;
let inPart2 = false;
let inModelTest = false;
let prevLineEmpty = true;
let collecting = false;
let curQ = null, curOpts = { A: '', B: '', C: '', D: '' }, curHasBold = false;

// Store stimulus text for MCQ sets
let stimulusText = '';

function flushMcq() {
  if (!curQ) return;
  // Determine answer
  let ans = 'A';
  if (curHasBold) {
    for (const k of ['A','B','C','D']) {
      if (curOpts[k].startsWith('**') && curOpts[k].endsWith('**')) {
        ans = k;
        curOpts[k] = curOpts[k].replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        break;
      }
    }
  }
  if (curOpts.A && curOpts.B && curOpts.C && curOpts.D) {
    const cleanOpts = {};
    for (const k of ['A','B','C','D']) cleanOpts[k] = curOpts[k].replace(/\*\*/g, '').trim();
    mcqs.push({ id: mcqId++, question: curQ.replace(/\s+/g, ' ').trim(), options: cleanOpts, answer: ans });
  }
  curQ = null;
  curOpts = { A: '', B: '', C: '', D: '' };
  curHasBold = false;
  collecting = false;
}

// First pass: parse উত্তরমালা (answer key)
let modelTestAnswerMap = {};
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l.startsWith('#### উত্তরমালা') || l.startsWith('#### উত্তরমালা (বহুনির্বাচনি অভীক্ষা)')) {
    for (let j = i + 1; j < Math.min(i + 25, lines.length); j++) {
      const al = lines[j].trim();
      const cells = al.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      for (let c = 0; c + 1 < cells.length; c += 2) {
        const qNum = parseInt(cells[c]);
        const ansLabel = cells[c + 1];
        if (qNum && ansLabel && LABEL_IDX[ansLabel] !== undefined) {
          modelTestAnswerMap[qNum] = LABELS[LABEL_IDX[ansLabel]];
        }
      }
    }
    break;
  }
}

// Main parsing loop
for (let i = 0; i < lines.length; i++) {
  let l = lines[i].trim();
  if (!l) { prevLineEmpty = true; continue; }

  // Detect sections
  if (l.includes('PART 02:')) { inPart2 = true; continue; }
  if (l.includes('PART 03') || l.includes('এক্সক্লুসিভ সাজেশন্স') || l.startsWith('##')) {
    // End of PART 2 when we hit PART 03 or exclusive section
    if (l.includes('PART 03') || l.startsWith('## এক্স') || l.startsWith('## PART 0')) {
      if (inPart2) { flushMcq(); inPart2 = false; }
    }
    if (l.startsWith('## PART 04') || l.startsWith('####')) { continue; }
    if (l.startsWith('## ') && !l.includes('PART')) continue;
  }
  if (l.includes('PART 04:')) { inPart2 = false; inModelTest = true; continue; }
  if (l.includes('এক্সক্লুসিভ সাজেশন্স')) { inModelTest = false; continue; }
  if (l.startsWith('#### বহুনির্বাচনি অভীক্ষা') || l.startsWith('#### সৃজনশীল প্রশ্ন')) { continue; }

  // Skip non-content lines  
  if (l.startsWith('###') || l.startsWith('---') || l.startsWith('[') || 
      l.startsWith('উপরিউক্ত') || l.startsWith('সরবরাহকৃত') || l.startsWith('**পূর্ণমান') || l.startsWith('**সময়') ||
      l.startsWith('**বিঃদ্রঃ') || l.startsWith('নিচের কোনটি') || l.startsWith('**যেকোনো')) continue;

  // Check for MCQ question
  const qMatch = l.match(Q_RE);
  if (qMatch) {
    flushMcq();
    const qNum = parseInt(toAr(qMatch[1]));
    let qText = qMatch[2].trim();
    // Handle stimulus prefix
    if (qText.startsWith('নিচের')) { /* keep as is */ }
    if (inModelTest && modelTestAnswerMap[qNum]) {
      // Model test
    }
    curQ = qText;
    curOpts = { A: '', B: '', C: '', D: '' };
    curHasBold = false;
    collecting = true;
    continue;
  }

  // Check for stimulus block
  if (l.match(/^\*\*উদ্দীপক/) || l.match(/^\*\*উদ্দীপকের/) || l.startsWith('**উদ্দীপক')) {
    stimulusText = l.replace(/\*\*/g, '').trim();
    // Stimulus applies to subsequent MCQs until next stimulus or section end
    continue;
  }

  // Collect options for current MCQ
  if (collecting) {
    const optMatch = l.match(OPT_RE);
    if (optMatch) {
      const idx = LABEL_IDX[l[0]];
      if (idx !== undefined) {
        let optText = optMatch[1].trim();
        if (optText.startsWith('**') && optText.endsWith('**')) {
          curHasBold = true;
        }
        curOpts[LABELS[idx]] = optText;
      }
      continue;
    }
    // Multi-option statement starts new question
    if (l.match(/^[কখগঘ]\)\s*\*\*?[\u09E6-\u09EF]/)) {
      // Answer key line for multi MCQ - ignore for now
      // This is like "ক) **i ও ii**"
      const multiAns = l.match(/^\*?[কখগঘ]\)\s*\*\*([\u09E6-\u09EF\s,ওi]+)\*\*/);
      continue;
    }
    // If we hit a non-option line, flush
    if (curOpts.A || curOpts.B || curOpts.C || curOpts.D) {
      flushMcq();
    }
  }
  
  prevLineEmpty = false;
}

flushMcq();

// Re-process for model test: use উত্তরমালা to fix answers
if (Object.keys(modelTestAnswerMap).length > 0) {
  for (const m of mcqs) {
    const qNum = parseInt(toAr(String(m.id)));
    if (modelTestAnswerMap[qNum]) {
      // Only override if this MCQ is from PART 04 (model test section)
      // We can't easily distinguish, so let the bold marking take precedence
    }
  }
}

// Write MCQs
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
const mcqObj = {};
mcqs.forEach((m, idx) => { mcqObj[String(idx)] = m; });
writeFileSync(path.join(OUT_DIR, 'chapter_2_mcq.json'), JSON.stringify(mcqObj, null, 2), 'utf-8');
console.log(`MCQs: ${mcqs.length}`);

// ---- CQ parsing ----
// Find example CQ section and model test CQ section
let cqs = [];
let cqId = 1;
let inCqSec = false;
let currentCq = null;
let stimulusLines = [];
let currentSub = null;
let inAnswer = false;

// First build stimulus map for CQs
const cqStimulusMap = {};
{
  let lastNum = 0;
  let slines = [];
  let inside = false;
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    if (l.includes('সৃজনশীল প্রশ্ন ও উত্তর') && l.includes('উদাহরণ')) {
      inside = true; continue;
    }
    if (inside && (l.startsWith('---') || l.startsWith('এক্সক্লুসিভ') || l.startsWith('## '))) { inside = false; break; }
    if (!inside) continue;
    
     const cqHead = l.match(/^\*\*প্রশ্ন\s+([\u09E6-\u09EF0-9]+)/);
     if (cqHead) {
       if (lastNum && slines.length) { cqStimulusMap[lastNum] = slines.join(' ').replace(/\s+/g,' ').trim(); }
       lastNum = parseInt(toAr(cqHead[1]));
       slines = [];
       continue;
     }
     if (lastNum && !l.match(/^\*\*[কখগঘ]/) && !l.match(/^\*\*উত্তর/) && !l.startsWith('**')) {
       slines.push(l.replace(/\*\*/g,'').trim());
     }
   }
   if (lastNum && slines.length) cqStimulusMap[lastNum] = slines.join(' ').replace(/\s+/g,' ').trim();
 }

 // Parse CQs
 {
   let inside = false;
   
   for (let i = 0; i < lines.length; i++) {
     const l = lines[i].trim();
     if (!l) continue;
     
     if (l.includes('সৃজনশীল প্রশ্ন ও উত্তর') && l.includes('উদাহরণ')) { inside = true; continue; }
     if (inside && (l.startsWith('---') || l.startsWith('এক্সক্লুসিভ') || l.startsWith('## '))) {
       if (currentCq && currentCq.questions.ক && currentCq.answer.ক) cqs.push(currentCq);
       currentCq = null; inside = false; continue;
     }
     if (!inside) continue;
     
     // CQ header
     const cqHead = l.match(/^\*\*প্রশ্ন\s+([\u09E6-\u09EF0-9]+)/);
     if (cqHead) {
       if (currentCq && currentCq.questions.ক && currentCq.answer.ক) cqs.push(currentCq);
       currentCq = {
         id: cqId++,
         source: 'সৃজনশীল প্রশ্ন',
         stimulus: cqStimulusMap[parseInt(toAr(cqHead[1]))] || '',
        questions: { ক: '', খ: '', গ: '', ঘ: '' },
        answer: { ক: '', খ: '', গ: '', ঘ: '' },
      };
      currentSub = null;
      inAnswer = false;
      continue;
    }
    
    if (!currentCq) continue;
    
    // Sub-question
    const subMatch = l.match(/^\*\*([কখগঘ])[\.\)]\s*(.*?)(?:\*\*)?$/);
    if (subMatch) {
      currentSub = subMatch[1];
      currentCq.questions[currentSub] = subMatch[2].replace(/\*\*$/, '').trim();
      inAnswer = false;
      continue;
    }
    
    // Answer
    if (l.match(/^\*\*উত্তর:\*\*/)) {
      inAnswer = true;
      const ansText = l.replace(/^\*\*উত্তর:\*\*/, '').trim();
      if (currentSub && currentCq.answer[currentSub] !== undefined) {
        currentCq.answer[currentSub] = ansText;
      }
      continue;
    }
    
    // Continuation
    if (inAnswer && currentSub) {
      currentCq.answer[currentSub] += ' ' + l.replace(/\*\*/g, '').trim();
    } else if (!inAnswer && currentSub && !l.startsWith('**')) {
      currentCq.questions[currentSub] += ' ' + l.replace(/\*\*/g, '').trim();
    }
  }
  
  if (currentCq && currentCq.questions.ক && currentCq.answer.ক) cqs.push(currentCq);
}

const cqObj = { _type: 'creative_questions', questions: cqs };
writeFileSync(path.join(OUT_DIR, 'chapter_2_cq.json'), JSON.stringify(cqObj, null, 2), 'utf-8');
console.log(`CQs: ${cqs.length}`);

console.log('✓ Done');
