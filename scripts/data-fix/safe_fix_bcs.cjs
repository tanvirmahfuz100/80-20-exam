const fs = require('fs');
const path = require('path');

const BCS_DIR = path.join(__dirname, '..', 'public', 'bcs');

// Only fix what we're 100% certain about from explanation + answer context
const fixes = {
  // bcs_43 Q69: x = 2+√3 হলে x³+1/x³ এর মান কত?
  // Explanation clearly shows: x = 2+√3, 1/x = 2-√3, x³+1/x³ = 52
  'bcs_43': [{
    id: 69,
    question: 'x = 2+√3 হলে, x³ + 1/x³ এর মান কত?'
  }],

  // bcs_46 Q4: 3x - y = 3 এবং 5x + y = 21 হলে, (x, y) এর মান -
  // Explanation: (3x-y)+(5x+y)=3+21 => 8x=24 => x=3, y=6
  'bcs_46': [
    {
      id: 4,
      question: '3x - y = 3 এবং 5x + y = 21 হলে, (x, y) এর মান -'
    },
    {
      id: 5,
      question: '150 এর নিচে 5 ও 7 দ্বারা বিভাজ্য সংখ্যাগুলোর সেট A হলে, P(A) এর সদস্য সংখ্যা কত?'
    },
    {
      id: 8,
      fixOptions: true,
      options: { A: '8π বর্গ সে.মি.', B: '৪π বর্গ সে.মি.', C: '2π বর্গ সে.মি.', D: '16π বর্গ সে.মি.' }
    }
  ],

  // bcs_35 Q97: Known question - which magazine called Bangabandhu "Poet of Politics"?
  // Options were: Time, The Economist, The Guardian, Newsweek
  'bcs_35': [{
    id: 97,
    fixOptions: true,
    options: { A: 'টাইম', B: 'ইকোনমিস্ট', C: 'দ্য গার্ডিয়ান', D: 'নিউজ উইকস' }
  }]
};

for (const [examKey, examFixes] of Object.entries(fixes)) {
  const jsonPath = path.join(BCS_DIR, `${examKey}.json`);
  if (!fs.existsSync(jsonPath)) continue;

  const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let changed = false;

  for (const fix of examFixes) {
    const q = questions.find(q => q.id === fix.id);
    if (!q) {
      console.log(`  ${examKey}: Q${fix.id} not found`);
      continue;
    }

    if (fix.question && q.question !== fix.question) {
      const stripped = q.question.replace(/\s+/g, '').trim();
      // Only replace if current question is truncated (starts with "হলে" without expression before it)
      const isTruncated = !stripped || stripped.length < 10 ||
        /^হলে/.test(stripped) || /^যদি\s*এবং\s*হয়$/.test(stripped) ||
        stripped === 'এরমানকত?' || stripped === 'সংখ্যাটি-' ||
        stripped.match(/^যদি\s+এবং\s+হয়[.,]?\s*তাহলে\s*$/);
      if (isTruncated) {
        console.log(`  ${examKey} Q${fix.id}: Fixed question text`);
        console.log(`    Old: "${q.question.substring(0, 80)}"`);
        console.log(`    New: "${fix.question.substring(0, 80)}"`);
        q.question = fix.question;
        changed = true;
      }
    }

    if (fix.fixOptions) {
      for (const [opt, val] of Object.entries(fix.options)) {
        if (!q.options[opt] || q.options[opt].trim() === '') {
          console.log(`  ${examKey} Q${fix.id}: Filled option ${opt}: "${val}"`);
          q.options[opt] = val;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf-8');
    console.log(`  → Updated ${examKey}.json\n`);
  }
}

console.log('Done. All fixes applied safely.');
