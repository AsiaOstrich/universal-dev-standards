import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      // ESLint 10 new rules — warn first, fix progressively
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'off'
    }
  },
  {
    ignores: ['node_modules/', 'tests/', 'bundled/']
  }
];
