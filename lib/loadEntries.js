const path = require('path');
const fs = require('fs');
const promisify = require('./promisify');
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);

module.exports = function loadEntries(dir, acceptFile) {
  const result = {};
  return readdirAsync(dir).then(files => {
    const defer = files.map(file => {
      const filePath = path.join(dir, file);
      return statAsync(filePath).then(stat => {
        if (stat.isDirectory()) {
          return loadEntries(filePath, result).then(res => {
            Object.assign(result, res);
          });
        } else if (stat.isFile()) {
          const isEntry = acceptFile ? acceptFile(filePath) : true;
          if (isEntry) {
            const ext = path.extname(filePath);
            const name = path.basename(filePath, ext);
            result[name] = filePath;
          }
        }
      }).catch(() => {});
    });
    return Promise.all(defer).then(() => result);
  }).catch(() => {});
}
