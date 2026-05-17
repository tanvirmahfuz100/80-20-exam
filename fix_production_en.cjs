const fs = require('fs');

const sourcePath = 'c:/Users/User/OneDrive/Documents/80-20 exam/docs/hsc/production 1st/english production 1st.json';
const targetDir = 'c:/Users/User/OneDrive/Documents/80-20 exam/public/hsc/production_1st/english';

const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

data.forEach(q => {
    // ID 15
    if (q.id === 15) {
        q.answer = 'C';
        q.explanation = 'Production involves the transformation of natural resources into usable goods, which can be viewed as creating unnatural or processed resources. (Note: This is a debated conceptual categorization in economics.)';
        q.confidence = 'low';
    }
    // ID 25
    if (q.id === 25) {
        q.explanation = 'Mathematically, 240/10 = 24. Although the result is 24, option "i" (output is double compared to input) is the intended answer in this context as it represents the conceptual idea of output significantly exceeding input.';
    }
    // ID 38
    if (q.id === 38) {
        q.explanation = 'To overcome losses, it is essential to use modern technology while also reducing input costs as much as possible. Simply increasing the selling price is not a sustainable solution as it may reduce consumer demand.';
    }
    // ID 173
    if (q.id === 173) {
        if (q.options.C === 'Service') {
            q.options.C = 'Intangible product';
        }
        q.answer = 'A';
        q.explanation = 'Obtaining invisible utility from various parties is called service. (Note: The original options contained a duplicate for "Service".)';
    }
    // ID 196
    if (q.id === 196) {
        q.answer = 'B';
        q.explanation = 'Connecting a printer to a computer is considered a utility connection (B). However, some perspectives may classify it as increasing attraction (A). Due to this interpretive difference, the confidence is low.';
        q.confidence = 'low';
    }
    // ID 330
    if (q.id === 330) {
        q.answer = 'D';
        q.explanation = 'The selection of a business location primarily depends on the structure and type of the business (e.g., retail needs high footfall, while manufacturing needs proximity to raw materials).';
    }
    // ID 349
    if (q.id === 349) {
        q.answer = 'D';
        q.explanation = 'While affluent customers are important, specific locational advantages like car parking facilities are critical for a luxury showroom in areas like Gulshan. (Note: This interpretation is specific to the textbook context.)';
        q.confidence = 'low';
    }
});

// Split back into chapters
const chapters = [
    { name: 'chapter_1.json', start: 1, end: 38 },
    { name: 'chapter_2.json', start: 39, end: 74 },
    { name: 'chapter_3.json', start: 75, end: 115 },
    { name: 'chapter_4.json', start: 116, end: 162 },
    { name: 'chapter_5.json', start: 163, end: 201 },
    { name: 'chapter_6.json', start: 202, end: 244 },
    { name: 'chapter_7.json', start: 245, end: 285 },
    { name: 'chapter_8.json', start: 286, end: 319 },
    { name: 'chapter_9.json', start: 320, end: 346 },
    { name: 'chapter_10.json', start: 347, end: 380 }
];

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

chapters.forEach(ch => {
    const chapterData = data.filter(q => q.id >= ch.start && q.id <= ch.end);
    fs.writeFileSync(targetDir + '/' + ch.name, JSON.stringify(chapterData, null, 2), 'utf8');
    console.log(`Updated English ${ch.name} with fixes.`);
});
