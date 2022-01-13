const config = {
  verbose: true,
  testTimeout: 15000,
  collectCoverage: false,
  resetModules: true,
  restoreMocks: true,
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: '../tsconfig.test.json',
      useESM: true
    }
  },
  collectCoverageFrom: [
    '**/**/*.ts',
    '!**/**/*.config.ts',
    '!**/__fixtures__/**',
    '!**/__mocks__/**',
    '!**/__tests__/**'
  ],
  coveragePathIgnorePatterns: ['/dist/', '<rootDit>/dist', '/node_modules/', '<rootDir>/examples'],
  testPathIgnorePatterns: ['/dist/', '<rootDit>/dist', '/node_modules/', '<rootDir>/examples']
}

export default config
