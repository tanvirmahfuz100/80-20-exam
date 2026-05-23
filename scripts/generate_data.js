import fs from 'fs';
import path from 'path';

const catalogs = ['ssc', 'hsc', 'iba', 'bcs'];
const publicDir = path.join(process.cwd(), 'public');

catalogs.forEach(cat => {
    const catDir = path.join(publicDir, cat);
    if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true });
    
    const indexFile = path.join(catDir, 'index.json');
    if (!fs.existsSync(indexFile)) {
        fs.writeFileSync(indexFile, JSON.stringify({ subjects: [] }, null, 2));
        console.log('Created index:', cat + '/index.json');
    } else {
        const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
        if (indexData.subjects) {
            indexData.subjects.forEach(subject => {
                if (subject.topics) {
                    subject.topics.forEach(topic => {
                        if (topic.chapters) {
                            topic.chapters.forEach(chapter => {
                                const filePath = chapter.file;
                                if (filePath) {
                                    // Remove leading slash if present
                                    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
                                    const fullPath = path.join(publicDir, relativePath);
                                    
                                    if (!fs.existsSync(fullPath)) {
                                        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                                        fs.writeFileSync(fullPath, JSON.stringify({
                                            subject: subject.name,
                                            topic: topic.name,
                                            chapter: chapter.name,
                                            questions: []
                                        }, null, 2));
                                        console.log('Created missing chapter file:', relativePath);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    }
});
console.log('Done generating missing files.');
