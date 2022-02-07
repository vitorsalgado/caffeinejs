import { tokenStr } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { Token } from '../Token.js'

export function fmtParamError(ctor: Token, index: number): string {
  if (typeof ctor !== 'function') {
    return `parameter at position ${index}`
  }

  const [, params = null] = ctor.toString().match(/constructor\(([\w, ]+)\)/) || []

  if (params === null) {
    return `parameter at position ${index}`
  }

  const param = params.split(',')[index].trim()

  return `parameter ${param} at position ${index}`
}

export function fmtTokenError(spec: TokenSpec): string {
  return `"${tokenStr(spec.token)}"${
    spec.token !== spec.tokenType && spec.tokenType ? ' of type ' + tokenStr(spec.tokenType) : ''
  }`
}
