export async function loadModule(file: string): Promise<void> {
  const path = file

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(path)
  } catch (ex) {
    const err = ex as any
    if (err.code === 'ERR_REQUIRE_ESM' || err.message?.includes('require is not defined')) {
      return await import(path)
    }

    throw ex
  }

  return Promise.resolve()
}
