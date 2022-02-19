import { Binding } from './Binding.js'

export class LocalResolutions {
  constructor(readonly resolutions = new Map<unknown, unknown>()) {}

  get<T>(binding: Binding) {
    return this.resolutions.get(binding.id) as T | undefined
  }

  set(binding: Binding, value: unknown) {
    this.resolutions.set(binding.id, value)
  }

  has(binding: Binding) {
    return this.resolutions.has(binding.id)
  }

  delete(binding: Binding) {
    return this.resolutions.delete(binding.id)
  }
}
