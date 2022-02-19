import { Lifecycle } from '../Lifecycle.js'
import { Scoped } from './Scoped.js'

export const RequestScoped = () => Scoped(Lifecycle.REQUEST)
