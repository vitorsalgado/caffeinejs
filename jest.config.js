'use strict'

const Base = require('./jest-base.config.js')

module.exports = {
  ...Base,

  projects: ['<rootDir>'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      useESM: true
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  modulePathIgnorePatterns: ['dist', 'coverage', 'examples/*', 'benchmarks/*', 'scripts/*'],
  testPathIgnorePatterns: ['/node_modules/', '/benchmarks/', '/examples/', '/dist/', '/out/', '/coverage/', 'scripts/*']
}
