const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\docs\\hsc\\production 2nd';
const destDir = 'c:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\public\\hsc\\production_2nd\\english';

for (let i = 1; i <= 10; i++) {
    const srcFile = path.join(srcDir, `english chap ${i}.json`);
    const destFile = path.join(destDir, `chapter_${i}.json`);
    
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${srcFile} to ${destFile}`);
    } else {
        console.log(`Warning: ${srcFile} not found.`);
    }
}

// Now update index.json
const indexPath = 'c:\\Users\\User\\OneDrive\\Documents\\80-20 exam\\public\\hsc\\index.json';
let indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

indexData.subjects.forEach(subject => {
    if (subject.id === 'production_2nd') {
        subject.topics.forEach(topic => {
            const chapterMatch = topic.id.match(/\d+/);
            if (chapterMatch) {
                const chapterNum = chapterMatch[0];
                topic.chapters.forEach(chapter => {
                    chapter.file_en = `/hsc/production_2nd/english/chapter_${chapterNum}.json`;
                });
            }
        });
    }
});

fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');
console.log('Updated index.json with English file paths for Production 2nd Paper.');
