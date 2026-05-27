const fs = require('fs');
const dir = 'D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\ssc-bangla';
for (const f of [1, 11, 21, 31, 41, 50, 60, 70, 80, 90]) {
    const file = dir + '\\' + f + '.html';
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const hasPaper = content.includes('পত্র');
    const h1m = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const h3m = content.match(/<h3[^>]*>([^<]+)<\/h3>/);
    const bm = content.indexOf('বাংলা');
    console.log(f + '.html: h1=' + (h1m ? h1m[1] : 'none') + ', h3=' + (h3m ? h3m[1] : 'none') + ', hasPaper=' + hasPaper + ', banglaAt=' + bm);
}
