/* eslint-disable @typescript-eslint/no-var-requires */

import type { Service } from 'ts-node'
import { interopRequireDefault } from './interopRequireDefault.js'

export async function requireOrImportModule<T>(file: string): Promise<T> {
  const isTs = file.endsWith('.ts')
  const path = file

  if (isTs) {
    return await loadTypeScriptConfigFile(path)
  } else {
    try {
      const required = await import(path)
      const interop = interopRequireDefault(required)

      return interop.default
    } catch (ex) {
      const err = ex as any
      if (err.code === 'ERR_REQUIRE_ESM') {
        const imported = await import(path)

        if (!imported.default) {
          throw new Error(
            `Your version of Node does not support dynamic import - please enable it or use a .cjs file extension for file ${path}`
          )
        }

        return imported.default
      }

      throw ex
    }
  }
}

const loadTypeScriptConfigFile = async <T>(file: string): Promise<T> => {
  let registerer: Service

  try {
    const tsNode = await import('ts-node')
    registerer = tsNode.default.register({
      compilerOptions: {
        module: 'CommonJS'
      }
    })
  } catch (e) {
    const error = e as { message: string; code: string }
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `'ts-node' is required when configuration is a TypeScript file. Make sure it is installed.\nError: ${error.message}`
      )
    }

    throw e
  }

  registerer.enabled(true)

  const imported = await import(file)

  const configObject = interopRequireDefault(imported).default

  registerer.enabled(false)

  return configObject
}
