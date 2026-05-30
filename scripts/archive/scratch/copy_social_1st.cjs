const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'docs', 'hsc', 'social 1st');
const destDir = path.join(__dirname, '..', 'public', 'hsc', 'social_1st');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);

for (const file of files) {
    if (file.endsWith('.json')) {
        const match = file.match(/ban chap (\d+)\.json/i);
        if (match) {
            const chapterNum = match[1];
            const destFile = `chapter_${chapterNum}.json`;
            
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, destFile);
            
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${file} to ${destFile}`);
        }
    }
}
