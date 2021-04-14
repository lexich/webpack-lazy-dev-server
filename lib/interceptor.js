const path = require('path');
const fs = require('fs');
const promisify = require('./promisify');
const statAsync = promisify(fs.stat);

module.exports = function interceptor(options) {
  // cache for required entries
  const info = {};
  const SRC = options.SRC;
  const publicPath = options.publicPath;
  const writeFileAsyncNotify = options.writeFileAsyncNotify;
  const packsDirectory = options.packsDirectory;
  return (req, res, next) => {
    const url = publicPath && req.url ? path.relative(publicPath, req.url) : req.url;
    if (url && /\.js$/.test(url)) {
      const filepath = path.join(SRC, '$_' + url);
      statAsync(filepath)
        .then(() => {
          if (!info[filepath]) {
            const packPath = path.join(packsDirectory, url);
            info[filepath] = true;
            const relPath = path.relative(SRC, packPath).replace(/\.js$/, '');
            setTimeout(() =>
              writeFileAsyncNotify(
                filepath, options.TEMPLATE_ROOT_REQUIRE(relPath)
              ), 10);
          }
        })
        .then(
          () => next(),
          () => next(),
        );
    } else {
      next();
    }
  };
}
