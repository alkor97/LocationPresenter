const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devServer: {
    contentBase: '/dist'
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    sourceMapFilename: 'bundle.map'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  devtool: 'source-maps',
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
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
    new HtmlWebpackPlugin({
      template: 'src/assets/index.html',
      title: 'Location Presenter'
    }),
    new ForkTsCheckerWebpackPlugin({
      tslint: true
    })
  ]
};
