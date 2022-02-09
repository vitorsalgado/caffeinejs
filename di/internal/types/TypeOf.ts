export type TypeOf<T extends ((...args: any) => any) | unknown> = T extends new (...args: any) => infer R ? R : any
