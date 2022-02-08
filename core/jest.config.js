import Base from '../jest-base.config.js'

export default {
  ...Base,
  displayName: 'core',
  setupFilesAfterEnv: ['../test/jest.setup.ts']
}
