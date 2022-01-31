export class CaffeineError extends Error {
  readonly code: string

  constructor(readonly message: string, code?: string) {
    super(message)
    this.name = 'CaffeineError'
    this.code = code ? `CAF_ERR_${code}` : 'CAF_ERR'
  }
}
