const fs = require('fs');
const path = require('path');

const BCS_DIR = path.join(__dirname, '..', 'public', 'bcs');

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== Known answers for files without answer keys =====
const knownFixes = {
  'bcs_35': {
    107: { answer: 'A', explanation: 'জাপানের সংবিধানকে "শান্তি সংবিধান" বলা হয়, কারণ এর ৯ নং অনুচ্ছেদে যুদ্ধ ও সামরিক শক্তি পরিত্যাগের কথা বলা হয়েছে।' }
  },
  'bcs_36': {
    90: { answer: 'C', explanation: '১৯৫৬ সালের ১৬ ফেব্রুয়ারি পাকিস্তান গণপরিষদ বাংলাকে অন্যতম রাষ্ট্রভাষা হিসেবে স্বীকৃতি দেয়।' },
    114: { answer: 'D', explanation: 'বর্তমানে জোটনিরপেক্ষ আন্দোলন (NAM)-এর সদস্য সংখ্যা ১২০।' }
  },
  'bcs_37': {
    82: { answer: 'D', explanation: 'বিবিএস-এর প্রাক্কলন অনুযায়ী ২০১৫-১৬ অর্থবছরে বাংলাদেশের জিডিপি প্রবৃদ্ধির হার ছিল ৭.০৫%।' },
    181: { answer: 'D', explanation: 'LOYAL→JOWAJ প্যাটার্ন: প্রতি বিজোড় অবস্থানের অক্ষর ২ ঘর পিছিয়ে, জোড় অবস্থানের অক্ষর অপরিবর্তিত। PRONE→NRMNC।' }
  },
  'bcs_38': {
    26: { answer: 'D', explanation: '"স্বায়ত্তশাসন" শুদ্ধ বানান। অপশনের মধ্যে (ঘ) নিকটতম।' },
    57: { answer: 'C', explanation: 'Alexander Pope-র "The Rape of the Lock" একটি mock-heroic poem।' },
    58: { answer: 'B', explanation: 'W.B. Yeats আইরিশ কবি, আমেরিকান নন।' },
    59: { answer: 'C', explanation: 'William Shakespeare ১৫৬৪ সালে জন্মগ্রহণ করেন।' },
    60: { answer: 'C', explanation: 'Tennyson-এর "In Memoriam" Arthur Henry Hallam-এর মৃত্যুতে রচিত।' },
    61: { answer: 'C', explanation: 'Marlowe-র "Doctor Faustus" নাটক থেকে নেওয়া।' },
    62: { answer: 'A', explanation: 'Shakespeare-র "Romeo and Juliet" নাটকের Juliet-এর উক্তি।' },
    63: { answer: 'B', explanation: 'Lord Byron-এর কবিতা থেকে নেওয়া।' },
    64: { answer: 'B', explanation: 'Edward Fitzgerald "Rubaiyat of Omar Khayyam" ইংরেজিতে অনুবাদ করেন।' },
    65: { answer: 'D', explanation: 'James Joyce-র "Ulysses" বিখ্যাত আধুনিকতাবাদী উপন্যাস।' },
    66: { answer: 'A', explanation: 'Guy de Maupassant-এর লেখা ছোটগল্প।' },
    67: { answer: 'B', explanation: 'Lady Macbeth "Macbeth" নাটকে বলেছেন।' },
    68: { answer: 'C', explanation: 'John Keats-এর "To Autumn" কবিতা থেকে।' },
    69: { answer: 'C', explanation: 'Emily Bronte-র "Wuthering Heights"-এর কেন্দ্রীয় চরিত্র Heathcliff।' },
    70: { answer: 'D', explanation: 'Tennyson-এর "Morte d\'Arthur" কবিতা থেকে।' },
    71: { answer: 'C', explanation: 'John Donne-এর লেখা প্রেমের কবিতা "The Good-Morrow"।' },
    84: { answer: 'A', explanation: 'বাংলাদেশ ইকোনমিক রিভিউ ২০১৬ অনুসারে শিশু মৃত্যুর হার ২৫ (প্রতি হাজার জীবিত জন্মে)।' }
  },
  'bcs_40': {
    79: { answer: 'C', explanation: '২০১৮ সালে বাংলাদেশের মাথাপিছু জিডিপি (নামমাত্র) ছিল ১,৭৫২ মার্কিন ডলার।' },
    103: { answer: 'C', explanation: 'সর্বশেষ মিউনিখ নিরাপত্তা সম্মেলন ১৫ ফেব্রুয়ারি, ২০১৯-এ অনুষ্ঠিত হয়।' },
    169: { answer: 'D', explanation: 'সবগুলো অপশনই মূলদ, প্রশ্নটি ত্রুটিপূর্ণ। √(27/48) = 3/4।' },
    182: { answer: 'B', explanation: 'অধঃ + গতি = অধঃগতি (বিসর্গ সন্ধি)।' },
    183: { answer: 'A', explanation: '"Indwelling" সঠিক বানান।' },
    184: { answer: 'B', explanation: '"ম" থেকে পাঁচটি পূর্বে "ন"।' },
    185: { answer: 'C', explanation: 'ABC = ZYX (উল্টো ক্রম) → GIVV = TREE।' },
    186: { answer: 'B', explanation: 'রোলার টেনে নেওয়া সহজ (ঘর্ষণ কম)।' },
    187: { answer: 'D', explanation: '0.1 × 0.01 × 0.001 = 0.000001' },
    188: { answer: 'D', explanation: 'G=৭ম, চ=৬ষ্ঠ, ৬×৭=৪২। J=১০ম, ট=১১তম, ১০×১১=১১০।' },
    189: { answer: 'D', explanation: '"আবশ্যক, মিথস্ক্রিয়া, গীতালি" তিনটির বানানই শুদ্ধ। অন্যগুলোর অশুদ্ধরূপ: অহোরাত্র, অদ্যাপি, গড্ডলিকা, কল্যাণ, গৃহস্থ, ইদানীং।' },
    190: { answer: 'D', explanation: 'মোট N=১৬, E=১২, দূরত্ব=√(১৬²+১২²)=২০ মাইল।' },
    191: { answer: 'D', explanation: 'পৃথিবীর আবর্তনের সাথে সরাসরি সম্পর্ক নেই; বরং সময় অঞ্চল পরিবর্তন ও আকাশপথে পূর্বমুখী যাত্রার কারণে দিনের সময় খাটো মনে হয়।' }
  },
  'bcs_48_1': {
    26: { answer: 'C', explanation: 'প্রদত্ত চিত্রে মোট ৬টি ত্রিভুজ আছে।' }
  }
};

// ===== bcs_36 Q114: fix option value (D should be 120 not 21) =====
const fixOptionValues = {
  'bcs_36': {
    114: { D: '১২০' }
  }
};

// ===== bcs_37: Answers inferred from explanation that clearly state the answer =====
const bcs37ExplanationAnswers = {
  47: { answer: 'A' },
  48: { answer: 'B' },
  53: { answer: 'A' },
  61: { answer: 'B' },
  68: { answer: 'B' },
  109: { answer: 'A' },
  145: { answer: 'A' },
  152: { answer: 'B' },
  172: { answer: 'D' },
  173: { answer: 'C' },
  178: { answer: 'B' },
  182: { answer: 'A' }
};

const bcs37ExplanationUpdates = {
  157: { answer: 'C', explanation: 'প্রতি ডিমের ক্রয়মূল্য ১০ টাকা, বিক্রয়মূল্য ১২.৫ টাকা। লাভ = ২৫%।' },
  160: { answer: 'C', explanation: 'ধরি সংখ্যা 10x+y। 10y+x-(10x+y)=54 → y-x=6। x+y=12 → x=3,y=9 → 39।' },
  161: { answer: 'B', explanation: 'a+50=52 → a=2। 15তম = 2+140=142।' },
  162: { answer: 'A', explanation: 'a r²=20, a r⁵=160 → r³=8 → r=2 → a=5।' },
  164: { answer: 'D', explanation: 'দৈর্ঘ্য=√(225-100)=5√5, ক্ষেত্রফল=10×5√5=50√5 বর্গমিটার।' },
  167: { answer: 'B', explanation: '2টি একজাতীয়, 8টি ভিন্ন। 5টি বাছাই = ⁸C₅+⁸C₄+⁸C₃ = 56+70+56=182।' },
  168: { answer: 'A', explanation: 'P(সাদা নয়)=1-8/24=16/24=2/3।' }
};

// ===== CANCELLED questions =====
const cancelledIds = {
  'bcs_42': [62], 'bcs_43': [25], 'bcs_44': [11],
  'bcs_45': [109], 'bcs_46': [30, 97], 'bcs_47': [110], 'bcs_49': [64]
};

// ===== Non-standard answers that need review marking =====
const needsReview = {
  'bcs_41': [62, 64, 70, 79, 80, 165],
  'bcs_42': [68, 82],
  'bcs_43': [64, 65, 66, 68, 173],
  'bcs_44': [27, 43],
  'bcs_45': [61, 103, 106],
  'bcs_46': [2, 11, 49],
  'bcs_37': [155, 156, 158, 159],
  'bcs_48_1': [19, 26, 86, 89]
};

// ===== Empty options fixes =====
const emptyOptionFixes = {
  'bcs_36': { 5: { B: '' }, 149: { B: '' }, 179: { D: '' } },
  'bcs_38': { 20: { B: '' }, 164: { B: '' } },
  'bcs_40': { 71: { B: '' }, 77: { B: '' }, 98: { A: '', B: '', C: '' }, 102: { A: '' }, 122: { B: '' } },
  'bcs_42': { 40: { C: '', D: '' } },
  'bcs_42_med': { 35: { A: '' }, 82: { C: '' } },
  'bcs_43': { 69: { A: '', C: '', D: '' } },
  'bcs_44': { 92: { B: '' }, 94: { C: '' }, 99: { A: '', B: '', C: '' }, 100: { A: '', B: '', C: '' } },
  'bcs_45': { 101: { A: '', C: '', D: '' }, 111: { A: '', B: '', C: '' } },
  'bcs_46': { 79: { D: '' }, 123: { B: '' } },
  'bcs_48_1': { 3: { D: '' }, 19: { A: '', B: '' }, 89: { A: '', B: '' } }
};

// ===== Main fix logic =====
let totalAnsFixed = 0;
let totalExpFixed = 0;
let totalCancelled = 0;
let totalOptFixed = 0;
let totalFilesChanged = 0;

const examFiles = fs.readdirSync(BCS_DIR).filter(f => f.match(/^bcs_\d+.*\.json$/) && f !== 'index.json');

for (const fileName of examFiles) {
  const examKey = fileName.replace('.json', '');
  const jsonPath = path.join(BCS_DIR, fileName);
  const questions = loadJSON(jsonPath);
  let fileChanged = false;

  for (const q of questions) {
    const id = q.id;
    let changed = false;

    // 0. Fix option values (before setting answers)
    if (fixOptionValues[examKey] && fixOptionValues[examKey][id]) {
      for (const [opt, val] of Object.entries(fixOptionValues[examKey][id])) {
        if (q.options[opt] !== val) {
          q.options[opt] = val;
          changed = true;
        }
      }
    }

    // 1. Fix known answers from hardcoded data
    if (knownFixes[examKey] && knownFixes[examKey][id]) {
      const fix = knownFixes[examKey][id];
      if (!q.answer || q.answer === '') {
        q.answer = fix.answer;
        totalAnsFixed++;
        changed = true;
      }
      if ((!q.explanation || q.explanation.trim() === '') && fix.explanation) {
        q.explanation = fix.explanation;
        totalExpFixed++;
        changed = true;
      }
    }

    // 2. Fix bcs_37 answers inferred from explanations
    if (examKey === 'bcs_37') {
      if (bcs37ExplanationAnswers[id] && (!q.answer || q.answer === '')) {
        q.answer = bcs37ExplanationAnswers[id].answer;
        totalAnsFixed++;
        changed = true;
      }
      if (bcs37ExplanationUpdates[id]) {
        if (!q.answer || q.answer === '') {
          q.answer = bcs37ExplanationUpdates[id].answer;
          totalAnsFixed++;
          changed = true;
        }
        if ((!q.explanation || q.explanation.trim() === '') && bcs37ExplanationUpdates[id].explanation) {
          q.explanation = bcs37ExplanationUpdates[id].explanation;
          totalExpFixed++;
          changed = true;
        }
      }
    }

    // 3. Mark CANCELLED questions
    if (cancelledIds[examKey] && cancelledIds[examKey].includes(id)) {
      if (!q.cancelled) {
        q.cancelled = true;
        totalCancelled++;
        changed = true;
      }
      if (!q.answer || q.answer === '' || q.answer === 'CANCELLED') {
        const keys = Object.keys(q.options || {}).filter(k => q.options[k] && q.options[k].trim());
        if (keys.length > 0) {
          q.answer = keys[0];
          totalAnsFixed++;
          changed = true;
        }
      }
    }

    // 4. Fix non-standard answers
    if (q.answer && !/^[A-D]$/.test(q.answer) && q.answer !== 'CANCELLED') {
      if (needsReview[examKey] && needsReview[examKey].includes(id)) {
        if (!q.needs_review) {
          q.needs_review = true;
          changed = true;
        }
      } else {
        const ansText = q.answer.trim();
        for (const [optKey, optVal] of Object.entries(q.options)) {
          if (optVal && optVal.trim() === ansText) {
            q.answer = optKey;
            totalAnsFixed++;
            changed = true;
            break;
          }
        }
      }
    }

    // 5. Fill empty options
    if (emptyOptionFixes[examKey] && emptyOptionFixes[examKey][id]) {
      for (const [opt, val] of Object.entries(emptyOptionFixes[examKey][id])) {
        if (!q.options[opt] || q.options[opt].trim() === '') {
          q.options[opt] = val || 'অপশন সংযোজন করা হবে';
          totalOptFixed++;
          changed = true;
        }
      }
    }

    // 6. Add default explanation for completely empty explanations in bulk-empty files
    if ((!q.explanation || q.explanation.trim() === '') && q.answer && /^[A-D]$/.test(q.answer)) {
      if (['bcs_35', 'bcs_36', 'bcs_38', 'bcs_40'].includes(examKey)) {
        q.explanation = 'উত্তর নির্ণয়ের জন্য বিস্তারিত ব্যাখ্যা সংযোজন করা হবে।';
        totalExpFixed++;
        changed = true;
      }
    }

    if (changed) fileChanged = true;
  }

  if (fileChanged) {
    saveJSON(jsonPath, questions);
    console.log(`  Fixed ${fileName}`);
    totalFilesChanged++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Files changed: ${totalFilesChanged}`);
console.log(`Answers fixed: ${totalAnsFixed}`);
console.log(`Cancelled marked: ${totalCancelled}`);
console.log(`Explanations filled: ${totalExpFixed}`);
console.log(`Empty options filled: ${totalOptFixed}`);

// ===== Rebuild index.json =====
console.log(`\n=== Rebuilding index.json ===`);
const index = [];
for (const fileName of examFiles) {
  const examKey = fileName.replace('.json', '');
  const jsonPath = path.join(BCS_DIR, fileName);
  const questions = loadJSON(jsonPath);

  const codeMap = {
    bcs_35: '', bcs_36: '', bcs_37: '', bcs_38: '', bcs_40: '',
    bcs_41: 'হাসনাহেনা', bcs_42: 'সুরমা', bcs_42_med: '০১',
    bcs_43: 'নীলকণ্ঠ', bcs_44: 'হেমন্ত', bcs_45: 'মনপুরা',
    bcs_46: 'কপোতাক্ষ', bcs_47: '', bcs_48_1: '', bcs_48_2: '', bcs_49: ''
  };
  const nameMap = {
    bcs_35: '35th BCS', bcs_36: '36th BCS', bcs_37: '37th BCS',
    bcs_38: '38th BCS', bcs_40: '40th BCS', bcs_41: '41st BCS',
    bcs_42: '42nd BCS (General)', bcs_42_med: '42nd BCS (Medical)',
    bcs_43: '43rd BCS', bcs_44: '44th BCS', bcs_45: '45th BCS',
    bcs_46: '46th BCS', bcs_47: '47th BCS',
    bcs_48_1: '48th BCS (Part-1)', bcs_48_2: '48th BCS (Part-2 Medical)',
    bcs_49: '49th BCS'
  };

  index.push({
    id: examKey,
    name: nameMap[examKey] || examKey,
    code: codeMap[examKey] || '',
    questionCount: questions.length
  });
}

saveJSON(path.join(BCS_DIR, 'index.json'), index);
console.log(`  index.json updated with ${index.length} entries`);
console.log(`\n✅ Done.`);
