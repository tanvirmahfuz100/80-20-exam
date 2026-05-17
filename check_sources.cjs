const fs = require('fs');
const path = require('path');

const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBn(n) {
    return n.toString().split('').map(d => bnNums[d] || d).join('');
}

const basePath = 'public/hsc/production_2nd';
const files = fs.readdirSync(basePath).filter(f => f.startsWith('chapter_'));

files.forEach(file => {
    const chapterNum = file.match(/\d+/)[0];
    const bnChapterNum = toBn(chapterNum);
    const data = JSON.parse(fs.readFileSync(path.join(basePath, file), 'utf8'));
    data.forEach(q => {
        if (!q.source.includes(`অধ্যায়-${bnChapterNum}`)) {
            console.log(`Source Error: Q${q.id} in ${file} has source '${q.source}' but expected 'অধ্যায়-${bnChapterNum}'`);
        }
    });
});
