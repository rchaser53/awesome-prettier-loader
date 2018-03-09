const fs = require('fs');
const { getOptions } = require('loader-utils');
const checksum = require('checksum');
const prettier = require('prettier');

let lastChecksum = {};
let initialFlg = true;
let configPrettier;
let configIgnore;

const pitch = function(remainingRequest, prevRequest, dataInput) {
  const actualPath = remainingRequest.split('!').pop();
  const fileCheckSum = checksum(fs.readFileSync(actualPath));
  initializeConfig(this);

  if (lastChecksum[remainingRequest] == null) {
    lastChecksum[remainingRequest] = fileCheckSum;
  }

  dataInput.remainingRequest = actualPath;
  dataInput.fileCheckSum = fileCheckSum;
}

const initializeConfig = function(context) {
  if (configPrettier == null || configIgnore == null) {
    const { configPath, ignorePath } = getOptions(context);
    try {
      const prettierStr = fs.readFileSync(configPath, { encoding: 'utf8' });
      const ignoreStr = fs.readFileSync(ignorePath, { encoding: 'utf8' });
      configPrettier = JSON.parse(prettierStr);
      configIgnore = JSON.parse(ignoreStr);
    } catch (err) {
      configPrettier = {};
      configIgnore = {};
    }
  }
} 

const loader = function(sources) {
  const callback = this.async();
  const { remainingRequest } = this.data;

  if (isFormat(this)) {
    try {
      const output = prettier.format(fs.readFileSync(remainingRequest, { encoding: 'utf8' }), configPrettier);
      fs.writeFile(remainingRequest, output, (err) => {
        delete lastChecksum[remainingRequest];
        callback(err, sources[0]);
        initialFlg = false;
      });
    } catch (err) {
      console.error(err);
    }

    return;
  }
  callback(null, sources[0]);
}

const isFormat = function(context) {
  const { fileCheckSum, remainingRequest } = context.data;
  return fileCheckSum !== lastChecksum[remainingRequest] || initialFlg === true
}

module.exports = {
  pitch,
  default: loader
}