const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const nameDist = 'project-dist';
const nameAssets = 'assets';

const folderFrom = '';
const folderComponents = 'components';
const extnameHtml = '.html';
const nameHtmlFrom = 'template.html';
const nameHtmlTo = 'index.html';

const extnameCss = '.css';
const nameStyle = 'style';
const nameFolderStyle = 'styles';

const copyFile = async (pathFrom, pathTo) => {
  const fullPathFrom = path.join(__dirname, pathFrom);
  const fullPathTo = path.join(__dirname, pathTo);
  const startCopy = (fullPathFrom, fullPathTo) => {
    fsPromises.readdir(fullPathFrom, { withFileTypes: true }).then((files) => {
      files.forEach((file) => {
        const pathFileFrom = `${fullPathFrom}\\${file.name}`;
        const pathFileTo = `${fullPathTo}\\${file.name}`;
        if (file.isFile()) {
          fsPromises.copyFile(pathFileFrom, pathFileTo);
        } else {
          fsPromises.mkdir(pathFileTo, { recursive: true });
          startCopy(pathFileFrom, pathFileTo);
        }
      });
    });
  };
  startCopy(fullPathFrom, fullPathTo);
};

const createFolder = async (nameFolder) => {
  const pathFolder = path.join(__dirname, nameFolder);
  try {
    await fsPromises.rm(pathFolder, { recursive: true, force: true });
    await fsPromises.mkdir(pathFolder, { recursive: true });
  } catch (err) {
    console.log(err);
  }
};

const buildStyle = (nameFile, extnameFile, fromFolder, toFolder) => {
  const pathBuild = path.join(
    __dirname,
    `${toFolder}\\${nameFile}${extnameFile}`,
  );
  const writeStream = fs.createWriteStream(pathBuild);
  const pathFromFolder = path.join(__dirname, fromFolder);
  fsPromises.readdir(pathFromFolder, { withFileTypes: true }).then((files) => {
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

const createMapComponents = async (folderComponents, extname) => {
  const mapComponents = new Map();
  const pathComponents = path.join(__dirname, folderComponents);
  const components = await fsPromises.readdir(pathComponents, {
    withFileTypes: true,
  });
  for (let index = 0; index < components.length; index++) {
    if (
      components[index].isFile() &&
      components[index].name.includes(extname)
    ) {
      const filePath = path.join(pathComponents, components[index].name);
      const data = await fsPromises.readFile(filePath, 'utf8');
      mapComponents.set(`{{${components[index].name.split('.')[0]}}}`, data);
    }
  }
  return mapComponents;
};

const buildHtml = async (
  nameHtmlFrom,
  nameHtmlTo,
  folderFrom,
  folderTo,
  folderComponents,
) => {
  const pathDefaultFile = path.join(
    __dirname,
    `${folderFrom}\\${nameHtmlFrom}`,
  );
  const pathBuild = path.join(__dirname, `${folderTo}\\${nameHtmlTo}`);
  const writeStream = fs.createWriteStream(pathBuild);
  const mapComponents = await createMapComponents(
    folderComponents,
    extnameHtml,
  );
  let defaultFile = await fsPromises.readFile(pathDefaultFile, 'utf8');
  for (let [key, value] of mapComponents) {
    defaultFile = defaultFile.replace(key, value.trim());
  }
  writeStream.write(defaultFile);
};

const build = async () => {
  await createFolder(nameDist);
  await createFolder(`${nameDist}\\${nameAssets}`);
  await copyFile(nameAssets, `${nameDist}\\${nameAssets}`);
  await buildStyle(nameStyle, extnameCss, nameFolderStyle, nameDist);
  await buildHtml(
    nameHtmlFrom,
    nameHtmlTo,
    folderFrom,
    nameDist,
    folderComponents,
  );
};

build();
