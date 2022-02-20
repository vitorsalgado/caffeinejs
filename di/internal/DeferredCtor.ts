import { Token } from '../Token.js'

export class DeferredCtor<T> {
  private static readonly PROXY_METHODS: ReadonlyArray<keyof ProxyHandler<object>> = [
    'apply',
    'construct',
    'defineProperty',
    'deleteProperty',
    'get',
    'getOwnPropertyDescriptor',
    'getPrototypeOf',
    'has',
    'isExtensible',
    'ownKeys',
    'preventExtensions',
    'set',
    'setPrototypeOf',
  ]

  constructor(private readonly callback: () => Token<T>) {}

  createProxy(creator: (ctor: Token<T>) => T): T {
    let init = false
    let value: T

    const deferredObject = () => {
      if (!init) {
        value = creator(this.unwrap())
        init = true
      }

      return value
    }

    return new Proxy<any>({}, DeferredCtor.createHandler(deferredObject))
  }

  unwrap(): Token<T> {
    return this.callback()
  }

  private static createHandler<T>(deferredObject: () => T): ProxyHandler<object> {
    const handler: ProxyHandler<object> = {}
    const applyHandler =
      <T>(handler: ProxyHandler<object>, deferredObject: () => T) =>
      (name: keyof ProxyHandler<object>): void => {
        handler[name] = (...args: unknown[]) => {
          args[0] = deferredObject()
          return Reflect[name](...(args as [T & Function, unknown, unknown]))
        }
      }

    DeferredCtor.PROXY_METHODS.forEach(applyHandler(handler, deferredObject))

    return handler
  }
}
