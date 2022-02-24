const isCI = process.env.CI === 'true'

export default {
  verbose: true,
  testTimeout: 15000,
  collectCoverage: false,
  resetModules: true,
  restoreMocks: true,
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  setupFilesAfterEnv: ['../scripts/jest.setup.js'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: '../tsconfig.test.json',
      useESM: true,
    },
  },
  coverageProvider: 'v8',
  coverageReporters: isCI ? ['json'] : ['text'],
  collectCoverageFrom: [
    '**/di/*/**/*.ts',
    '!**/**/*.config.ts',
    '!**/__fixtures__/**',
    '!**/__mocks__/**',
    '!**/__tests__/**',
    '!**/_fixtures/**',
    '!**/_tests/**',
    '!**/_performance/**',
    '!**/_bench/**',
  ],
  coveragePathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
    '<rootDit>/dist',
    '<rootDir>/examples',
    '<rootDir>/internal',
    '<rootDir>/test',
  ],
  modulePathIgnorePatterns: ['dist', 'coverage', 'examples/*', 'benchmarks/*', 'scripts/*', 'internal/*'],
}
