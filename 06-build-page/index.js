const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const folderFrom = '';
const nameAssets = 'assets';
const pathDist = path.join(__dirname, 'project-dist');
const pathDistAssets = path.join(pathDist, nameAssets);
const pathAssets = path.join(__dirname, nameAssets);
const pathDefault = path.join(__dirname, folderFrom);

const folderComponents = 'components';
const extnameHtml = '.html';
const nameHtmlFrom = 'template.html';
const nameHtmlTo = 'index.html';

const extnameCss = '.css';
const nameStyle = 'style';
const nameFolderStyle = 'styles';

const copyFile = async (pathFrom, pathTo) => {
  const startCopy = (fullPathFrom, fullPathTo) => {
    fsPromises.readdir(fullPathFrom, { withFileTypes: true }).then((files) => {
      files.forEach((file) => {
        const pathFileFrom = path.join(fullPathFrom, file.name);
        const pathFileTo = path.join(fullPathTo, file.name);
        if (file.isFile()) {
          fsPromises.copyFile(pathFileFrom, pathFileTo);
        } else {
          fsPromises.mkdir(pathFileTo, { recursive: true });
          startCopy(pathFileFrom, pathFileTo);
        }
      });
    });
  };
  startCopy(pathFrom, pathTo);
};

const createFolder = async (pathFolder) => {
  try {
    await fsPromises.rm(pathFolder, { recursive: true, force: true });
    await fsPromises.mkdir(pathFolder, { recursive: true });
  } catch (err) {
    console.log(err);
  }
};

const buildStyle = (nameFile, extnameFile, fromFolder, pathToFolter) => {
  const pathBuild = path.join(pathToFolter, `${nameFile}${extnameFile}`);
  const writeStream = fs.createWriteStream(pathBuild);
  const pathFromFolder = path.join(__dirname, fromFolder);

  fsPromises.readdir(pathFromFolder, { withFileTypes: true }).then((files) => {
    files.forEach((file) => {
      const fullName = path.join(pathFromFolder, file.name);
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
  pathFromFolder,
  pathToFolder,
  folderComponents,
) => {
  const pathDefaultFile = path.join(pathFromFolder, nameHtmlFrom);
  const pathBuild = path.join(pathToFolder, nameHtmlTo);
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
  await createFolder(pathDist);
  await createFolder(pathDistAssets);
  await copyFile(pathAssets, pathDistAssets);
  await buildStyle(nameStyle, extnameCss, nameFolderStyle, pathDist);
  await buildHtml(
    nameHtmlFrom,
    nameHtmlTo,
    pathDefault,
    pathDist,
    folderComponents,
  );
};

build();
