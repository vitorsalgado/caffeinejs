import { promisify } from 'util'
import Fs from 'fs'
import Yaml from 'js-yaml'
import { Json } from '@caffeinejs/std'
import { SourceLoader } from '../SourceLoader.js'
import { Source } from '../Source.js'

const readFile = promisify(Fs.readFile)

export class YamlSourceLoader implements SourceLoader {
  extensions(): string[] {
    return ['.yml', '.yaml']
  }

  load(source: Source): Promise<Json> {
    return readFile(source.source).then(
      content => Yaml.load(content.toString(source.encoding as BufferEncoding), { json: true }) as Json,
    )
  }
}
