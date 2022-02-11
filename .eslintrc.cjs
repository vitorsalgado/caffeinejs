module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'eslint-plugin-tsdoc'],
  extends: ['plugin:@typescript-eslint/recommended'],
  env: {
    node: true
  },
  rules: {
    'tsdoc/syntax': 'error',

    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-dupe-class-members': ['error'],
    '@typescript-eslint/no-empty-function': ['error', { allow: ['decoratedFunctions'] }],
    '@typescript-eslint/no-useless-constructor': ['error'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/ban-types': ['off'],
    '@typescript-eslint/no-namespace': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],

    'node/no-missing-import': ['off'],
    'node/no-unpublished-import': ['off'],

    'import/extensions': ['error', 'ignorePackages', { js: 'always', jsx: 'never', ts: 'never', tsx: 'never' }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object']
      }
    ],
    'import/no-named-as-default': ['off'],
    'import/no-duplicates': ['off'],
    'import/no-mutable-exports': ['error'],
    'import/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true
      }
    ],
    'import/no-self-import': ['error'],
    'import/export': ['error'],
    'import/no-deprecated': ['error']
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'import/extensions': ['off'],
        '@typescript-eslint/no-useless-constructor': ['off'],
        '@typescript-eslint/no-empty-function': ['off'],
        '@typescript-eslint/no-unused-vars': ['off']
      }
    },
    {
      "files": ["*.js"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ]
}
