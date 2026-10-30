import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', 'coverage/**', 'index (3).html'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    files: ['frontend/src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['backend/**/*.js', 'frontend/tests/**/*.js', '*.config.js', 'frontend/*.config.js'],
    languageOptions: { globals: globals.node },
  },
];
