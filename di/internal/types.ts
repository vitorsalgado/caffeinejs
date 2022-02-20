export type AbstractCtor<T = any, Arguments extends unknown[] = any[]> = abstract new (...args: Arguments) => T

export type Ctor<T = any, Arguments extends unknown[] = any[]> = new (...args: Arguments) => T

export type Identifier = string | symbol
