export class DiErr extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
  }
}
