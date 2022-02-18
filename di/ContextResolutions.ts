import { Binding } from './Binding.js'

export class ContextResolutions<T = any> {
  static INSTANCE: ContextResolutions = new ContextResolutions()

  constructor(readonly resolutions: Map<Binding<T>, T> = new Map()) {}
}
