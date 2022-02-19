import { Lifecycle } from '../Lifecycle.js'
import { Scoped } from './Scoped.js'

export const Singleton = () => Scoped(Lifecycle.SINGLETON)
