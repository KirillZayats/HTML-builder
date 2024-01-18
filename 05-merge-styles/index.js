const filePromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const buildFile = (nameFile, extnameFile, fromFolder, toFolder) => {
  const pathBuild = path.join(
    __dirname,
    `${toFolder}\\${nameFile}${extnameFile}`,
  );
  const writeStream = fs.createWriteStream(pathBuild);
  const pathFromFolder = path.join(__dirname, fromFolder);
  filePromises
    .readdir(pathFromFolder, { withFileTypes: true })
    .then((files) => {
      files.forEach((file) => {
        const fullName = `${pathFromFolder}\\${file.name}`;
        if (file.isFile() && fullName.includes(extnameFile)) {
          const readableStream = fs.createReadStream(fullName, 'utf8');
          readableStream.on('data', (chunk) => {
            writeStream.write(chunk);
          });
        }
      });
    });
};

buildFile('bundle', '.css', 'styles', 'project-dist');
