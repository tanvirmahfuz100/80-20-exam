const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = process.argv[2];

if (!pdfPath) {
    console.error("Please provide a path to a PDF file");
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(error) {
    console.error(error);
});
