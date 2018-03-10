import * as fs from 'fs'
import { getOptions } from 'loader-utils'
import * as validateOptions from 'schema-utils'
import * as checksum from 'checksum'
import * as prettier from 'prettier'

import schema from './options'

let lastChecksum: { [key: string]: string } = {}
let ignorePaths: string[] = []
let initialFlg = true
let configPrettier
let configIgnore
export const pitchLoader = function(remainingRequest: string, prevRequest, dataInput: { [key: string]: any }): void {
	const callback = this.async()
	const actualPath = getActualPath(remainingRequest)

	if (ignorePaths.includes(actualPath) === true) {
		callback(null)
		return
	}

	if (-1 < actualPath.indexOf('node_modules')) {
		ignorePaths.push(actualPath)
		callback(null)
		return
	}

	const fileCheckSum = checksum(fs.readFileSync(actualPath))
	initializeConfig(this)

	if (lastChecksum[remainingRequest] == null) {
		lastChecksum[remainingRequest] = fileCheckSum
	}

	if (isFormat(fileCheckSum, remainingRequest)) {
		format(remainingRequest)
			.then((ret) => {
				delete lastChecksum[remainingRequest]
				initialFlg = false
				callback(null)
			})
			.catch((err) => {
				callback(err)
			})
	}
	callback(null)
}

const format = async function(targetPath: string): Promise<void> {
	try {
		const data = await read(targetPath)
		const formattedData = prettier.format(data, configPrettier)
		await write(targetPath, formattedData)
	} catch (err) {
		throw new Error(err)
	}
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
			configIgnore = JSON.parse(ignoreStr)
		} catch (err) {
			configPrettier = {}
			configIgnore = {}
		}
	}
}

const isFormat = function(fileCheckSum: string, remainingRequest: string): boolean {
	return fileCheckSum !== lastChecksum[remainingRequest] || initialFlg === true
}
