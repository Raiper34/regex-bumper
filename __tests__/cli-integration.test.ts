import { system, filesystem } from 'gluegun'

const src = filesystem.path(__dirname, '..')

const cli = async (cmd) =>
  system.run('node ' + filesystem.path(src, 'bin', 'regex-bumper') + ` ${cmd}`)

beforeEach(async () => {
  filesystem.write(
    `${__dirname}/test.txt`,
    filesystem.read(`${__dirname}/original/file.txt`)
  )
})

afterEach(async () => {
  filesystem.write(
    `${__dirname}/test.txt`,
    filesystem.read(`${__dirname}/original/file.txt`)
  )
})

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain('0.0.1')
})

test('should bump with value provided by value parameter', async () => {
  const output = await cli('--config ./__tests__/test.rbumprc.json --val 100')

  expect(output).toContain(`✓ CHANGED - ${__dirname}/test.txt`)
  expect(filesystem.read(`${__dirname}/test.txt`)).toBe(
    filesystem.read(`${__dirname}/expected/value.txt`)
  )
})

test('should bump by 1 when no value parameter', async () => {
  const output = await cli('--config ./__tests__/test.rbumprc.json')

  expect(output).toContain(`✓ CHANGED - ${__dirname}/test.txt`)
  expect(filesystem.read(`${__dirname}/test.txt`)).toBe(
    filesystem.read(`${__dirname}/expected/no-value.txt`)
  )
})

test('should not modify file when nothing to modify', async () => {
  const output = await cli('--config ./__tests__/test.rbumprc.json --val 1')

  expect(output).toContain(`❌ NOT CHANGED - ${__dirname}/test.txt`)
  expect(filesystem.read(`${__dirname}/test.txt`)).toBe(
    filesystem.read(`${__dirname}/original/file.txt`)
  )
})

// test('outputs help', async () => {
//   const output = await cli('--help')
//   expect(output).toContain('0.0.1')
// })
//
// test('generates file', async () => {
//   const output = await cli('generate foo')
//
//   expect(output).toContain('Generated file at models/foo-model.ts')
//   const foomodel = filesystem.read('models/foo-model.ts')
//
//   expect(foomodel).toContain(`module.exports = {`)
//   expect(foomodel).toContain(`name: 'foo'`)
//
//   // cleanup artifact
//   filesystem.remove('models')
// })
