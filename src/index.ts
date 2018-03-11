import * as fs from 'fs'
import * as path from 'path'
import { getOptions } from 'loader-utils'
import * as validateOptions from 'schema-utils'
import * as checksum from 'checksum'
import ignore = require('ignore')
import * as prettier from 'prettier'

import schema from './options'

let configPrettier
let ig = ignore()
let lastChecksum: { [key: string]: string } = {}
let dirtyRequests: string[] = []
let configIgnore: string[] = []
const DefaultConfigIgnore = ['node_modules']
const DefaultConfigPath = path.resolve(process.cwd(), '.prettierrc')
const DefaultIgnorePath = path.resolve(process.cwd(), '.prettierignore')

export interface Reader {
	(path: string): Promise<string>
}
export interface Writer {
	(path: string, data: string): Promise<void>
}
export interface DefaultLoader {
	(input: string): void
}

export const createDefaultLoader = function(reader: Reader, writer: Writer): DefaultLoader {
	return function(input: string) {
		this.cacheable()
		const { remainingRequest } = this.data
		const callback = this.async()
		const actualPath = getActualPath(remainingRequest)

		if (dirtyRequests.length === 0) {
			initializeConfig(this)
		}

		if (ig.ignores(actualPath) === true) {
			callback(null)
			return
		}

		const innerPitchLoader = async function() {
			try {
				const data = await reader(actualPath)
				const fileCheckSum: string = checksum(data)

				if (lastChecksum[remainingRequest] == null) {
					lastChecksum[remainingRequest] = fileCheckSum
				}
				if (shouldFormat(fileCheckSum, remainingRequest) === true) {
					const formattedData = prettier.format(data, addFormatToConfig(configPrettier, actualPath))

					if (fileCheckSum === checksum(formattedData)) return
					await writer(actualPath, formattedData)
					delete lastChecksum[remainingRequest]
					dirtyRequests.push(remainingRequest)
				}
			} catch (err) {
				throw new Error(err)
			}
		}

		innerPitchLoader()
			.then(function() {
				callback(null, input)
			})
			.catch(function(err) {
				callback(err)
			})
	}
}

export const addFormatToConfig = function(configPrettier, targetPath: string): any {
	switch (targetPath.replace(/^(\s|\S)*\./, '')) {
		case 'ts':
			return { ...configPrettier, parser: 'typescript' }
		case 'vue':
			return { ...configPrettier, parser: 'vue' }
		case 'md':
			return { ...configPrettier, parser: 'md' }
		case 'css':
			return { ...configPrettier, parser: 'css' }
		case 'json':
			return { ...configPrettier, parser: 'json' }
		default:
			return configPrettier
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

const write: Writer = function(path, data) {
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
		const { configPath, ignorePath } = options || ({} as any)
		const actualConfigPath = configPath || DefaultConfigPath
		const actualIgnorePath = ignorePath || DefaultIgnorePath

		validateOptions(schema, options || {}, 'prettier loader')
		try {
			const prettierStr = fs.readFileSync(actualConfigPath, { encoding: 'utf8' })
			configPrettier = JSON.parse(prettierStr)
			const ignoreStr = fs.readFileSync(actualIgnorePath, { encoding: 'utf8' })
			configIgnore = resolveIgnore(ignoreStr)
			ig.add(configIgnore)
		} catch (err) {
			configPrettier = configPrettier || {}
			ig.add(DefaultConfigIgnore)
		}
	}
}

const resolveIgnore = (input: string): string[] => {
	return input.split('\n') || DefaultConfigIgnore
}

const shouldFormat = function(fileCheckSum: string, remainingRequest: string): boolean {
	return fileCheckSum !== lastChecksum[remainingRequest] || dirtyRequests.includes(remainingRequest) == false
}

export const pitchLoader = function(remainingRequest: string, prevRequest, dataInput: { [key: string]: any }): void {
	dataInput.remainingRequest = remainingRequest
}
export const defaultLoader = createDefaultLoader(read, write)
