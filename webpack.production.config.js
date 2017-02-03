const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    // fetch polyfill to support iOS
    'whatwg-fetch',
    path.join(__dirname, 'src', 'index.js')
  ],

  output: {
    path: path.join(__dirname, 'public', 'js'),
    filename: 'bundle.min.js'
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }]
  },

  plugins: [
    new webpack.ProvidePlugin({
      // fetch polyfill to support iOS
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin(),
  ]
};
