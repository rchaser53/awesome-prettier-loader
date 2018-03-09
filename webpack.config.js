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
        test: /\.js$/,
        use: [
          'babel-loader',
          {
            loader: path.resolve(__dirname, 'dist/index.js'),
            options: {
              configPath: '.prettierrc',
              ignorePath: '.prettierignore',
            }
          }
        ],
        exclude: /(node_modules)/,
      },
		]
	},
	devServer: {
		port: 3000,
		host: "localhost",
	},
	devtool: 'inline-source-map'
};