import { notNil } from '../../preconditions/notNil.js'
import { Ctor } from '../../types/Ctor.js'
import { DecoratedInjectables } from '../DecoratedInjectables.js'
import { Token } from '../Token.js'
import { ProviderContext } from './Provider.js'
import { Provider } from './Provider.js'

export class FunctionProvider<T = any> extends Provider<T> {
  constructor(private readonly token: Token<T>, private readonly fn: (...args: unknown[]) => T) {
    super()
  }

  provide({ di, resolutionContext }: ProviderContext): T {
    const type = notNil(DecoratedInjectables.instance().get(this.token as Ctor), 'Non registered type')
    const deps = type.dependencies.map(dep =>
      dep.multiple ? di.getMany(dep.token, resolutionContext) : di.get(dep.token, resolutionContext)
    )

    return this.fn(...deps)
  }
}
