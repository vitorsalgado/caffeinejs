import { Provider } from '../Provider.js'

export class ValueProvider<T = any> implements Provider<T> {
  constructor(private readonly value: T) {}

  provide(): T {
    return this.value
  }
}
