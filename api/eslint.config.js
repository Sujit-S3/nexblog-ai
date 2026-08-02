import js from '@eslint/js';
import nPlugin from 'eslint-plugin-n';
import globals from 'globals';

// First lint pass on a codebase that has never been linted. Correctness
// rules are errors; style/best-practice rules are warnings so the backlog
// is visible without blocking CI. Ratchet warnings to errors incrementally.
export default [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
  js.configs.recommended,
  nPlugin.configs['flat/recommended-module'],
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-useless-assignment': 'warn',
      'n/no-missing-import': 'error',
      'n/no-extraneous-import': 'error',
      'n/no-unpublished-import': 'off',
      'n/no-process-exit': 'warn',
      'n/hashbang': 'off',
      // fetch carries Node's internal "experimental" label through v20 (stable in v21+); CI targets
      // 20.x and it works in practice — worth flagging, not worth failing the build over.
      'n/no-unsupported-features/node-builtins': 'warn',
    },
  },
];
