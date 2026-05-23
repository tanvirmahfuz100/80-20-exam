const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const WRITTEN_DIR = path.resolve(__dirname, '..', 'public', 'bcs', 'written');
const INDEX_PATH = path.join(WRITTEN_DIR, 'index.json');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'data', 'bcs_cq.json');

const BN = '০১২৩৪৫৬৭৮৯';

function bnDigitToNum(s) {
  let r = 0;
  for (const c of s) { const i = BN.indexOf(c); if (i >= 0) r = r * 10 + i; }
  return r;
}

const NOISE_PATTERNS = [
  'হাজাররা প্র তির াগীর সারে লাইভ পরীক্ষা', 'Andriod App', 'iOS App',
  'পেসবুক পপজ এবং গ্রু রপ জরেি করুি',
  'তিেতমি আপরেট পপরি আমারির Live WrittenTM',
  'হাজাররা প্র তির াগীর', 'লাইভ পরীক্ষা',
  'পরীক্ষাে প্র তির াতগিার মাধ্যরমই প্রস্তু তি তিি',
  'হাজাররা', 'আমারির Live WrittenTM', 'তিেতমি আপরেট',
];

function isNoiseLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (/^Page\s+\d+\s+of\s+\d+$/i.test(t)) return true;
  if (/^\d+\s+of\s+\d+$/.test(t)) return true;
  if (/^-+\s*\d+\s*-+\s*$/.test(t)) return true;
  if (/^===+/.test(t)) return true;
  if (/Download Live MCQ/i.test(t)) return true;
  if (/^PC$/i.test(t)) return true;
  if (/^App$/i.test(t)) return true;
  for (const p of NOISE_PATTERNS) { if (t.includes(p)) return true; }
  return false;
}

function cleanText(text) {
  text = text.replace(/--\s*\d+\s+of\s+\d+\s*--/g, '');
  text = text.replace(/-{5,}/g, '');
  const lines = text.split('\n');
  const cleaned = lines.map(l => l.replace(/\s+/g, ' ').trim()).filter(l => !isNoiseLine(l));
  return cleaned.join('\n');
}

const BN_SUBJECT_MAP = {
  'বাংলা': 'Bangla',
  'ইংরেজি': 'English',
  'গাণিতিক যুক্তি': 'Math',
  'সাধারণ বিজ্ঞান': 'General Science',
  'বাংলাদেশ বিষয়াবলি': 'Bangladesh Affairs',
  'বাংলাদেশ বিষয়াবলি': 'Bangladesh Affairs',
  'বাংলাদেশ বিষয়াবলী': 'Bangladesh Affairs',
  'আন্তর্জাতিক বিষয়াবলি': 'International Affairs',
  'আন্তর্জাতিক বিষয়াবলি': 'International Affairs',
  'আন্তর্জাতিক বিষয়াবলী': 'International Affairs',
  'মানসিক দক্ষতা': 'Mental Ability',
  'কম্পিউটার ও তথ্য প্রযুক্তি': 'Computer & IT',
  'সাধারণ বিজ্ঞান ও প্রযুক্তি': 'General Science & Technology',
};

function detectSubject(text, filename) {
  for (const [bn, en] of Object.entries(BN_SUBJECT_MAP)) {
    if (filename.includes(bn) || filename.toLowerCase().includes(en.toLowerCase())) return en;
  }
  const bnMatch = text.match(/বিষয়\s*[ঃ:]\s*([^\n]+)/i);
  if (bnMatch) {
    const s = bnMatch[1].trim();
    for (const [bn, en] of Object.entries(BN_SUBJECT_MAP)) {
      if (s.includes(bn)) return en;
    }
  }
  return 'Unknown';
}

const BN_SUB_LABELS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ'];

function isLabeledLine(line) {
  const t = line.trim();

  for (const label of BN_SUB_LABELS) {
    const re = new RegExp(`^\\(${label}\\)[\\s.।:]*`);
    if (re.test(t)) return { label, rest: t.replace(re, '').trim() };
  }

  if (/^\(\s*\)\s*/.test(t)) return { label: 'ক', rest: t.replace(/^\(\s*\)\s*/, '').trim() };

  for (const label of BN_SUB_LABELS) {
    const re = new RegExp(`^${label}[)）.।:]\\s*`);
    if (re.test(t)) return { label, rest: t.replace(re, '').trim() };
  }

  if (/^\s*\)\s*/.test(t)) return { label: 'ক', rest: t.replace(/^\s*\)\s*/, '').trim() };

  return null;
}

function extractSubQuestions(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length === 0) return [{ label: 'ক', text: '' }];

  const markers = [];
  for (let i = 0; i < lines.length; i++) {
    const info = isLabeledLine(lines[i]);
    if (info) markers.push({ idx: i, ...info });
  }

  if (markers.length === 0) {
    return [{ label: 'ক', text: lines.join(' ').trim() }];
  }

  const subs = [];
  for (let m = 0; m < markers.length; m++) {
    const marker = markers[m];
    const nextMarkerIdx = m + 1 < markers.length ? markers[m + 1].idx : lines.length;

    const subLines = [];
    subLines.push(marker.rest);
    for (let i = marker.idx + 1; i < nextMarkerIdx; i++) {
      subLines.push(lines[i]);
    }

    const subText = subLines.filter(l => l).join(' ').trim();
    if (subText) {
      subs.push({ label: marker.label, text: subText });
    }
  }

  if (subs.length === 0) {
    return [{ label: 'ক', text: lines.join(' ').trim() }];
  }

  return subs;
}

function parseCQs(text, subject, year) {
  const cqs = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let currentQNum = null;
  let currentQLines = [];
  let questionCounter = 1;

  for (const line of lines) {
    let qMatch = line.match(/^([০-৯]+)\s*[.।]/);
    if (!qMatch) qMatch = line.match(/^(\d+)\s*[.।]/);

    if (qMatch) {
      if (currentQNum !== null && currentQLines.length > 0) {
        const qText = currentQLines.join('\n').trim();
        if (qText.length > 10) {
          const subs = extractSubQuestions(qText);
          const safeSubj = subject.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'unknown';
          cqs.push({
            _type: 'creative_question',
            id: `bcs_${year}_${safeSubj}_${currentQNum}`,
            bcs: year,
            subject,
            stem: qText,
            stem_label: 'প্রশ্ন',
            questions: subs.map(s => ({
              label: s.label,
              question: s.text,
              model_answer: ''
            })),
            sub_question_count: subs.length
          });
          questionCounter++;
        }
      }
      let parsedQNum = qMatch[1].length > 1 ? bnDigitToNum(qMatch[1]) : parseInt(qMatch[1], 10);
      if (isNaN(parsedQNum) || parsedQNum === 0) parsedQNum = questionCounter;
      currentQNum = parsedQNum;
      currentQLines = [line.replace(qMatch[0], '').trim()];
    } else if (currentQNum !== null) {
      currentQLines.push(line);
    }
  }

  if (currentQNum !== null && currentQLines.length > 0) {
    const qText = currentQLines.join('\n').trim();
    if (qText.length > 10) {
      const subs = extractSubQuestions(qText);
      const safeSubj = subject.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'unknown';
      cqs.push({
        _type: 'creative_question',
        id: `bcs_${year}_${safeSubj}_${currentQNum}`,
        bcs: year,
        subject,
        stem: qText,
        stem_label: 'প্রশ্ন',
        questions: subs.map(s => ({
          label: s.label,
          question: s.text,
          model_answer: ''
        })),
        sub_question_count: subs.length
      });
      questionCounter++;
    }
  }

  return cqs;
}

async function processPdf(pdfPath, year) {
  if (!fs.existsSync(pdfPath)) {
    console.warn(`  [SKIP] Not found: ${path.basename(pdfPath)}`);
    return [];
  }

  try {
    const buf = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: buf, verbosity: 0 });
    const textResult = await parser.getText();
    let text = textResult.text;

    text = cleanText(text);

    const subject = detectSubject(text, path.basename(pdfPath));
    if (subject === 'Unknown') {
      console.warn(`  [WARN] Unknown subject for ${path.basename(pdfPath)}`);
    }

    const cqs = parseCQs(text, subject, year);
    return cqs;
  } catch (err) {
    console.error(`  [ERROR] ${path.basename(pdfPath)}: ${err.message}`);
    return [];
  }
}

async function main() {
  const indexData = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  const allCQs = [];
  const seenIds = new Set();

  for (const yearData of indexData) {
    const year = yearData.year;
    if (year < 35 || year > 47) continue;
    if (!yearData.pdfs || yearData.pdfs.length === 0) {
      console.log(`[SKIP] ${year}th BCS — no PDFs`);
      continue;
    }

    const yearDir = path.join(WRITTEN_DIR, String(year));
    console.log(`\n=== ${year}th BCS ===`);

    for (const pdfEntry of yearData.pdfs) {
      const pdfPath = path.join(yearDir, pdfEntry.file);
      if (!fs.existsSync(pdfPath)) {
        console.warn(`  [SKIP] File not found: ${pdfEntry.file}`);
        continue;
      }
      console.log(`  [PROCESS] ${pdfEntry.file}`);

      const cqs = await processPdf(pdfPath, year);
      console.log(`    -> ${cqs.length} CQs`);

      for (const cq of cqs) {
        let dedupKey = `${cq.id}`;
        let suffix = 0;
        while (seenIds.has(dedupKey)) {
          suffix++;
          dedupKey = `${cq.id}_v${suffix}`;
        }
        seenIds.add(dedupKey);
        if (suffix > 0) cq.id = dedupKey;
        allCQs.push(cq);
      }
    }
  }

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allCQs, null, 2), 'utf-8');
  const fsize = fs.statSync(OUTPUT_PATH).size;
  console.log(`\n[DONE] Total CQs: ${allCQs.length}`);
  console.log(`[DONE] Output: ${OUTPUT_PATH} (${(fsize/1024).toFixed(1)} KB)`);

  let withSubs = 0;
  let totalSubs = 0;
  for (const cq of allCQs) {
    if (cq.sub_question_count > 1) withSubs++;
    totalSubs += cq.sub_question_count;
  }
  console.log(`[STATS] CQs with sub-questions: ${withSubs}/${allCQs.length}`);
  console.log(`[STATS] Total sub-questions: ${totalSubs}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
