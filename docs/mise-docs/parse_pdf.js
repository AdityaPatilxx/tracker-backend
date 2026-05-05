const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Active Reader communication protocol 20171017.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('protocol_text.txt', data.text);
    console.log('PDF text extracted to protocol_text.txt');
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
