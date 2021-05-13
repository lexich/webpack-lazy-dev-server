const path = require('path');

module.exports = function interceptor(options) {
  const publicPath = options.publicPath;
  const virtualEntry = options.virtualEntry;

  return (req, res, next) => {
    const url = publicPath && req.url ? path.relative(publicPath, req.url) : req.url;
    virtualEntry.set(url, true).then(
      () => next && next(),
      () => next && next(),
    );
  };
}
