import { Lifecycle } from '../Lifecycle.js'
import { Scoped } from './Scoped.js'

export const Transient = () => Scoped(Lifecycle.TRANSIENT)
