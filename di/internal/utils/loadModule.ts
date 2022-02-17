export async function loadModule(file: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(file)
  } catch (ex) {
    const err = ex as any
    if (err.code === 'ERR_REQUIRE_ESM' || err.message?.includes('require is not defined')) {
      return await import(file)
    }

    throw ex
  }

  return Promise.resolve()
}
