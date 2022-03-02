import { Filter } from '@caffeinejs/di'
import { Reflections } from '@caffeinejs/std'
import { Vars } from './internal/Vars.js'

export interface ScanOptions {
  patterns: string[]
  filters: Filter[]
}

export function Scan(patterns: string | string[] | Partial<ScanOptions>): ClassDecorator {
  return function (target) {
    const opts = typeof patterns === 'string' || Array.isArray(patterns) ? { patterns } : patterns

    Reflections.set(Vars.APP_SCAN, opts, target)
  }
}
