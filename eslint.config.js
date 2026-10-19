import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // The original standalone preview shares globals through ordered script tags.
    files: ['requisito-plain/*.js'],
    languageOptions: {
      sourceType: 'script',
    },
    rules: {
      'no-unused-vars': ['error', { vars: 'local', args: 'after-used' }],
    },
  },
  {
    files: ['requisito-plain/app.js'],
    languageOptions: {
      globals: {
        generatePlan: 'readonly',
        baseRequirements: 'readonly',
        ID_GROUP: 'readonly',
      },
    },
  },
])
