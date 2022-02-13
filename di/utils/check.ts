export function check(validation: boolean, message: string) {
  if (!validation) {
    throw new Error(message)
  }
}
