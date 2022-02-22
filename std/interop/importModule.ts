/* eslint-disable @typescript-eslint/no-var-requires */

import type { Service } from 'ts-node'

export async function importModule<T>(file: string): Promise<T> {
  const isTs = file.endsWith('.ts')
  const path = file

  if (isTs) {
    return await loadTs(path)
  } else {
    try {
      const required = require(path)
      const interop = requireDefault(required)

      return interop.default
    } catch (ex: any) {
      if (ex.code === 'ERR_REQUIRE_ESM') {
        const imported = await import(path)

        if (!imported.default) {
          throw new Error(
            `Your version of Node does not support dynamic import - please enable it or use a .cjs file extension for file ${path}`,
          )
        }

        return imported.default
      }

      throw ex
    }
  }
}

const loadTs = async <T>(file: string): Promise<T> => {
  let registerer: Service

  try {
    registerer = require('ts-node').register({
      compilerOptions: {
        module: 'CommonJS',
      },
    })
  } catch (e) {
    const error = e as { message: string; code: string }
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `'ts-node' is required when configuration is a TypeScript file. Make sure it is installed.\nError: ${error.message}`,
      )
    }

    throw e
  }

  registerer.enabled(true)

  const configObject = requireDefault(require(file)).default

  registerer.enabled(false)

  return configObject
}

const requireDefault = (obj: any): any => (obj && obj.__esModule ? obj : { default: obj })
