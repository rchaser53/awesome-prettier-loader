import { addFormatToConfig, getActualPath } from '../index'

describe('addFormatToConfig', () => {
	test('add the parser depends on extension', async () => {
		const inputPath = 'test/file.ts'
		const outputConfig = {
			parser: 'typescript'
		}
		expect(addFormatToConfig({}, inputPath)).toEqual(outputConfig)
	})

	test('add no parser when .file', async () => {
		const inputPath = '.ignore'
		const outputConfig = {}
		expect(addFormatToConfig({}, inputPath)).toEqual(outputConfig)
	})
})

describe('getActualPath', () => {
	test('get file path from remainingRequest', async () => {
		const remainingRequest = 'ts-loader!test/file.ts'
		const outputFilePath = 'test/file.ts'
		expect(getActualPath(remainingRequest)).toEqual(outputFilePath)
	})
})
