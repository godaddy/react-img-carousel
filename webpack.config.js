var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, 'build');
var SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: './example.js',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css'
      }, {
        test: /\.less$/,
        loader: 'style!css!less'
      },
      {
        test : /\.jsx?/,
        loader : 'babel'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Carousel Demo'
    })
  ]
};
