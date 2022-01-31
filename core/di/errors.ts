import { CaffeineError } from '../CaffeineError.js'
import { Ctor } from '../types/Ctor.js'
import { TokenSpec } from './Token.js'
import { Token } from './Token.js'

export class NoProviderForTokenError extends CaffeineError {
  constructor(token: Token) {
    super(`Could not determine a provider for token: ${String(token)}`, 'DI_NO_PROVIDER')
    Error.captureStackTrace(this, NoProviderForTokenError)
    this.name = 'NoProviderForTokenError'
  }
}

export class NoUniqueInjectionForTokenError extends CaffeineError {
  constructor(token: Token) {
    super(
      `Found more than one injection for token "${String(token)}" when a single matching was expected. ` +
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
      `Type "${String(token)}" is not managed by the DI container. ` +
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
  constructor(spec: TokenSpec) {
    super(
      `Unable to resolve required injection for token "${String(spec.token)}" of type "${String(spec.tokenType)}"`,
      'DI_NO_RESOLUTION_FOR_TOKEN'
    )
    Error.captureStackTrace(this, NoResolutionForTokenError)
    this.name = 'NoResolutionError'
  }
}
