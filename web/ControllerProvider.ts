export interface ControllerProvider {
  provide(): unknown
}

export class SingletonControllerProvider implements ControllerProvider {
  provide(): unknown {
    return undefined
  }
}
