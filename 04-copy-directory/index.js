const fs = require('fs/promises');
const path = require('path');

async function addData(pathFolder, pathFolderCopy) {
  fs.readdir(pathFolder, { withFileTypes: true }).then((files) => {
    files.forEach((file) => {
      const pathFile = path.join(pathFolder, file.name);
      const pathFileCopy = path.join(pathFolderCopy, file.name);
      if (file.isFile()) {
        fs.copyFile(pathFile, pathFileCopy);
      } else {
        fs.mkdir(pathFileCopy, { recursive: true });
        addData(pathFile, pathFileCopy);
      }
    });
  });
}

async function copyFolder(nameFolder) {
  const pathFolder = path.join(__dirname, nameFolder);
  const pathFolderCopy = path.join(__dirname, `${nameFolder}-copy`);
  try {
    await fs.rm(pathFolderCopy, { recursive: true, force: true });
    await fs.mkdir(pathFolderCopy, { recursive: true });
    await addData(pathFolder, pathFolderCopy);
  } catch (err) {
    console.log(err);
  }
}

copyFolder('files');
