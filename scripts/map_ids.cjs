const fs = require('fs');
const path = require('path');

function getIds(dir) {
    const results = {};
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    files.forEach(f => {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        const ids = data.map(x => x.id);
        if (ids.length > 0) {
            results[f] = {
                min: Math.min(...ids),
                max: Math.max(...ids),
                count: ids.length,
                gaps: []
            };
            ids.sort((a,b) => a-b);
            for(let i=0; i<ids.length-1; i++) {
                if(ids[i+1] !== ids[i]+1) {
                    results[f].gaps.push(`${ids[i]}-${ids[i+1]}`);
                }
            }
        }
    });
    return results;
}

console.log('--- Production 1st ---');
console.log(JSON.stringify(getIds('public/hsc/production_1st'), null, 2));

console.log('\n--- Production 2nd ---');
console.log(JSON.stringify(getIds('public/hsc/production_2nd'), null, 2));
