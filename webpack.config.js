const path = require('path');

module.exports = {
  mode: "development",
	entry: './test/index.js',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: path.resolve(__dirname, 'src/loader.js'),
        exclude: /(node_modules)/,
        options: {
          configFile: 'tslint.json'
        }
    }
		]
	},
	devServer: {
		port: 3000,
		host: "localhost",
	},
	devtool: 'inline-source-map'
};