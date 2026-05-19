import { readFileSync, writeFileSync, unlinkSync } from 'fs';

// --- Common preposition pool for generating distractors ---
const POOL = [
  "in", "on", "at", "to", "for", "of", "by", "with", "from",
  "into", "upon", "about", "over", "under", "through", "against",
  "between", "among", "without", "within", "after", "before",
  "during", "since", "until", "till", "up", "down", "off", "out",
  "around", "across", "along", "behind", "below", "beneath",
  "beside", "beyond", "towards", "past", "inside", "outside",
  "above", "onto", "throughout"
];

function pickDistractors(correct, count = 3) {
  const safe = correct.replace(/\/.*$/, '').trim().toLowerCase();
  const candidates = POOL.filter(p => p !== safe);
  const result = [];
  const seed = safe.length + safe.charCodeAt(0) || 1;
  for (let i = 0; i < count && candidates.length > 0; i++) {
    const idx = ((seed * (i + 1) * 7) % candidates.length + candidates.length) % candidates.length;
    const picked = candidates.splice(idx, 1)[0];
    result.push(picked);
  }
  return result;
}

function makeOptions(correct) {
  const primary = correct.replace(/\/.*$/, '').trim();
  const dist = pickDistractors(primary, 3);
  return [primary, ...dist];
}

// --- Parse skillcheck combined explanation into per-blank map ---
function parseCombinedExplanation(text, blankLetters) {
  const map = {};
  if (!text) return map;
  for (const letter of blankLetters) {
    const regex = new RegExp(`\\(${letter}\\)[\\s]*['\u2018\u2019]?([^'\\n]+?)['\u2019]?[\\s]*[\\-–—](.+?)(?=\\([a-z]\\)|$)`, 's');
    const match = text.match(regex);
    if (match) {
      const ans = match[1].replace(/\/.*/, '').trim();
      let explanation = match[2].trim();
      // Remove trailing dots and spaces
      explanation = explanation.replace(/\.\s*$/, '').trim();
      map[letter] = `${ans} - ${explanation}`;
    }
  }
  return map;
}

// --- Normalize passage text (a)___ → _____(a)_____  ---
function normalizePassage(text) {
  return text
    .replace(/^Fill in the gaps with appropriate prepositions:\n?/i, '')
    .replace(/\(([a-z])\)\s*_{3,}/g, '_____($1)_____');
}

// --- Normalize passage for comparison (strip markers, blank format) ---
function normalizeForCompare(text) {
  return text
    .replace(/^Fill in the gaps with appropriate prepositions:\n?/i, '')
    .replace(/\(([a-z])\)\s*_{3,}/g, '_____($1)_____')
    .replace(/_{3,}\s*\(([a-z])\)\s*_{3,}/g, '_____($1)_____')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// --- Deduplicate by source/title first, then by content ---
function getPassageForCompare(p) {
  return p.passage_text || p.passage || '';
}

function getTitleForCompare(p) {
  return p.title || p.exam_appearance || p.source || '';
}

function findDuplicate(skillcheckItem, existingPassages) {
  const source = (skillcheckItem.source || '').trim().toLowerCase();
  const tags = (skillcheckItem.tags || []).map(t => t.trim().toLowerCase());

  // 1. Try matching by source/title (only if both are non-empty)
  for (const p of existingPassages) {
    const title = getTitleForCompare(p).trim().toLowerCase();
    if (!title || !source) continue;
    if (title.includes(source) || source.includes(title)) {
      return p;
    }
  }

  // 2. Try matching by tag (second tag is usually the board/exam name)
  for (const p of existingPassages) {
    const title = getTitleForCompare(p).trim().toLowerCase();
    if (!title) continue;
    for (const tag of tags) {
      if (tag && tag !== 'prepositions' && title.includes(tag)) {
        return p;
      }
    }
  }

  // 3. Fallback: content-based comparison (normalize blank markers)
  const passageText = skillcheckItem.question.replace(/^Fill in the gaps with appropriate prepositions:\n?/i, '');
  const key = normalizeForCompare(passageText);
  for (const p of existingPassages) {
    const existing = getPassageForCompare(p);
    if (normalizeForCompare(existing) === key) {
      return p;
    }
  }

  return undefined;
}

// --- Generate per-blank explanation for HSC format ---
function makeBlankExplanation(letter, correct, combinedExplanations, fallback) {
  const ce = combinedExplanations[letter] || '';
  const exp = `'${correct}' বসে।`;
  if (ce) {
    return `${exp} ${ce}`;
  }
  return `${exp} ${fallback || ''}`;
}

// --- HSC standard explanation templates ---
const EXPLANATION_TEMPLATES = {
  "as": "'as' বসে হিসেবে/রূপে বুঝাতে।",
  "in": "'in' বসে অবস্থান/স্থান বুঝাতে।",
  "on": "'on' বসে পৃষ্ঠ/নির্দিষ্ট দিন বুঝাতে।",
  "at": "'at' বসে নির্দিষ্ট সময়/স্থান বুঝাতে।",
  "to": "'to' বসে দিক/গন্তব্য বুঝাতে।",
  "for": "'for' বসে উদ্দেশ্য/কারণ বুঝাতে।",
  "of": "'of' বসে সম্পর্ক/অধিকার বুঝাতে।",
  "by": "'by' বসে কর্তা/পদ্ধতি বুঝাতে।",
  "with": "'with' বসে সহযোগিতা/সঙ্গে বুঝাতে।",
  "from": "'from' বসে উৎস/দূরত্ব বুঝাতে।",
  "into": "'into' বসে ভিতরে প্রবেশ বুঝাতে।",
  "upon": "'upon' বসে উপরে/ঘটনা বুঝাতে।",
  "about": "'about' বসে সম্পর্কে/প্রায় বুঝাতে।",
  "over": "'over' বসে উপরে/অধিক বুঝাতে।",
  "under": "'under' বসে নিচে/অধীন বুঝাতে।",
  "through": "'through' বসে মধ্য দিয়ে বুঝাতে।",
  "against": "'against' বসে বিরুদ্ধে বুঝাতে।",
  "between": "'between' বসে দুইয়ের মধ্যে বুঝাতে।",
  "among": "'among' বসে অনেকের মধ্যে বুঝাতে।",
  "without": "'without' বসে ছাড়া/ব্যতীত বুঝাতে।",
  "within": "'within' বসে ভিতরে/মধ্যে বুঝাতে।",
  "after": "'after' বসে পরে/অনুসরণ বুঝাতে।",
  "before": "'before' বসে আগে/সম্মুখে বুঝাতে।",
  "during": "'during' বসে সময়কালে বুঝাতে।",
  "since": "'since' বসে সময়ের শুরু থেকে বুঝাতে।",
  "until": "'until' বসে পর্যন্ত বুঝাতে।",
  "till": "'till' বসে পর্যন্ত বুঝাতে।",
  "up": "'up' বসে উপরে/সমাপ্তি বুঝাতে।",
  "down": "'down' বসে নিচে/হ্রাস বুঝাতে।",
  "off": "'off' বসে দূরে/বিচ্ছিন্ন বুঝাতে।",
  "out": "'out' বসে বাইরে/প্রকাশ বুঝাতে।",
  "around": "'around' বসে চারপাশে/প্রায় বুঝাতে।",
  "across": "'across' বসে আড়াআড়ি/পারাপার বুঝাতে।",
  "along": "'along' বসে বরাবর/ধরে বুঝাতে।",
  "behind": "'behind' বসে পিছনে বুঝাতে।",
  "below": "'below' বসে নিচে/কম বুঝাতে।",
  "beneath": "'beneath' বসে নিচে/অধস্তন বুঝাতে।",
  "beside": "'beside' বসে পাশে বুঝাতে।",
  "beyond": "'beyond' বসে beyond/অতীত বুঝাতে।",
  "towards": "'towards' বসে দিকে/অভিমুখে বুঝাতে।",
  "past": "'past' বসে অতিক্রম/অতীত বুঝাতে।",
  "inside": "'inside' বসে ভিতরে বুঝাতে।",
  "outside": "'outside' বসে বাইরে বুঝাতে।",
  "above": "'above' বসে উপরে/অধিক বুঝাতে।",
  "onto": "'onto' বসে উপরে (গতিশীল) বুঝাতে।",
  "throughout": "'throughout' বসে সর্বত্র/ব্যাপী বুঝাতে।",
};

function getStandardExplanation(correct) {
  const primary = correct.replace(/\/.*$/, '').trim().toLowerCase();
  return EXPLANATION_TEMPLATES[primary] || `'${primary}' বসে সঠিক preposition হিসেবে।`;
}

// ===== MAIN =====
const SKILLCHECK_PATH = 'docs/skillcheck_preposition.json';
const SSC_PATH = 'public/ssc/english/prepositions.json';
const HSC_1_PATH = 'public/hsc/english_2nd/preposition_1-10.json';
const HSC_2_PATH = 'public/hsc/english_2nd/preposition_11-20.json';
const HSC_UNIFIED_PATH = 'public/hsc/english_2nd/prepositions.json';
const HSC_INDEX_PATH = 'public/hsc/index.json';

// --- Read all inputs ---
const skillcheck = JSON.parse(readFileSync(SKILLCHECK_PATH, 'utf-8'));
const sscExisting = JSON.parse(readFileSync(SSC_PATH, 'utf-8'));
const hsc1 = JSON.parse(readFileSync(HSC_1_PATH, 'utf-8'));
const hsc2 = JSON.parse(readFileSync(HSC_2_PATH, 'utf-8'));

const hscExisting = [...hsc1.passages, ...hsc2.passages];

// --- Classify skillcheck items ---
// All skillcheck items are HSC-level based on tags/boards/colleges
const hscNew = [];
const sscNew = [];

for (const item of skillcheck) {
  // Check if it duplicates an existing HSC passage
  const dup = findDuplicate(item, hscExisting);
  if (dup) {
    console.log(`  [SKIP - duplicate HSC] ${item.id}: ${item.source}`);
    continue;
  }
  
  // Check if it matches any SSC passage
  const sscDup = findDuplicate(item, sscExisting);
  if (sscDup) {
    console.log(`  [SKIP - duplicate SSC] ${item.id}: ${item.source}`);
    continue;
  }
  
  // Check if it's SSC-level (simpler passages about exams, students, etc.)
  // Heuristic: if source mentions "SSC" or tags suggest SSC level
  const tags = item.tags || [];
  const source = item.source || '';
  const isSSC = 
    tags.some(t => t.toLowerCase().includes('ssc')) ||
    source.toLowerCase().includes('ssc');
  
  if (isSSC) {
    sscNew.push(item);
  } else {
    hscNew.push(item);
  }
}

console.log(`\nSkillcheck items: ${skillcheck.length}`);
console.log(`  New HSC items: ${hscNew.length}`);
console.log(`  New SSC items: ${sscNew.length}`);
console.log(`  Duplicates skipped: ${skillcheck.length - hscNew.length - sscNew.length}`);

// --- Convert HSC new items to HSC passage format ---
let nextHscId = hscExisting.length + 1;
const hscConverted = hscNew.map((item) => {
  const letters = [];
  const pattern = /\(([a-z])\)_{3,}/g;
  let m;
  while ((m = pattern.exec(item.question)) !== null) {
    letters.push(m[1]);
  }
  if (letters.length === 0) {
    for (let i = 0; i < (item.correct_order || []).length; i++) {
      letters.push(String.fromCharCode(97 + i));
    }
  }
  
  const combinedExp = parseCombinedExplanation(item.explanation, letters);
  const tags = item.tags || [];
  const title = tags.length > 1 ? tags.slice(1).join(' | ') : item.source;
  
  const blanks = (item.correct_order || []).map((correct, idx) => {
    const letter = letters[idx] || String.fromCharCode(97 + idx);
    const options = makeOptions(correct);
    const stdExp = getStandardExplanation(correct);
    const exp = makeBlankExplanation(letter, correct, combinedExp, stdExp);
    return {
      id: letter,
      correct_answer: correct,
      options,
      explanation_bn: exp,
    };
  });
  
  return {
    id: nextHscId++,
    title,
    passage_text: normalizePassage(item.question),
    blanks,
  };
});

// --- Build unified HSC file ---
const unifiedHsc = {
  chapter: "Prepositions",
  total_passages: hscExisting.length + hscConverted.length,
  passages: [...hscExisting, ...hscConverted],
};

writeFileSync(HSC_UNIFIED_PATH, JSON.stringify(unifiedHsc, null, 2), 'utf-8');
console.log(`\n✓ Created unified HSC file: ${HSC_UNIFIED_PATH} (${unifiedHsc.total_passages} passages)`);

// --- Update HSC index.json ---
let hscIndex = JSON.parse(readFileSync(HSC_INDEX_PATH, 'utf-8'));

// Find the prepositions topic in English 2nd Paper
for (const subject of hscIndex.subjects) {
  if (subject.id === 'english_2nd') {
    for (const topic of subject.topics) {
      if (topic.id === 'prepositions') {
        // Replace chapters with single unified entry
        topic.chapters = [
          {
            id: 'hsc_eng2_prepositions',
            name: 'Prepositions (All)',
            file: '/hsc/english_2nd/prepositions.json',
          },
        ];
      }
    }
  }
}

writeFileSync(HSC_INDEX_PATH, JSON.stringify(hscIndex, null, 2), 'utf-8');
console.log(`✓ Updated HSC index.json`);

// --- Remove old HSC files ---
try { unlinkSync(HSC_1_PATH); console.log(`✓ Removed: ${HSC_1_PATH}`); } catch (e) { console.warn(`  Could not remove ${HSC_1_PATH}: ${e.message}`); }
try { unlinkSync(HSC_2_PATH); console.log(`✓ Removed: ${HSC_2_PATH}`); } catch (e) { console.warn(`  Could not remove ${HSC_2_PATH}: ${e.message}`); }

// --- SSC new items ---
if (sscNew.length > 0) {
  let nextSscId = sscExisting.length + 1;
  const sscConverted = sscNew.map((item) => {
    const letters = [];
  const pattern = /\(([a-z])\)\s*_{3,}/g;
    let m;
    while ((m = pattern.exec(item.question)) !== null) {
      letters.push(m[1]);
    }
    if (letters.length === 0) {
      for (let i = 0; i < (item.correct_order || []).length; i++) {
        letters.push(String.fromCharCode(97 + i));
      }
    }
    
    const combinedExp = parseCombinedExplanation(item.explanation, letters);
    
    const blanks = (item.correct_order || []).map((correct, idx) => {
      const letter = letters[idx] || String.fromCharCode(97 + idx);
      const options = makeOptions(correct);
      const stdExp = getStandardExplanation(correct);
      const expPart = combinedExp[letter] || stdExp;
      return {
        blank_id: letter,
        correct_answer: correct,
        options,
        explanation_en: expPart,
        explanation_bn: expPart,
      };
    });
    
    return {
      question_id: nextSscId++,
      source: item.source || 'SkillCheck Question',
      exam_appearance: item.tags?.slice(1).join(' | ') || 'Preposition Exercise',
      passage: normalizePassage(item.question),
      blanks,
    };
  });
  
  const updatedSsc = [...sscExisting, ...sscConverted];
  writeFileSync(SSC_PATH, JSON.stringify(updatedSsc, null, 2), 'utf-8');
  console.log(`✓ Added ${sscConverted.length} items to SSC prepositions.json (total: ${updatedSsc.length})`);
} else {
  console.log(`  No new SSC items to add.`);
}

console.log(`\n✅ Merge complete!`);
