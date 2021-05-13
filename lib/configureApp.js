const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const cors = require('cors');

const interceptor = require('./interceptor');
const express = require('express');

function configureAdmin(app, { inputEntries, virtualEntry }) {
  app.post('/entry', (req, res, next) => {
    if (!req.body) {
      return next(new Error('Invalid request'));
    }
    const entry = req.body.entry;
    if (!entry) {
      return next(new Error('Invalid request'));
    }
    virtualEntry.set(entry, !!req.body.checked).then(() => {
      res.json({ ok: true }).end();
    }, () => {
      res.json({ ok: false }).end();
    });
  });

  app.get('/admin', (req, res) => {
    const body = Object.keys(inputEntries).map(key => {
      return `<li><label><input type='checkbox' ${virtualEntry.info[key + '.js'] ? 'checked' : ''} data-entry="${key}" onchange="send(this)" />${key}</label></li>`
    });

    res.send(`<html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
    <ul>${body.join('')}</ul>
    <script>
    function send(e) {
      var entry = e.dataset.entry;
      fetch('/entry', {
        method: 'POST',
        body: JSON.stringify({ entry: entry + '.js', checked: e.checked }),
        headers: { 'Content-Type': 'application/json' }
      }).then(d => d.json());
    }
    </script>
    </body>
    </html>`)
  });
}

module.exports = function configureApp(app, { config, publicPath, compiler, inputEntries, virtualEntry }) {

  app.use(cors());
  app.use(express.json());
  configureAdmin(app, { inputEntries, virtualEntry });

  app.use(interceptor({ publicPath, virtualEntry }));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
  app.use(webpackHotMiddleware(compiler));
  return app;
}

