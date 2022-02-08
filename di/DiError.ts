import { Ctor } from './internal/types/Ctor.js'
import { Identifier } from './Identifier.js'
import { tokenStr } from './Token.js'
import { Token } from './Token.js'

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
    Error.captureStackTrace(this, NoUniqueInjectionForTokenError)
    this.name = 'NoUniqueInjectionForTokenError'
  }
}

export class TypeNotRegisteredForInjectionError extends DiError {
  constructor(token: Token) {
    super(
      `Type "${tokenStr(token)}" is not managed by the DI container. ` +
        'Make sure the type is decorated with @Injectable() or any other injection decorators.',
      'TYPE_NOT_REGISTERED'
    )
    Error.captureStackTrace(this, TypeNotRegisteredForInjectionError)
    this.name = 'TypeNotRegisteredForInjectionError'
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
    Error.captureStackTrace(this, NoResolutionForTokenError)
    this.name = 'NoResolutionForTokenError'
  }
}

export class CircularReferenceError extends DiError {
  constructor(message: string) {
    super(message, 'CIRCULAR_REFERENCE')
    Error.captureStackTrace(this, CircularReferenceError)
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

export class RepeatedBeanNamesConfigurationError extends DiError {
  constructor(clazz: Ctor, identifier: string) {
    super(
      `Found multiple configurations with name ${identifier} on configuration class ${clazz.name}`,
      'MULTIPLE_CONFIG_SAME_NAME'
    )
    this.name = 'RepeatedBeanNamesConfigurationError'
  }
}
