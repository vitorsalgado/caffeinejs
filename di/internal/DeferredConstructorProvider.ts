import { DeferredCtor } from '../DeferredCtor.js'
import { ClassProvider } from './ClassProvider.js'

export class DeferredConstructorProvider<T> extends ClassProvider<T> {
  constructor(private readonly deferred: DeferredCtor<T>) {
    super(deferred)
  }
}
