module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'allure-report/',
    'allure-results/',
    'playwright-report/',
    'test-results/',
    '.features-gen/',
    'screenshots/',
    'logs/',
    'KnowledgeBase/',
    'src/resources/utils/',
    'src/resources/test-data/',
    'src/tests/**/__examples-*/**/*.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-console': 'off',
  },
};
