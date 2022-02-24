import { Container } from '@caffeinejs/di'

export type RegistrarFunction = (container: Container) => Promise<void>

export namespace Registrar {
  const _registrations = new Set<RegistrarFunction>()

  export function bindComponent(registrar: RegistrarFunction) {
    _registrations.add(registrar)
  }

  export async function bootstrap(container: Container) {
    for (const registration of _registrations.values()) {
      await registration(container)
    }
  }
}
