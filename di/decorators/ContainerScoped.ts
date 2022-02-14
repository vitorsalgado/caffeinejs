import { Lifecycle } from '../Lifecycle.js'
import { ScopedAs } from './ScopedAs.js'

export const ContainerScoped = () => ScopedAs(Lifecycle.CONTAINER)
