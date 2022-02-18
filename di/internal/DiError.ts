import { tokenStr } from '../Token.js'
import { Token } from '../Token.js'
import { Identifier } from './types/Identifier.js'

export class DiError extends Error {
  static CODE_DEFAULT = 'DI_ERR'
  readonly code: string

  constructor(message: string, code?: string) {
    super(message)
    this.code = code ? `${DiError.CODE_DEFAULT}_${code}` : DiError.CODE_DEFAULT
  }
}

export class NoUniqueInjectionForTokenError extends DiError {
  constructor(token: Token) {
    super(
      `Found more than one injection for token "${tokenStr(token)}" when a single matching was expected. ` +
        'Use @Named(), @Primary() or conditionals to ensure a single match or make sure your component can receive multiple injections.',
      'NO_UNIQUE_INJECTION'
    )
    this.name = 'NoUniqueInjectionForTokenError'
  }
}

export class NoResolutionForTokenError extends DiError {
  constructor(spec: { token: Token; tokenType?: Token }, message?: string) {
    super(
      message
        ? message
        : `Unable to resolve required injection for token "${tokenStr(spec.token)}"${
            spec.token !== spec.tokenType && spec.tokenType ? ' of type ' + tokenStr(spec.tokenType) : ''
          }`,
      'NO_RESOLUTION_FOR_TOKEN'
    )
    this.name = 'NoResolutionForTokenError'
  }
}

export class CircularReferenceError extends DiError {
  constructor(message: string) {
    super(message, 'CIRCULAR_REFERENCE')
    this.name = 'CircularReferenceError'
  }
}

export class ScopeNotRegisteredError extends DiError {
  constructor(scopeId: Identifier) {
    super(
      `Scope ${scopeId.toString()} is not registered! If this is a valid scope, use DI.bindScope() static method to register it.`,
      'SCOPE_NOT_REGISTERED'
    )
    this.name = 'ScopeNotRegisteredError'
  }
}

export class ScopeAlreadyRegisteredError extends DiError {
  constructor(scopeId: Identifier) {
    super(`Scope ${scopeId.toString()} is already registered!`, 'SCOPE_ALREADY_REGISTERED')
    this.name = 'ScopeAlreadyRegisteredError'
  }
}

export class RepeatedNamesError extends DiError {
  constructor(message: string) {
    super(message, 'REPEATED_NAMES')
    this.name = 'RepeatedNamesError'
  }
}

export class InvalidBindingError extends DiError {
  constructor(message: string) {
    super(message, 'INVALID_BINDING')
    this.name = 'InvalidBindingError'
  }
}

export class MultiplePrimaryError extends DiError {
  constructor(message: string) {
    super(message, 'MULTIPLE_PRIMARY_SAME_COMPONENT')
    this.name = 'MultiplePrimaryError'
  }
}

export class IllegalScopeStateError extends DiError {
  constructor(message: string) {
    super(message, 'ILLEGAL_SCOPE_STATE')
    this.name = 'IllegalScopeStateError'
  }
}

export class OutOfScopeError extends DiError {
  constructor(message: string) {
    super(message, 'OUT_OF_SCOPE')
    this.name = 'OutOfScopeError'
  }
}

export class InvalidInjectionToken extends DiError {
  constructor(message: string) {
    super(message, 'INVALID_INJECTION_TOKEN')
    this.name = 'InvalidInjectionToken'
  }
}
