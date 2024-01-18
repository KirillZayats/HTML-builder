const fileStream = require('fs');
const path = require('path');
const { stdout, stdin } = require('process');
const messageEnter = 'Enter data or "exit"...\n';

const filePath = path.join(__dirname, 'text.txt');
const writeStream = fileStream.createWriteStream(filePath);
function bye() {
  stdout.write('Good bye!');
  process.exit();
}

stdout.write(`Hi, my friend! ${messageEnter}`);
stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    bye();
  } else {
    writeStream.write(data);
    stdout.write(`Your data: ${data}`);
    stdout.write(messageEnter);
  }
});
process.on('SIGINT', () => bye());
