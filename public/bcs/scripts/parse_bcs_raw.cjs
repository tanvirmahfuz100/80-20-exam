const fs = require('fs');
const path = require('path');

const scratchDir = path.join(__dirname, 'scratch');
const outDir = path.join(__dirname, 'public', 'bcs');

fs.mkdirSync(outDir, { recursive: true });

// Map filename to exam key
const fileExamMap = {
  'raw_bcs_questions.txt':  { exam: 'bcs_47',       code: '' },
  'raw_bcs_49.txt':         { exam: 'bcs_49',       code: '' },
  'raw_bcs_48_1.txt':       { exam: 'bcs_48_1',     code: '' },
  'raw_bcs_48_2.txt':       { exam: 'bcs_48_2',     code: '' },
  'raw_bcs_46.txt':         { exam: 'bcs_46',       code: '' },
  'raw_bcs_45.txt':         { exam: 'bcs_45',       code: '' },
  'raw_bcs_44.txt':         { exam: 'bcs_44',       code: '' },
  'raw_bcs_43.txt':         { exam: 'bcs_43',       code: '' },
  'raw_bcs_42.txt':         { exam: 'bcs_42',       code: '' },
  'raw_bcs_41.txt':         { exam: 'bcs_41',       code: '' },
};

// Map exam key to display name
const examNames = {
  'bcs_47': '47th BCS',
  'bcs_49': '49th BCS',
  'bcs_48_1': '48th BCS (Part-1)',
  'bcs_48_2': '48th BCS (Part-2 Medical)',
  'bcs_46': '46th BCS',
  'bcs_45': '45th BCS',
  'bcs_44': '44th BCS',
  'bcs_43': '43rd BCS',
  'bcs_42': '42nd BCS (General)',
  'bcs_42_med': '42nd BCS (Medical)',
  'bcs_41': '41st BCS',
};

const allQuestions = {};

for (const [fileName, { exam: examKey, code }] of Object.entries(fileExamMap)) {
  const filePath = path.join(scratchDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${fileName} (not found)`);
    continue;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');

  // If the file has # BCS header, remove everything before the first #### Question
  let content = raw;
  const firstQ = content.match(/####\s*Question\s+\d+/);
  if (firstQ) {
    content = content.slice(firstQ.index);
  } else {
    console.log(`  Warning: No questions found in ${fileName}`);
    continue;
  }

  // Extract code name if present (search in the original raw text before the first question)
  const codeMatch = raw.match(/##\s*কোড\s*:\s*(\S+)/);
  const codeName = codeMatch ? codeMatch[1] : '';

  // Split into individual questions
  const questionBlocks = content.split(/(?=####\s*Question\s+\d+)/);
  const questions = [];

  for (const qb of questionBlocks) {
    const qMatch = qb.match(/####\s*Question\s+(\d+)/);
    if (!qMatch) continue;

    const qId = parseInt(qMatch[1]);
    const lines = qb.split('\n').map(l => l.trim()).filter(l => l);

    let questionText = '';
    const options = { A: '', B: '', C: '', D: '' };
    let currentOption = null;

    for (const line of lines) {
      if (line.startsWith('- A') || line.startsWith('–A')) {
        currentOption = 'A';
        options.A = line.replace(/^[-–]\s*A\s*/, '').trim();
      } else if (line.startsWith('- B') || line.startsWith('–B')) {
        currentOption = 'B';
        options.B = line.replace(/^[-–]\s*B\s*/, '').trim();
      } else if (line.startsWith('- C') || line.startsWith('–C')) {
        currentOption = 'C';
        options.C = line.replace(/^[-–]\s*C\s*/, '').trim();
      } else if (line.startsWith('- D') || line.startsWith('–D')) {
        currentOption = 'D';
        options.D = line.replace(/^[-–]\s*D\s*/, '').trim();
      } else if (!line.match(/^####\s*Question/)) {
        if (currentOption === null) {
          questionText += (questionText ? ' ' : '') + line;
        }
      }
    }

    if (questionText && (options.A || options.B || options.C || options.D)) {
      questions.push({
        id: qId,
        question: questionText,
        options: { A: options.A, B: options.B, C: options.C, D: options.D },
        answer: '',
        explanation: ''
      });
    }
  }

  // For BCS 42, split into general and medical based on content
  if (examKey === 'bcs_42') {
    const medStartIdx = questions.findIndex(q =>
      q.question.includes('cardiac tamponade') ||
      q.question.includes('short stature') ||
      q.question.includes('Bleeding time')
    );

    if (medStartIdx > 0) {
      const generalQs = questions.slice(0, medStartIdx);
      const medQs = questions.slice(medStartIdx);

      allQuestions['bcs_42'] = {
        code: codeName || 'সুরমা',
        questions: generalQs,
        display: examNames['bcs_42']
      };
      allQuestions['bcs_42_med'] = {
        code: '০১',
        questions: medQs,
        display: examNames['bcs_42_med']
      };
      console.log(`${fileName}: split into ${generalQs.length} general + ${medQs.length} medical questions`);
      continue;
    }
  }

  allQuestions[examKey] = {
    code: codeName,
    questions,
    display: examNames[examKey] || examKey
  };
  console.log(`${fileName}: ${questions.length} questions`);
}

// Write each exam to JSON
for (const [key, data] of Object.entries(allQuestions)) {
  const { questions } = data;

  const jsonPath = path.join(outDir, `${key}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`  → ${jsonPath}`);
}

// Generate index.json
const index = [];
for (const [key, data] of Object.entries(allQuestions)) {
  index.push({
    id: key,
    name: data.display || key,
    code: data.code || '',
    questionCount: data.questions.length
  });
}
index.sort((a, b) => {
  const numA = parseInt(a.id.replace(/\D/g, ''));
  const numB = parseInt(b.id.replace(/\D/g, ''));
  return numB - numA;
});

const indexPath = path.join(outDir, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
console.log(`\nWrote index → ${indexPath}`);

console.log('\n=== SUMMARY ===');
for (const entry of index) {
  console.log(`${entry.id}.json → ${entry.questionCount} questions (${entry.name})`);
}
