const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const cors = require('cors');
const promisify = require('./promisify');
const interceptor = require('./interceptor');

const TEMPLATE_ROOT_REQUIRE = relPath => `export default function() { const fn = require('${relPath}').defaults; fn && fn();}`

module.exports = function configureApp(app, { config, SRC, packsDirectory, publicPath, webpack, ...options }) {
  const compiler = webpack(config);

  app.use(cors());
  app.use(interceptor({
    SRC,
    packsDirectory,
    publicPath,
    // writeFile function fron inputFileSystem of webpack
    writeFileAsyncNotify: promisify(
      compiler.inputFileSystem.fileSystem.writeFile,
      compiler.inputFileSystem.fileSystem,
    ),
    TEMPLATE_ROOT_REQUIRE: options.TEMPLATE_ROOT_REQUIRE || TEMPLATE_ROOT_REQUIRE
  }));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
  return app;
}

