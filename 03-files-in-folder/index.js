const fs = require('fs/promises');
const path = require('path');

const nameFolder = path.join(__dirname, 'secret-folder');
fs.readdir(nameFolder, { withFileTypes: true }).then((files) => {
  files.forEach((file) => {
    const fullName = file.name;
    if (file.isFile()) {
      const filePath = path.join(nameFolder, file.name);
      const extname = path.extname(fullName);
      const name = path.basename(fullName, extname);
      fs.stat(filePath).then((stat) => {
        console.log(
          `${name} - ${extname ? extname.split('.')[1] : null} - ${stat.size}b`,
        );
      });
    }
  });
});
