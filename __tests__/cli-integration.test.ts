import { system, filesystem } from 'gluegun'

const src = filesystem.path(__dirname, '..')

const cli = async (cmd) =>
  system.run('node ' + filesystem.path(src, 'bin', 'regex-bumper') + ` ${cmd}`)

function resetTestFile(): void {
  filesystem.write(`${__dirname}/test1.txt`, '')
  filesystem.write(`${__dirname}/test2.txt`, '')
  filesystem.write(`${__dirname}/nested/another/test3.txt`, '')
}

function initTestFile(fileName: string, destFileName = 'test1'): void {
  filesystem.write(
    getTestFilePath(destFileName),
    getOriginalFileContent(fileName)
  )
}

function getFileContent(type: string, fileName: string): string {
  return filesystem.read(`${__dirname}/${type}/${fileName}.txt`)
}

function getTestFilePath(fileName = 'test1'): string {
  return `${__dirname}/${fileName}.txt`
}

function getTestFileContent(fileName = 'test1'): string {
  return filesystem.read(getTestFilePath(fileName))
}

function getExpectedFileContent(fileName: string): string {
  return getFileContent('expected', fileName)
}

function getOriginalFileContent(fileName: string): string {
  return getFileContent('original', fileName)
}

function getStringMessage(result: string, fileName = 'test1'): string {
  return `${result} - ${__dirname}/${fileName}.txt`
}

function getRcPath(fileName: string): string {
  return `./__tests__/rc/${fileName}.rbumprc.json`
}

beforeEach(async () => resetTestFile())
afterEach(async () => resetTestFile())

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain('0.0.1')
})

test('should bump with value provided by value parameter', async () => {
  initTestFile('simple')
  const output = await cli(`--config ${getRcPath('simple')} --val 100`)
  expect(output).toContain(getStringMessage('✓ CHANGED'))
  expect(getTestFileContent()).toBe(getExpectedFileContent('simple-value'))
})

test('should bump by 1 when no value parameter', async () => {
  initTestFile('simple')
  const output = await cli(`--config ${getRcPath('simple')}`)
  expect(output).toContain(getStringMessage('✓ CHANGED'))
  expect(getTestFileContent()).toBe(getExpectedFileContent('simple-no-value'))
})

test('should not modify file when nothing to modify', async () => {
  initTestFile('simple')
  const output = await cli(`--config ${getRcPath('simple')} --val 1`)
  expect(output).toContain(getStringMessage('❌ NOT CHANGED'))
  expect(getTestFileContent()).toBe(getOriginalFileContent('simple'))
})

test('should not modify file when nothing to modify', async () => {
  const output = await cli(`--config ${getRcPath('nonexisting')} --val 1`)
  expect(output).toContain(getStringMessage('❌ NOT EXIST', 'nonexisting'))
})

test('should modify only first occurrence without flags', async () => {
  initTestFile('multiple')
  await cli(`--config ${getRcPath('simple')}`)
  expect(getTestFileContent()).toBe(getExpectedFileContent('multiple-no-flags'))
})

test('should modify all occurrences with flags', async () => {
  initTestFile('multiple')
  await cli(`--config ${getRcPath('flags')}`)
  expect(getTestFileContent()).toBe(getExpectedFileContent('multiple-flags'))
})

test('should modify by multiple regexes', async () => {
  initTestFile('multiple-regex')
  const output = await cli(`--config ${getRcPath('multiple-regex')}`)
  expect(output).toContain(getStringMessage('✓ CHANGED'))
  expect(getTestFileContent()).toBe(getExpectedFileContent('multiple-regex'))
})

test('should modify multiple files', async () => {
  initTestFile('simple')
  initTestFile('multiple', 'test2')
  const output = await cli(`--config ${getRcPath('multiple-files')}`)
  expect(output).toContain(getStringMessage('✓ CHANGED'))
  expect(output).toContain(getStringMessage('✓ CHANGED', 'test2'))
  expect(getTestFileContent()).toBe(getExpectedFileContent('simple-no-value'))
  expect(getTestFileContent('test2')).toBe(
    getExpectedFileContent('multiple-flags')
  )
})

test('should modify files by user path vars', async () => {
  const nestedPath = `${__dirname}/nested/another/test3.txt`
  filesystem.write(nestedPath, getOriginalFileContent('simple'))
  const output = await cli(`--config ${getRcPath('var-paths')}`)
  expect(output).toContain(`✓ CHANGED - ${nestedPath}`)
  expect(filesystem.read(nestedPath)).toBe(
    getExpectedFileContent('simple-no-value')
  )
})

test('should show error msg when non existing config used', async () => {
  const output = await cli(`--config ./__tests__/nonexisting.json`)
  expect(output).toContain(
    `Unable to read ${__dirname}/nonexisting.json config file`
  )
})
