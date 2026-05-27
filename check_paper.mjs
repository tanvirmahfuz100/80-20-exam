import { readFileSync } from 'fs';
const dir = 'D:\\Tanvir Mahfuz\\80-20-exam\\docs\\web\\ssc-bangla';
for (const f of [1, 11, 21, 31, 41, 50, 55, 60, 70, 80, 90, 100, 110, 120]) {
    const c = readFileSync(dir + '\\' + f + '.html', 'utf8');
    const h1m = c.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const h3m = c.match(/<h3[^>]*>([^<]+)<\/h3>/);
    const hasPaper = c.includes('পত্র');
    console.log(f + ': h1=' + (h1m ? h1m[1] : 'none') + ', h3=' + (h3m ? h3m[1] : 'none') + ', hasPaper=' + hasPaper);
}
