/**
 * CQ answer fix — hardcoded extraction.
 * Each range is [start, end) in 0-indexed array offsets.
 */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'docs', 'ssc', 'business_entreprenuership_chap1.txt');
const CQ_PATH = path.join(__dirname, '..', 'public', 'ssc', 'business_entrepreneurship', 'chapter_1_cq.json');

const lines = readFileSync(SRC, 'utf-8').split('\n');
const cqJson = JSON.parse(readFileSync(CQ_PATH, 'utf-8'));

function cleanQ(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function extract(start, end) {
  const parts = [];
  for (let i = start; i < end && i < lines.length; i++) {
    let l = lines[i].replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    if (!l) continue;
    if (l.match(/^▶?\s*শিখনফল/) || l.match(/^পৃষ্ঠা\s+/) || l.match(/^অধ্যায়/) ||
        l.match(/^লেকচার/) || l.match(/LPL/) || l.match(/^\d+\s*$/) || l.match(/^[:;]$/) ||
        l.match(/^প্রথম\s+অধ্যায়/) || l.match(/^সকল\s+বোর্ডের/) || l.match(/^শীর্ষস্থানীয়/) ||
        l.match(/^মাস্টার\s+ট্রেইনার/) || l.match(/^প্রশ্ন\s/) ||
        l.match(/নং প্রশ্নের উত্তর/) || l.match(/^পাঠ্যবইয়ের/) ||
        l.match(/^প্রশ্নের\s+\d+/) || l.match(/^প্রথম\s+অধ্যায়/) ||
        l.match(/^প্রশ্ন\s+\d+/) || l.match(/^90<4$/) || l.match(/^[:;:]$/) ||
        l.match(/^[:;]$/) || l.match(/^[8৬](\s*)$/)) continue;
    if (l.match(/^[কখগঘ][\.\)]\s*.+\?/)) continue;
    l = l.replace(/^কমধ্যযুগে/, 'মধ্যযুগে')
         .replace(/^কপর্তুগিজরা/, 'পর্তুগিজরা')
         .replace(/^ঘউদ্দীপকে/, 'উদ্দীপকে')
         .replace(/^গউদ্দীপকের\s*/, '')
         .replace(/^যজনাব/, 'জনাব')
         .replace(/^ঘমি\./, 'মি.')
         .replace(/^য\s+মি\./, 'মি.')
         .replace(/^ব\s+/, '');
    l = l.replace(/^[কখগঘ]\s+/, '');
    l = l.replace(/^য\s+/, '');
    l = l.replace(/^[\u09E6-\u09EF]+\s*/, '');
    if (l) parts.push(l);
  }
  return cleanQ(parts.join(' '));
}

// 0-indexed line ranges, verified from source
// Format: { label: [start, end) }
const ANSWERS = {
  // CQ 1: header=2570, next=2635
  1: {
    ক: extract(2571, 2572),
    খ: extract(2573, 2585),
    গ: extract(2585, 2600),
    ঘ: extract(2600, 2621),
  },

  // CQ 2: header=2635, next=2709
  2: {
    ক: extract(2636, 2638),
    খ: extract(2638, 2652),
    গ: extract(2652, 2669),
    ঘ: extract(2669, 2693),
  },

  // CQ 3: header=2709, next=2762
  3: {
    ক: extract(2710, 2712),
    খ: extract(2712, 2719),
    গ: extract(2719, 2732),
    ঘ: extract(2733, 2750),
  },

  // CQ 4: header=2762, next=2823
  4: {
    ক: extract(2765, 2769),
    খ: extract(2770, 2777),
    গ: extract(2777, 2786),
    ঘ: extract(2786, 2823),
  },

  // CQ 5: header=2823, next=2867
  5: {
    ক: extract(2826, 2828),
    খ: extract(2828, 2832),
    গ: extract(2832, 2841),
    ঘ: extract(2841, 2867),
  },

  // CQ 6: header=2867, next=2926
  6: {
    ক: extract(2868, 2870),
    খ: extract(2870, 2879),
    গ: extract(2879, 2890),
    ঘ: extract(2890, 2926),
  },

  // CQ 7: header=2926, next=2985
  7: {
    ক: extract(2927, 2930),
    খ: extract(2930, 2936),
    গ: extract(2936, 2951),
    ঘ: extract(2951, 2985),
  },

  // CQ 8: header=2985, next=3036
  8: {
    ক: extract(2986, 2988),
    খ: extract(2988, 2996),
    গ: extract(2996, 3005),
    ঘ: extract(3005, 3036),
  },

  // CQ 9: header=3036, next=3091
  9: {
    ক: extract(3037, 3039),
    খ: extract(3039, 3045),
    গ: extract(3045, 3058),
    ঘ: extract(3058, 3078),
  },

  // CQ 10: header=3091, next=3186
  10: {
    ক: extract(3092, 3094),
    খ: extract(3094, 3103),
    গ: extract(3103, 3114),
    ঘ: extract(3114, 3138),
  },

  // CQ 13: header=3258, next=3313
  13: {
    ক: extract(3259, 3261),
    খ: extract(3261, 3271),
    গ: extract(3271, 3281),
    ঘ: extract(3281, 3313),
  },

  // CQ 14: header=3313, next=3361
  14: {
    ক: extract(3314, 3316),
    খ: extract(3316, 3324),
    গ: extract(3324, 3332),
    ঘ: extract(3332, 3350),
  },

  // CQ 15: header=3361, next=3418
  15: {
    ক: extract(3362, 3363),
    খ: extract(3363, 3369),
    গ: extract(3369, 3380),
    ঘ: extract(3380, 3400),
  },

  // CQ 16: header=3418, next=3476
  16: {
    ক: extract(3421, 3423),
    খ: extract(3423, 3429),
    গ: extract(3429, 3443),
    ঘ: extract(3443, 3462),
  },
};

// Apply
cqJson.questions.forEach(cq => {
  const ans = ANSWERS[cq.id];
  if (!ans) {
    console.log(`CQ ${cq.id}: NOT IN DEFINITION`);
    return;
  }

  const oldKeys = Object.keys(cq.answer || {}).sort().join(',');
  const newKeys = Object.keys(ans).sort().join(',');
  cq.answer = ans;
  console.log(`CQ ${cq.id}: [${oldKeys}] → [${newKeys}]`);
});

writeFileSync(CQ_PATH, JSON.stringify(cqJson, null, 2), 'utf-8');
console.log(`\n✓ Done`);
