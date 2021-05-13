const path = require('path');
const express = require('express');
const webpack = require('webpack');

const service = require('./lib');

async function createServer(options) {
  // directory were located base entries
  const packsDirectory = options.packsDirectory;
  if (!packsDirectory) {
    throw new Error('You need to provide "options.packsDirectory"')
  }

  const host = options.host;
  if (!host) {
    throw new Error('You need to provide "options.host"')
  }

  // webpack config required
  if (!options.config) {
    throw new Error('You need pass "options.config" with webpack config')
  }

  // new virtual directory for entries
  const SRC = options.srcVirtual || path.join(process.cwd(), 'node_modules', '.cache', 'webpack-lazy-dev-server');

  const inputEntries = await service.loadEntries(packsDirectory, options.acceptFile);
  const entryMap = patchEntries(inputEntries, SRC);

  const virtualEntry = new service.VirtualEntry({
    info: {},
    code: options.code,
    SRC,
    packsDirectory,
    entryMap,
  });

  await virtualEntry.prepareEnv();

  const config = {
    ...options.config,
    entry: addHotMiddleware(entryMap, host),
    plugins: (options.config.plugins || []).concat([
      new webpack.HotModuleReplacementPlugin()
    ])
  };
  const publicPath = config.output.publicPath;
  if (publicPath) {
    config.output.publicPath = host + publicPath;
  }

  const compiler = webpack(config);
  virtualEntry.setWriteFileAsyncNotify(
    service.promisify(
      compiler.inputFileSystem.fileSystem.writeFile,
      compiler.inputFileSystem.fileSystem,
    )
  );

  return service.configureApp(express(), {
    config,
    publicPath,
    compiler,
    inputEntries,
    virtualEntry
  });
}


function patchEntries(entry, src) {
  return Object.keys(entry).reduce((memo, key) => {
    const filename = entry[key];
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    const filepath = path.join(src, name) + '.js';
    memo[name] = filepath;
    return memo;
  }, {});
}

function addHotMiddleware(entry, host) {
  return Object.keys(entry).reduce((memo, key) => {
    memo[key] = [
      entry[key],
      `webpack-hot-middleware/client?path=${host}/__webpack_hmr&name=${key}`,
    ];
    return memo;
  }, {});
}


module.exports.createServer = createServer;
module.exports.webpack = require('webpack');
