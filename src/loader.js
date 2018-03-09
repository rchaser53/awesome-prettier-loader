const fs = require('fs')
const { getOptions } = require('loader-utils');
const checksum = require('checksum');

const prettier = require("prettier")

let lastChecksum = {};
let initialFlg = true;
let configPrettier;
const pitch = function(remainingRequest, prevRequest, dataInput) {
  const actualPath = remainingRequest.split('!').pop();
  const fileCheckSum = checksum(fs.readFileSync(actualPath));

  if (configPrettier == null) {
    const { configPath, ignorePath } = getOptions(this);
    try {
      const prettierStr = fs.readFileSync(configPath, { encoding: 'utf8' });
      configPrettier = JSON.parse(prettierStr);
    } catch (err) {
      configPrettier = {}
    }
  } 

  if (lastChecksum[remainingRequest] == null) {
    lastChecksum[remainingRequest] = fileCheckSum;
  }

  dataInput.remainingRequest = actualPath;
  dataInput.fileCheckSum = fileCheckSum;
}

const loader = function(sources) {
  const callback = this.async();
  const { fileCheckSum, remainingRequest } = this.data;

  if (fileCheckSum !== lastChecksum[remainingRequest] || initialFlg === true) {
    const output = prettier.format(fs.readFileSync(remainingRequest, { encoding: 'utf8' }), configPrettier)
    fs.writeFile(remainingRequest, output, (err) => {
      delete lastChecksum[remainingRequest];
      callback(err, sources[0]);
      initialFlg = false;
    });
    return
  }
  callback(null, sources[0]);
}

module.exports = {
  pitch,
  default: loader
}