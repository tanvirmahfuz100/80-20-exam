const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const bcsNumber = parseInt(process.argv[2]);
if (!bcsNumber || bcsNumber < 10 || bcsNumber > 50) {
  console.error('Usage: node scrape_grammarsbd.cjs <BCS number 10-50>');
  process.exit(1);
}

const URL = `https://www.grammarsbd.com/allBcsQuestion/${bcsNumber}bcs`;
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'bcs', `bcs_${bcsNumber}.json`);

function fetch(url) {
  return new Promise((resolve, reject) => {
    const fetcher = url.startsWith('https') ? https : http;
    fetcher.get(url, {
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
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '--')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseQuestions(html) {
  const parts = html.split(/<div class="Div58">/);
  parts.shift();

  console.log(`Found ${parts.length} question blocks`);

  const questions = parts.map((block, index) => {
    const qMatch = block.match(/<div class="Div59">\s*(?:\d+|[০১২৩৪৫৬৭৮৯]+)\.\s*(.*?)\s*<\/div>/);
    let question = qMatch ? qMatch[1].trim() : '';

    const options = { A: '', B: '', C: '', D: '' };
    const optMatches = [...block.matchAll(/<div class="Div60">\s*([a-dA-D])\.\s*(.*?)\s*<\/div>/g)];
    optMatches.forEach(m => {
      const idx = m[1].toUpperCase();
      options[idx] = htmlDecode(m[2]);
    });

    const ansMatch = block.match(/সঠিক উত্তর:\s*([a-dA-D])/);
    let answer = ansMatch ? ansMatch[1].toUpperCase() : '';
    if (block.includes('বাতিল') || block.includes('বাতিল')) answer = '';

    const expMatch = block.match(/<b>ব্যাখ্যা:<\/b>\s*([\s\S]*?)<\/p>/);
    let explanation = expMatch ? htmlDecode(expMatch[1]) : '';

    return {
      id: index + 1,
      question: htmlDecode(question),
      options,
      answer,
      explanation
    };
  });

  return questions;
}

async function main() {
  console.log(`Fetching ${URL}...`);
  const html = await fetch(URL);
  const questions = parseQuestions(html);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(questions, null, 2));
  console.log(`Written ${questions.length} questions to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
