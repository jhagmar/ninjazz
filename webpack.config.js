const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  return {
    mode: argv.mode,
    entry: path.resolve(__dirname, './src/index.js'),
    module: {
      rules: [
        { test: /\.txt$/, use: 'raw-loader' },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "Ninja Pool Party",
        template: "src/index.html"
      }),
      new CopyPlugin({
        patterns: [
          { from: "src/assets", to: "assets" },
        ],
      }),
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[fullhash].js',
    },
    devServer: {
      headers: {
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin"
      },
    },
    experiments: {
      asyncWebAssembly: true
    }
  };
};