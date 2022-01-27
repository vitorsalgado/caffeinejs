import { Binding } from './Binding.js'

export class ResolutionContext<T = unknown> {
  static INSTANCE: ResolutionContext = new ResolutionContext()

  constructor(readonly resolutions: Map<Binding<T>, T> = new Map()) {}
}
