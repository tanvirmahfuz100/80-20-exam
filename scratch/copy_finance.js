const fs = require('fs');
const path = require('path');

const srcDir = 'docs/hsc/finance 2nd';
const destDir = 'public/hsc/finance_2nd';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

for (let i = 1; i <= 13; i++) {
    const srcFile = path.join(srcDir, `ban chap ${i}.json`);
    const destFile = path.join(destDir, `chapter_${i}.json`);
    
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${srcFile} to ${destFile}`);
    } else {
        console.log(`Source file ${srcFile} not found`);
    }
}
