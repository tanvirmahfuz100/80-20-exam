const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '..', 'bcs39_raw.md'), 'utf8');

const sections = raw.split(/# BCS 39 /).filter(s => s.trim());

for (const section of sections) {
  const lines = section.split('\n');
  const headerLine = lines[0].trim();
  const isMedical = headerLine.includes('Medical') || headerLine.includes('MBBS');
  const examKey = isMedical ? 'bcs_39_med' : 'bcs_39';

  const content = lines.slice(1).join('\n');
  const questionBlocks = content.split(/(?=#### Question \d+)/);

  const questions = [];

  for (const block of questionBlocks) {
    if (!block.trim()) continue;

    const idMatch = block.match(/#### Question (\d+)/);
    if (!idMatch) continue;
    const id = parseInt(idMatch[1]);

    const afterHeader = block.replace(/#### Question \d+\s*\n?/, '');

    const lines2 = afterHeader.split('\n');
    let questionLines = [];
    let options = { A: '', B: '', C: '', D: '' };
    let answer = '';
    let explanationLines = [];
    let mode = 'question';

    const optionKeys = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < lines2.length; i++) {
      const line = lines2[i];

      const optMatch = line.match(/^-\s*([A-D])\s+(.+)/);
      if (optMatch) {
        options[optMatch[1]] = optMatch[2].trim();
        if (mode === 'question') mode = 'options';
        continue;
      }

      const ansMatch = line.match(/^\*\*Correct Answer:\s*([A-D])\*\*/);
      if (ansMatch) {
        answer = ansMatch[1];
        mode = 'explanation';
        continue;
      }

      if (mode === 'question' && line.trim()) {
        questionLines.push(line);
      }

      if (mode === 'explanation') {
        const cleaned = line.replace(/^\*\*Explanation:\*\*/, '').trim();
        if (cleaned) explanationLines.push(cleaned);
      }
    }

    const question = questionLines.join(' ').replace(/\s+/g, ' ').trim();
    const explanation = explanationLines.join(' ').replace(/\s+/g, ' ').trim() || 'উত্তর নির্ণয়ের জন্য বিস্তারিত ব্যাখ্যা সংযোজন করা হবে।';

    questions.push({
      id,
      question,
      options,
      answer,
      explanation
    });
  }

  const outputPath = path.join(__dirname, '..', 'public', 'bcs', `${examKey}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2), 'utf8');
  console.log(`Written ${examKey}.json: ${questions.length} questions`);
}

console.log('Done.');
