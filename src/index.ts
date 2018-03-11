import * as fs from 'fs'
import { getOptions } from 'loader-utils'
import * as validateOptions from 'schema-utils'
import * as checksum from 'checksum'
import ignore = require('ignore')
import * as prettier from 'prettier'

import schema from './options'

let ig = ignore()
let lastChecksum: { [key: string]: string } = {}
let dirtyRequests: string[] = []
let configPrettier
let configIgnore
export const pitchLoader = function(remainingRequest: string, prevRequest, dataInput: { [key: string]: any }): void {
	const webpack = this
	const callback = webpack.async()
	const actualPath = getActualPath(remainingRequest)

	if (dirtyRequests.length === 0) {
		initializeConfig(webpack)
	}

	if (ig.ignores(actualPath) === true) {
		callback(null)
		return
	}

	const innerPitchLoader = async function() {
		try {
			const data = await read(actualPath)
			const fileCheckSum: string = checksum(data)

			if (lastChecksum[remainingRequest] == null) {
				lastChecksum[remainingRequest] = fileCheckSum
			}
			if (shouldFormat(fileCheckSum, remainingRequest)) {
				const formattedData = prettier.format(data, configPrettier)
				await write(actualPath, formattedData)

				delete lastChecksum[remainingRequest]
				dirtyRequests.push(remainingRequest)
			}
		} catch (err) {
			throw new Error(err)
		}
	}

	innerPitchLoader()
		.then(function() {
			callback(null)
		})
		.catch(function(err) {
			callback(err)
		})
}

const read = function(targetPath: string): Promise<string> {
	return new Promise(function(resolve, reject) {
		fs.readFile(targetPath, { encoding: 'utf8' }, function(err, data) {
			if (err) {
				reject(err)
				return
			}
			resolve(data)
		})
	})
}

const write = function(path: string, data: string): Promise<void> {
	return new Promise(function(resolve, reject) {
		fs.writeFile(path, data, function(err) {
			if (err) {
				reject(err)
				return
			}
			resolve()
		})
	})
}

const getActualPath = function(remainingRequest: string): string {
	const lastPath = remainingRequest.split('!').pop()
	if (lastPath != null) {
		return lastPath.split('?')[0]
	}
	throw new Error(`${lastPath} is not a string.`)
}

const initializeConfig = function(context): void {
	if (configPrettier == null || configIgnore == null) {
		const options = getOptions(context)
		const { configPath, ignorePath } = options

		validateOptions(schema, options, 'Cache Loader')
		try {
			const prettierStr = fs.readFileSync(configPath, { encoding: 'utf8' })
			const ignoreStr = fs.readFileSync(ignorePath, { encoding: 'utf8' })
			configPrettier = JSON.parse(prettierStr)
			configIgnore = resolveIgnore(ignoreStr)
			ig.add(configIgnore)
		} catch (err) {
			configPrettier = {}
		}
	}
}

const resolveIgnore = (input: string): string[] => {
	return input.split('\n') || []
}

const shouldFormat = function(fileCheckSum: string, remainingRequest: string): boolean {
	return fileCheckSum !== lastChecksum[remainingRequest] || dirtyRequests.includes(remainingRequest) == false
}
