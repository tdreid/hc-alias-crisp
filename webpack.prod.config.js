var path = require("path");
var webpack = require('webpack');
var config = require('./webpack.base.config.js');

config.plugins = config.plugins.concat([

  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify("production")
    }}),

  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    }
  })
]);

module.exports =  config;
