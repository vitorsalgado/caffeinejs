import { Json } from '@caffeinejs/std'
import { Source } from './Source.js'

export interface SourceLoader {
  extensions(): string[]

  load(source: Source): Promise<Json>
}
