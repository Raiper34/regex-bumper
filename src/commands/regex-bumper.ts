import {
  GluegunCommand,
  GluegunFilesystem,
  GluegunPrint,
  GluegunPrompt,
} from 'gluegun'

async function getPathVar(
  variable: string,
  filesystem: GluegunFilesystem,
  prompt: GluegunPrompt
): Promise<string> {
  const envPath = filesystem.resolve(filesystem.cwd(), '.env')
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
  prompt: GluegunPrompt
): Promise<string> {
  let finalPath = path
  const regex = new RegExp('{([^}]+)}', 'g')
  const match = regex.exec(finalPath)
  if (match) {
    finalPath = finalPath.replace(
      `{${match[1]}}`,
      await getPathVar(match[1], filesystem, prompt)
    )
  }

  return filesystem.resolve(filesystem.cwd(), finalPath)
}

async function bumpFiles(
  files: any[],
  { success, error, warning }: GluegunPrint,
  fileSystem: GluegunFilesystem,
  prompt: GluegunPrompt
): Promise<void> {
  for (const file of files) {
    const path = await getPath(file.path, fileSystem, prompt)
    try {
      const fileContent = fileSystem.read(path)
      const fileChangedContent = fileContent.replace(
        new RegExp(file.regex, file.flags),
        (match, group) => match.replace(group, String(Number(group) + 1))
      )
      if (fileContent === fileChangedContent) {
        warning(`❌ NOT CHANGED - ${path}`)
      } else {
        fileSystem.write(path, fileChangedContent)
        success(`✓ CHANGED - ${path}`)
      }
    } catch (e) {
      error(`❌ NOT EXIST - ${path}`)
    }
  }
}

const command: GluegunCommand = {
  name: 'regex-bumper',
  run: async (toolbox) => {
    const { print, filesystem, prompt } = toolbox

    const config = filesystem.read(
      filesystem.resolve(filesystem.cwd(), '.rbumprc'),
      'json'
    )
    await bumpFiles(config.files, print, filesystem, prompt)
  },
}

module.exports = command
