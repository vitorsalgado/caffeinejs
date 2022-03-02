import { promisify } from 'util'
import Fs from 'fs'
import { Json } from '@caffeinejs/std'
import { SourceLoader } from '../SourceLoader.js'
import { Source } from '../Source.js'

const readFile = promisify(Fs.readFile)

export class JsonSourceLoader implements SourceLoader {
  extensions(): string[] {
    return ['.json']
  }

  load(source: Source): Promise<Json> {
    return readFile(source.source, { encoding: source.encoding }).then(x => JSON.parse(x.toString()))
  }
}
