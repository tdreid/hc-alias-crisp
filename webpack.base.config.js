var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var fs = require('fs');

function getCwd() {
  var cwd = process.cwd();

  var configSuffix = "/config";
  if (cwd.substr(-1 * configSuffix.length) === configSuffix) {
    cwd = path.join(cwd, "..", "..");
  }

  return cwd;
}

function getDirs(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

var base = getCwd() + '/assets/js';
var aliases = {};
getDirs(base).forEach(function (root) {
  aliases[root] = base + '/' + root;
});

module.exports = {
  context: __dirname,

  entry: [
    './assets/js/index',
    './assets/styles/app.less'
  ],

  output: {
    path: path.resolve('./assets/bundles/'),
    filename: "[name].js"
  },

  externals: {
    "react/addons": "React",
    "react": "React",
    "jquery": "$",
    "lodash": "_",
    "AP": "AP"
  },

  plugins: [
    new ExtractTextPlugin("[name].css")
  ], // add all common plugins here

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'},
      { test: /\.less$/, exclude: /node_modules/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")},
      { test: /\.svg$/, include: /assets\/img/, loader: "file-loader?name=[path][name].[ext]?[hash]"}
    ]
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx'],
    alias: aliases
  }
};