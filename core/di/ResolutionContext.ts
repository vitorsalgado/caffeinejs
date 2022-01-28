import { TypeInfo } from './TypeInfo.js'

export class ResolutionContext<T = unknown> {
  static INSTANCE: ResolutionContext = new ResolutionContext()

  constructor(readonly resolutions: Map<TypeInfo<T>, T> = new Map()) {}
}
