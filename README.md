# Webpack-lazy-dev-server

Webpack server which allow compile entries on demand.

[![NPM version](https://badge.fury.io/js/webpack-lazy-dev-server.svg)](http://badge.fury.io/js/webpack-lazy-dev-server)
```
npm install webpack-lazy-dev-server
```


```js
const webpackServer = require('webpack-lazy-dev-server');
const PORT = 4000;
webpackServer.createServer({
  packsDirectory: 'packs', // directory where are you entries for webpack
  host: `http://localhost:${PORT}`, // url which are using for download compiled entries
  config: webpackConfig, // you standart webpack config
  acceptFile: filepath => true, // function for filtering entries in `packsDirectory`
  code: '', // custom code which you can inline for non-compiling entries
  configure: entryList => {} // access to entryList and custom manipuration on it
}).then(app => {
  app.listen(PORT, () => console.log(`Run http://localhost:${PORT}`))
})
```

All entries will be available according you webpack config
> {host}/{publicPath}/{entryname}

in our example it can be
> http://localhost:4000/public/entry.js
if we have file `packs/entry.js` and in webpack config you define `output.publicPath` as `public`.

Also there is admin panel for precompiled entries. It will be available on `http://localhost:4000/admin`.

[Code examples](https://github.com/lexich/webpack-lazy-dev-server)
