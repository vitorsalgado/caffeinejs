import { Binding } from './Binding.js'

export class LocalResolutions<T = any> {
  static INSTANCE: LocalResolutions = new LocalResolutions()

  constructor(readonly resolutions: Map<Binding<T>, T> = new Map()) {}
}
