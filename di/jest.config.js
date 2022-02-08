import Base from '../jest-base.config.js'

const config = {
  ...Base,
  displayName: 'DI',
  setupFilesAfterEnv: ['../test/jest.setup.ts']
}

export default config
