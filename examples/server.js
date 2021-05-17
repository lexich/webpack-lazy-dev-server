const webpackServer = require('../outDir');
const path = require('path');
webpackServer
  .createServer({
    packsDirectory: path.join(__dirname, 'packs'),
    host: 'http://localhost:4000',
    config: {
      mode: 'development',
      context: __dirname,
      output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        hotUpdateChunkFilename: 'js/[id]-[fullhash].hot-update.js',
        publicPath: '/',
      }
    },
  }).then(app => {
    app.get('/', (req, res) => {
      res.send(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
      <script data-cfasync="false" src="/entry1.js"></script>
      </body>
      </html>`).end();
    })
    app.listen(4000, () => console.log('Example app listening on port 4000!'));
  });
