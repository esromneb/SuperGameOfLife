const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    library: 'main',
  },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".json"],
    },
  module: {
	rules: [
  { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ },
	  {
		test: /\.m?js$/,
		//exclude: /(node_modules|bower_components)/,
        include: /(pixi.js|ape-ecs|\/src)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                  plugins: [ "@babel/plugin-proposal-class-properties"]
                }
              }
	  }
	]
  },
  plugins: [
    new CopyPlugin([
      { from: './html/*.html', to: '', flatten: true },
      { from: './assets/*', to: '', flatten: false },
    ]),
  ],
};
