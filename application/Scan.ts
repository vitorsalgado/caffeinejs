import { Filter } from '@caffeinejs/di'

export interface ScanOptions {
  patterns: string[]
  filters: Filter[]
}

export function Scan(patterns: string[] | Partial<ScanOptions>): ClassDecorator {
  return function (target) {
    console.log(patterns, target)
  }
}
