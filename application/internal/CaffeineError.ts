export class CaffeineError extends Error {
  public static CODE_DEFAULT = 'CAF_ERR'
  readonly code: string

  constructor(message: string, code?: string) {
    super(message)
    this.code = code ? `${CaffeineError.CODE_DEFAULT}_${code}` : CaffeineError.CODE_DEFAULT
  }
}
