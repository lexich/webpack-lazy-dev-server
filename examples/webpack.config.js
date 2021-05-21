module.exports = {
  mode: 'development',
  context: __dirname,
  output: {
    filename: '[name].js',
    path: __dirname + '/dist',
    hotUpdateChunkFilename: 'js/[id]-[fullhash].hot-update.js',
    publicPath: '/',
  }
}
