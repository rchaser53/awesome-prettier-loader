const fs = require('fs')
const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');
const checksum = require('checksum');

const prettier = require("prettier")

let lastChecksum = {};
const pitch = function(remainingRequest, prevRequest, dataInput) {
  const fileCheckSum = checksum(fs.readFileSync(remainingRequest));
  if (lastChecksum[remainingRequest] == null) {
    lastChecksum[remainingRequest] = fileCheckSum;
  }
  dataInput.remainingRequest = remainingRequest;
  dataInput.fileCheckSum = fileCheckSum;
}

const loader = function(sources) {
  const callback = this.async();
  const { fileCheckSum, remainingRequest } = this.data;

  if (fileCheckSum !== lastChecksum[remainingRequest]) {
    const output = prettier.format(fs.readFileSync(remainingRequest, { encoding: 'utf8' }), { semi: false })
    fs.writeFile(remainingRequest, output, (err) => {
      delete lastChecksum[remainingRequest];
      callback(err, sources[0]);
    });
    return
  }
  callback(null, sources[0]);
}

module.exports = {
  pitch,
  default: loader
}