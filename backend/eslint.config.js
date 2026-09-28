// ESLint "flat config" — finds likely bugs and bad patterns.
// Formatting is left entirely to Prettier (eslint-config-prettier turns off
// any ESLint rules that would fight with it).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Allow intentionally unused args/vars when prefixed with "_" (e.g. `_next`).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Use a real logger later; plain console.log shouldn't slip into modules.
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  prettier,
);
