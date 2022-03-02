export interface Source {
  name: string

  source: string

  encoding: BufferEncoding

  loadAsExtension?: string
}
