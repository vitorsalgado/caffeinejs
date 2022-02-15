export function promisify(fn: () => Promise<void> | void): Promise<void> {
  const r = fn()

  if (r && 'then' in r && typeof r.then === 'function') {
    return r
  }

  return Promise.resolve()
}
