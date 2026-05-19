const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/hsc/production_2nd/production_2nd_complete.json', 'utf8'));
const questions = {};
data.forEach(q => {
    if (questions[q.question]) {
        console.log(`Duplicate Question Text found: Q${q.id} matches Q${questions[q.question]}`);
    } else {
        questions[q.question] = q.id;
    }
});
