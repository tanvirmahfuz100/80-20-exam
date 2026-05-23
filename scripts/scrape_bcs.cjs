const https = require('https');
const fs = require('fs');
const path = require('path');

const bcsNumber = parseInt(process.argv[2]);
if (!bcsNumber || bcsNumber < 10 || bcsNumber > 50) {
  console.error('Usage: node scrape_bcs.cjs <BCS number 10-50>');
  process.exit(1);
}

const URL = `https://www.chakribangla.com/bcs-question-solution/${bcsNumber}-bcs.html`;
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'bcs', `bcs_${bcsNumber}.json`);

const letterMap = { 'ক': 'A', 'খ': 'B', 'গ': 'C', 'ঘ': 'D' };

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function htmlDecode(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, m => String.fromCharCode(m.replace(/&#(\d+);/, '$1')))
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '--');
}

async function main() {
  console.log(`Fetching ${URL}...`);
  const html = await fetch(URL);

    const parts = html.split(/<div[^>]*class="question-block"[^>]*>/);
  // Remove everything before the first block
  parts.shift();

  if (parts.length === 0) {
    console.error('No question blocks found');
    process.exit(1);
  }

  console.log(`Found ${parts.length} question blocks`);

  const questions = parts.map((part, index) => {
    const block = part + '</div>';
    const qMatch = block.match(/<strong>\s*(?:\d+|[০১২৩৪৫৬৭৮৯]+)\.\s*(.*?)\s*<\/strong>/);
    let question = qMatch ? qMatch[1].trim() : '';

    const optMatch = block.match(/<p[^>]*>\s*(\([কখগঘ]\)\s*.*?)\s*<\/p>/);
    const options = { A: '', B: '', C: '', D: '' };
    if (optMatch) {
      const optStr = optMatch[1];
      const opts = [...optStr.matchAll(/\(([কখগঘ])\)\s*([^(]+?)(?=\s*\([কখগঘ]\)|\s*$)/g)];
      opts.forEach(m => {
        options[letterMap[m[1]]] = m[2].trim().replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, "'");
      });
    }

    const ansMatch = block.match(/<p class="correct-answer">(?:\s*উত্তর|Answer)\s*:\s*\(([কখগঘ])\)/);
    let answer = ansMatch ? letterMap[ansMatch[1]] : '';
    if (block.includes('বাতিল')) answer = '';

    const expMatch = block.match(/<p class="explanation">(?:\s*ব্যাখ্যা|Explanation)\s*:\s*(.*?)<\/p>/);
    let explanation = expMatch ? expMatch[1].trim() : '';

    return {
      id: index + 1,
      question: htmlDecode(question),
      options: {
        A: htmlDecode(options.A),
        B: htmlDecode(options.B),
        C: htmlDecode(options.C),
        D: htmlDecode(options.D)
      },
      answer,
      explanation: htmlDecode(explanation)
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(questions, null, 2));
  console.log(`Written ${questions.length} questions to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
