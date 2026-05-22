const fs = require('fs');
const path = require('path');

const BCS_DIR = path.join(__dirname, 'dist', 'bcs');

const srcs = ['bcs_41','bcs_42','bcs_42_med','bcs_43','bcs_44','bcs_45','bcs_46','bcs_47','bcs_48_1','bcs_48_2','bcs_49'];

const examNames = {
  bcs_41: '41st BCS', bcs_42: '42nd BCS (General)', bcs_42_med: '42nd BCS (Medical)',
  bcs_43: '43rd BCS', bcs_44: '44th BCS', bcs_45: '45th BCS',
  bcs_46: '46th BCS', bcs_47: '47th BCS', bcs_48_1: '48th BCS (Part-1)',
  bcs_48_2: '48th BCS (Part-2 Medical)', bcs_49: '49th BCS'
};

// Known fixable answers (answer text -> correct option key)
const knownAnswers = {
  'bcs_41': {
    60: { answer: 'A', explanation: '∠C = 60°; ∠ACD = 30°; ∆ADC এ ∠A=40°, ∠ACD=30° → ∠CDA=110°।' },
    168: { answer: 'A', explanation: '১৯৫২ সালে পাকিস্তানের প্রধানমন্ত্রী ছিলেন খাজা নাজিমুদ্দিন।' }
  },
  'bcs_42': {
    38: { answer: 'D', explanation: 'বাংলাদেশের ছয় ঋতুর সঠিক অনুক্রম: গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত, শীত, বসন্ত।' },
    78: { answer: 'A', explanation: 'এটি একটি প্রচলিত প্রবাদ-প্রবচন।' }
  },
  'bcs_43': {
    20: { answer: 'A', explanation: 'জিবুতি লোহিত সাগর ও এডেন উপসাগরের তীরে অবস্থিত।' },
    169: { answer: 'A', explanation: 'ওরাওঁরা মূলত উত্তরবঙ্গ ও ভারতের ছোটনাগপুর অঞ্চলে বসবাস করে।' },
    173: { answer: 'C', explanation: 'মুজিবনগর সরকারের অর্থনীতি ও পরিকল্পনা বিভাগের দায়িত্বে ছিলেন এম. মনসুর আলী।' }
  },
  'bcs_44': {
    27: { answer: 'D', explanation: 'যৌগিক বাক্যে একাধিক স্বাধীন clause যুক্ত থাকে। "ছেলেটি চঞ্চল" ও "মেধাবী" — এখানে "তবে" দ্বারা দুটি স্বাধীন clause যুক্ত হয়েছে।' },
    43: { answer: 'C', explanation: 'ঈশ্বরী পাটুনী জসীম উদ্দীনের নক্সী কাঁথার মাঠ কাব্যের একটি চরিত্র, যিনি তার সন্তানের জন্য এই মনোবাঞ্ছা প্রকাশ করেন।' },
    147: { answer: 'C', explanation: '১৯৪৭ সালে ঢাকা বিশ্ববিদ্যালয়ের অধ্যাপক আবুল কাসেম তমদ্দুন মজলিশ প্রতিষ্ঠা করেন।' }
  },
  'bcs_46': {
    6: { answer: 'B', explanation: 'Total surface area = 2πr(r+h) = 2π·2·8 = 32π বর্গ সে.মি.' },
    149: { answer: 'A', explanation: 'COP28-এ জীবাশ্ম জ্বালানি থেকে উত্তরণ ও বৈশ্বিক মূল্যায়ন ছিল মূল ফোকাস।' }
  }
};

// Questions that were officially CANCELLED in the exam
const cancelledIds = {
  'bcs_42': [62], 'bcs_43': [25], 'bcs_44': [11],
  'bcs_45': [109], 'bcs_46': [30, 97], 'bcs_47': [110], 'bcs_49': [64]
};

// Questions needing human review (answer text doesn't match any option)
const needsReviewIds = {
  'bcs_41': [62, 64, 70, 79, 80, 165],
  'bcs_42': [68, 82],
  'bcs_43': [64, 65, 66, 68, 173],
  'bcs_44': [27, 43],
  'bcs_45': [61, 103, 106],
  'bcs_46': [2, 11, 49],
  'bcs_48_1': [19, 26, 86, 89]
};

// Missing explanations also need adding
const missingExplanations = {
  'bcs_41': [70, 79, 80],
  'bcs_42': [68, 82],
  'bcs_43': [65, 66, 173],
  'bcs_44': [27, 43],
  'bcs_45': [61, 103, 106],
  'bcs_46': [2, 11, 49],
  'bcs_49': [64]
};

srcs.forEach(src => {
  const filePath = path.join(BCS_DIR, src + '.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.forEach(q => {
    q.source = src;
    q.examName = examNames[src];

    const known = knownAnswers[src]?.[q.id];
    if (known) {
      q.answer = known.answer;
      q.explanation = known.explanation;
    }

    if (cancelledIds[src]?.includes(q.id)) {
      q.cancelled = true;
      // Set answer to first valid option so schema doesn't break
      const keys = Object.keys(q.options || {});
      if (keys.length > 0) q.answer = keys[0];
    }

    if (needsReviewIds[src]?.includes(q.id)) {
      q.needs_review = true;
    }

    // Add explanations for missing ones
    if (missingExplanations[src]?.includes(q.id) && (!q.explanation || q.explanation.trim().length < 5)) {
      q.explanation = q.explanation || 'উত্তর নির্ণয়ের জন্য পর্যাপ্ত তথ্য উপস্থিত নেই।';
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Fixed ${src}: ${data.length} questions`);
});

console.log('\nDone fixing BCS files.');
