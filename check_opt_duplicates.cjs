const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/hsc/production_2nd/production_2nd_complete.json', 'utf8'));
data.forEach(q => {
    const opts = Object.values(q.options);
    const uniqueOpts = new Set(opts);
    if (uniqueOpts.size < opts.length) {
        console.log(`Duplicate Options in Q${q.id}`);
    }
});
