import { Lifecycle } from '../Lifecycle.js'
import { ScopedAs } from './ScopedAs.js'

export const RequestScoped = () => ScopedAs(Lifecycle.REQUEST)
