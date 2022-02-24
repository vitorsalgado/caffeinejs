import { Container } from '@caffeinejs/di'

export interface OnBootstrap {
  bootstrap(container: Container): Promise<void>
}
