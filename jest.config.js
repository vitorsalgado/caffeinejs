import Base from './jest-base.config.js'

export default {
  ...Base,

  projects: ['<rootDir>'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      useESM: true,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/jest.setup.js'],
}
