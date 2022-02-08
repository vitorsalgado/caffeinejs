import Base from './jest-base.config.js'

export default {
  ...Base,

  projects: ['<rootDir>'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      useESM: true
    }
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  modulePathIgnorePatterns: ['dist', 'coverage', 'examples/*', 'benchmarks/*', 'scripts/*'],
  testPathIgnorePatterns: ['/node_modules/', '/benchmarks/', '/examples/', '/dist/', '/out/', '/coverage/', 'scripts/*']
}
