const webpackServer = require('../');
const path = require('path');
webpackServer
  .createServer({
    packsDirectory: path.join(__dirname, 'packs'),
    host: 'http://localhost:4000',
    config: {
      mode: 'development',
      output: {

      }
    },
  }).then(app => {
    app.listen(4000, () => console.log('Example app listening on port 4000!'));
  });
