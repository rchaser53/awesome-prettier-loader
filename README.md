# prettier-loader

this loader support `.prettierignore` and `webpack-dev-server`(live reloading).

## Installation

```
 $ npm install prettier-loader --only=dev
```

or

```
 $ yarn add prettier-loader --dev
```

## how to use

this is a beta package, so i didn't test sufficiently for webpack 2 and 3.
(i have no plan to support for webpack1).
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
          loader: 'prettier-loader'
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
    loader: 'prettier-loader'
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
