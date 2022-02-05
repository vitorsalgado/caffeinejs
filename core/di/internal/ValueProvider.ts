import { Provider } from './Provider.js'

export class ValueProvider<T = any> extends Provider<T> {
  constructor(private readonly value: T) {
    super()
  }

  provide(): T {
    return this.value
  }
}
