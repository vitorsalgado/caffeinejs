import { tokenStr } from '../Token.js'
import { TokenSpec } from '../Token.js'
import { Token } from '../Token.js'

export function fmtParamError(ctor: Token, indexOrProp: number | (string | symbol)): string {
  const isNum = typeof indexOrProp === 'number'
  const msg = isNum ? `parameter at position ${indexOrProp}` : `property ${String(indexOrProp)}`

  if (typeof ctor !== 'function') {
    return msg
  }

  const [, params = null] = ctor.toString().match(/constructor\(([\w, ]+)\)/) || []

  if (params === null) {
    return msg
  }

  if (isNum) {
    return `parameter ${params.split(',')[indexOrProp].trim()} at position ${indexOrProp}`
  }

  return msg
}

export function fmtTokenError(spec: TokenSpec): string {
  return `"${tokenStr(spec.token)}"${
    spec.token !== spec.tokenType && spec.tokenType ? ' of type ' + tokenStr(spec.tokenType) : ''
  }`
}
