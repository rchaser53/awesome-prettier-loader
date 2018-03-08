const fs = require('fs')
const { getOptions } = require('loader-utils');
const validateOptions = require('schema-utils');

const prettier = require("prettier")

const pitch = function(remainingRequest, prevRequest, dataInput) {
  const callback = this.async();

  fs.stat(remainingRequest, (err, stat) => {
    this.data.remainingRequest = remainingRequest;
    this.data.mtime = stat.mtime;
    this.data.startTime = Date.now();
    callback(err);
  })
}

const loader = function(sources) {
  const callback = this.async();
  const { mtime, remainingRequest, startTime } = this.data;

  console.log('a', Math.floor(startTime / 1000), mtime / 1000, 'b')
  if (Math.floor(startTime / 1000) <=  mtime / 1000) {
    callback(null, sources[0]);
    return
  }

  const output = prettier.format(fs.readFileSync(remainingRequest, { encoding: 'utf8' }), { semi: false })
  fs.writeFile(remainingRequest, output, (err) => {
    callback(err, sources[0]);
  });
}

module.exports = {
  pitch,
  default: loader
}