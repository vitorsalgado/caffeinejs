export abstract class Caller<R> {
  abstract call(): R
}

export class SingletonCaller<T, A extends keyof T, R> extends Caller<R> {
  constructor(private readonly controller: any, private readonly method: A) {
    super()
  }

  call(): R {
    return this.controller[this.method]() as any
  }
}
