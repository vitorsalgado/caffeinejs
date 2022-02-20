import { Ctor } from './Ctor.js'

export type ClazzDecorator<T> = (target: Ctor<T>) => void
