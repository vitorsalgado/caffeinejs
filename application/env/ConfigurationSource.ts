export interface ConfigurationSource {
  name: string

  source: string

  encoding: BufferEncoding

  loadAsExtension?: string
}
