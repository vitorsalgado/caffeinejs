import Base from '../jest-base.config.js'

export default {
  ...Base,
  displayName: 'DI',
  setupFilesAfterEnv: ['../test/jest.setup.ts']
}
