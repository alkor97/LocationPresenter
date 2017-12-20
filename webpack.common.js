const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
      options: {
        transpileOnly: true // type checking is performed in fork plugin
      }
    }, {
      test: /\.css$/,
      use: [
        'style-loader', 'css-loader'
      ]
    }, {
      test: /\.(png|svg|jpg|gif)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'img/'
        }
      }
    }, {
      test: /favicon\.ico$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    }, {
      test: /\.html$/,
      use: 'html-loader'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/assets/index.html',
      title: 'Location Presenter',
      hash: true
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: true
    })
  ]
};
