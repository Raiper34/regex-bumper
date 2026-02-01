import {
  GluegunCommand,
  GluegunFilesystem,
  GluegunPrint,
  GluegunPrompt,
} from 'gluegun'

interface Config {
  files: FileConfiguration[]
  varPathFile?: string
}
interface FileConfiguration {
  path: string
  regex: string
  flags?: string
}

const RCFILE = '.rbumprc.json'
const VARPATHFILE = '.varpath'
const PATH_VAR_REGEX = /{([^}]+)}/g
enum MSG {
  Changed = '✓ CHANGED',
  NotChanged = '❌ NOT CHANGED',
  NotExist = '❌ NOT EXIST',
}

async function getPathVar(
  variable: string,
  filesystem: GluegunFilesystem,
  prompt: GluegunPrompt,
  varPathFile?: string
): Promise<string> {
  const envPath = filesystem.resolve(
    filesystem.cwd(),
    varPathFile ?? VARPATHFILE
  )
  if (!filesystem.exists(envPath)) {
    filesystem.write(envPath, '')
  }
  try {
    const env = filesystem.read(envPath)
    return env
      .split('\n')
      .map((line) => line.split('='))
      .find(([key]) => key === variable)[1]
  } catch (e) {
    const { value } = await prompt.ask({
      type: 'input',
      name: 'value',
      message: `Path variable {${variable}} does not exist. Create it now`,
    })
    filesystem.append(envPath, `${variable}=${value}\n`)
    return value
  }
}

async function getPath(
  path: string,
  filesystem: GluegunFilesystem,
  prompt: GluegunPrompt,
  varPathFile?: string
): Promise<string> {
  let finalPath = path
  const matches = [...finalPath.matchAll(new RegExp(PATH_VAR_REGEX, 'g'))]
  for (const match of matches ?? []) {
    finalPath = finalPath.replace(
      `{${match[1]}}`,
      await getPathVar(match[1], filesystem, prompt, varPathFile)
    )
  }
  return filesystem.resolve(filesystem.cwd(), finalPath)
}

async function bumpFiles(
  files: FileConfiguration[],
  { success, error, warning }: GluegunPrint,
  fileSystem: GluegunFilesystem,
  prompt: GluegunPrompt,
  value?: string,
  varPathFile?: string
): Promise<void> {
  for (const file of files) {
    const path = await getPath(file.path, fileSystem, prompt, varPathFile)
    try {
      const fileContent = fileSystem.read(path)
      const fileChangedContent = fileContent.replace(
        new RegExp(file.regex, file.flags),
        (match, group) =>
          match.replace(group, value ?? String(Number(group) + 1))
      )
      if (fileContent === fileChangedContent) {
        warning(`${MSG.NotChanged} - ${path}`)
      } else {
        fileSystem.write(path, fileChangedContent)
        success(`${MSG.Changed} - ${path}`)
      }
    } catch (e) {
      error(`${MSG.NotExist} - ${path}`)
    }
  }
}

const command: GluegunCommand = {
  name: 'regex-bumper',
  run: async (toolbox) => {
    const { print, filesystem, prompt, parameters } = toolbox

    const configPath = filesystem.resolve(
      filesystem.cwd(),
      parameters.options.config ?? RCFILE
    )
    let files: FileConfiguration[] = []
    let varPathFile = null
    try {
      const config = filesystem.read(configPath, 'json') as Config
      files = config.files
      varPathFile = config.varPathFile
    } catch (e) {
      print.error(`Unable to read ${configPath} config file.`)
    }
    files &&
      (await bumpFiles(
        files,
        print,
        filesystem,
        prompt,
        parameters.options.value,
        varPathFile
      ))
  },
}

module.exports = command
