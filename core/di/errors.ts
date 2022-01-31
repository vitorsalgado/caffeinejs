import { CaffeineError } from '../CaffeineError.js'
import { Ctor } from '../types/Ctor.js'
import { tokenStr } from './Token.js'
import { TokenSpec } from './Token.js'
import { Token } from './Token.js'

export class NoProviderForTokenError extends CaffeineError {
  constructor(token: Token) {
    super(`Could not determine a provider for token: ${tokenStr(token)}`, 'DI_NO_PROVIDER')
    Error.captureStackTrace(this, NoProviderForTokenError)
    this.name = 'NoProviderForTokenError'
  }
}

export class NoUniqueInjectionForTokenError extends CaffeineError {
  constructor(token: Token) {
    super(
      `Found more than one injection for token "${tokenStr(token)}" when a single matching was expected. ` +
        'Use @Named(), @Primary() or conditionals to ensure a single match or make sure your component can receive multiple injections.',
      'DI_NO_UNIQUE_INJECTION'
    )
    Error.captureStackTrace(this, NoUniqueInjectionForTokenError)
    this.name = 'NoUniqueInjectionForTokenError'
  }
}

export class TypeNotRegisteredForInjectionError extends CaffeineError {
  constructor(token: Token) {
    super(
      `Type "${tokenStr(token)}" is not managed by the DI container. ` +
        'Make sure the type is decorated with @Injectable() or any other injection decorators.',
      'DI_TYPE_NOT_REGISTERED'
    )
    Error.captureStackTrace(this, TypeNotRegisteredForInjectionError)
    this.name = 'TypeNotRegisteredForInjectionError'
  }
}

export class UnresolvableConstructorArguments extends CaffeineError {
  constructor(ctor: Ctor) {
    super(`Class ${ctor.name} contains unresolvable constructor arguments.`, 'DI_CTOR_ARGS_UNRESOLVABLE')
    Error.captureStackTrace(this, UnresolvableConstructorArguments)
    this.name = 'UnresolvableConstructorArguments'
  }
}

export class NoResolutionForTokenError extends CaffeineError {
  constructor(spec: { token: Token; tokenType?: Token }) {
    super(
      `Unable to resolve required injection for token "${tokenStr(spec.token)}"${
        spec.token !== spec.tokenType && spec.tokenType ? ' of type ' + tokenStr(spec.tokenType) : ''
      }`,
      'DI_NO_RESOLUTION_FOR_TOKEN'
    )
    Error.captureStackTrace(this, NoResolutionForTokenError)
    this.name = 'NoResolutionForTokenError'
  }
}

export class CircularReferenceError extends CaffeineError {
  constructor(ctor: Ctor) {
    super(
      `Attempt to resolve a undefined injection token. This could mean that the class ${ctor.name} has a ` +
        'circular reference. If this was intentional, make sure to decorate your circular references with @Defer to correctly resolve ' +
        'this class dependencies',
      'DI_CIRCULAR_REFERENCE'
    )
    Error.captureStackTrace(this, CircularReferenceError)
    this.name = 'CircularReferenceError'
  }
}