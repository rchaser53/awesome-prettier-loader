import * as fs from 'fs';
import { getOptions } from 'loader-utils';
import * as validateOptions from 'schema-utils';
import * as checksum from 'checksum';
import prettier from 'prettier';

import schema from './options';

let lastChecksum = {};
let initialFlg = true;
let configPrettier;
let configIgnore;

export const pitch = function(remainingRequest, prevRequest, dataInput) {
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
    const options = getOptions(context);
    const { configPath, ignorePath } = options;

    validateOptions(schema, options, 'Cache Loader');
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

export const loader = function(sources) {
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