[![CircleCI](https://circleci.com/gh/rchaser53/awesome-prettier-loader.svg?style=svg)](https://circleci.com/gh/rchaser53/awesome-prettier-loader)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

# awesome-prettier-loader

this is a alternative prettier-loader. this loader support `.prettierignore` and `webpack-dev-server`(live reloading).

## installation

```
 $ npm install awesome-prettier-loader --only=dev
```

or

```
 $ yarn add awesome-prettier-loader --dev
```

## difference between prettier-loader

this loader supports below feature.

* webpack 4
* .prettierignore
* webpack-dev-server(live reloading)
* vue, typescript, css file

## how to use

this is a beta package, so i didn't test sufficiently for webpack 2 and 3.
(not support for webpack 1).
if you have the problem, please make the issue.

```
// webpack.config.js example
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js?$/,
        use: {
          'babel-loader', // you can use arbitrary loader
          'awesome-prettier-loader'
        }
      }
    ]
  }
};
```

## options

actually you don't need to set option. prettier-loader will use `.prettierrc` and `.prettierignore` from current working directory.

```
{
  test: /\.js?$/,
  use: {
    loader: 'awesome-prettier-loader'
    // you don't need to set the below options
    options: {
      configPath: '.prettierrc',
      ignorePath: '.prettierignore',
    }
  }
}
```

#### configPath

you can set the arbitrary `.prettierrc` path. if you don't have `.prettierrc`, prettier-loader uses defualt setting.

#### ignorePath

you can set the arbitrary `.prettierignore` path. if you don't have `.prettierignore`, prettier-loader ignores node_modules file.
