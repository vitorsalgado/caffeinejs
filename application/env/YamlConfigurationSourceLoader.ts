import { promisify } from 'util'
import Fs from 'fs'
import Yaml from 'js-yaml'
import { ConfigurationSourceLoader } from './ConfigurationSourceLoader.js'
import { ConfigurationSource } from './ConfigurationSource.js'

const readFile = promisify(Fs.readFile)

export class YamlConfigurationSourceLoader implements ConfigurationSourceLoader {
  extensions(): string[] {
    return ['.yml', '.yaml']
  }

  load(source: ConfigurationSource): Promise<object> {
    return readFile(source.source).then(
      content => Yaml.load(content.toString(source.encoding as BufferEncoding), { json: true }) as object,
    )
  }
}
