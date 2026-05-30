const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetch('https://www.chakribangla.com/bcs-question-solution/28-bcs.html').then(html => {
  const allDivs = html.match(/<div[^>]*>/g) || [];
  const qBlocks = allDivs.filter(d => d.includes('question-block'));
  console.log('Total divs:', allDivs.length);
  console.log('Divs with question-block:', qBlocks.length);
  qBlocks.slice(-3).forEach((d, i) => console.log('Block', i, ':', JSON.stringify(d)));

  // Check last part of HTML for remaining blocks
  const lastDiv = html.lastIndexOf('<div');
  console.log('\nLast div at position:', lastDiv);
  console.log('HTML length:', html.length);
  console.log('Last 500 chars:', html.slice(-500).substring(0, 200));
});
