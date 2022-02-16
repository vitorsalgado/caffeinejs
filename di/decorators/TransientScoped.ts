import { Lifecycle } from '../Lifecycle.js'
import { ScopedAs } from './ScopedAs.js'

export const TransientScoped = () => ScopedAs(Lifecycle.TRANSIENT)
