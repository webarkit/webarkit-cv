const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'webarkitCV.js',
    library: 'WebARKitCV',
    libraryTarget: 'umd',
    // @see: https://github.com/webpack/webpack/issues/3929
    //libraryExport: 'default',
    // @see: https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    //globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              // @see https://github.com/babel/babel/issues/9849
              ['@babel/transform-runtime']
            ]
          }
        }]
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
    // @see https://stackoverflow.com/questions/59487224/webpack-throws-error-with-emscripten-cant-resolve-fs
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    }
  },
  
};
