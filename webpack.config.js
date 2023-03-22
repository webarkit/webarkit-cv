const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'webarkitCV.js',
    library: 'WebARKitCV',
    libraryTarget: 'umd',
    // @see: https://github.com/webpack/webpack/issues/3929
    //libraryExport: 'default',
    // @see: https://github.com/webpack/webpack/issues/6522
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x)?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ['node_modules'],
    // @see https://stackoverflow.com/questions/59487224/webpack-throws-error-with-emscripten-cant-resolve-fs
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    }
  },
  
};
