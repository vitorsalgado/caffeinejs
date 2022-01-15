import Base from '../jest-base.config.js'

const config = {
  ...Base,
  displayName: 'core',
  setupFilesAfterEnv: ['../test/jest.setup.ts'],
}

export default config
