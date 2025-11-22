import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Simplified ESLint config (JS + React). Removed TypeScript plugin import
// because the package 'typescript-eslint' isn't installed in this repo.
export default [
  js.configs.recommended,
  {
    ignores: ['dist', 'src/assets/**', 'src/assets/icons/**', '**/*.min.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Temporarily relax no-unused-vars to warning so we can iteratively fix files
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'ignoreRestSiblings': true }],
    },
  },
  {
    // Node / server and test files
    files: ['server/**', '**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {},
  },
]
