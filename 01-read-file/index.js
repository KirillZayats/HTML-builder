const fileStream = require('fs');
const path = require('path');
const { stdout } = require('process');
const filePath = path.join(__dirname, 'text.txt');
const readableStream = fileStream.createReadStream(filePath, 'utf8');
readableStream.on('data', (chunk) => stdout.write(chunk));
