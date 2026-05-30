const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/hsc/production_2nd/production_2nd_complete.json', 'utf8'));
const errors = [];

data.forEach(q => {
    // 1. Missing basic fields
    if(!q.id || !q.question || !q.options || !q.answer) {
        errors.push(`Q${q.id || 'unknown'}: Missing basic fields`);
    }

    // 2. Options check
    const keys = Object.keys(q.options || {});
    if(keys.length < 4) {
        errors.push(`Q${q.id}: Fewer than 4 options (${keys.length} found)`);
    }

    // 3. Answer validity
    if(!keys.includes(q.answer)) {
        errors.push(`Q${q.id}: Answer '${q.answer}' is not one of the options [${keys.join(',')}]`);
    }

    // 4. Content quality
    if(!q.explanation || q.explanation.trim().length < 10) {
        errors.push(`Q${q.id}: Missing or very short explanation`);
    }

    // 5. Sub-option consistency
    // If options contain roman numerals but question doesn't, or vice-versa
    const hasRomanInOptions = Object.values(q.options).some(v => v.includes('i.') || v.includes('ii.') || v.includes('iii.'));
    const hasRomanInQuestion = q.question.includes('i.') || q.question.includes('ii.') || q.question.includes('iii.');
    
    if (hasRomanInOptions && !hasRomanInQuestion) {
        // Many MCQ formats have options like "i ও ii" which is fine, 
        // but if the question mentions i, ii, iii it should be in the text.
        // We already fixed many, let's see if any are left.
    }
    
    // Check for placeholder text
    if (q.question.includes('???') || q.explanation.includes('???')) {
        errors.push(`Q${q.id}: Contains placeholder '???'`);
    }
});

if (errors.length === 0) {
    console.log('No structural errors or missing data found.');
} else {
    console.log(`Found ${errors.length} potential issues:`);
    errors.forEach(err => console.log(`- ${err}`));
}
