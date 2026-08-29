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
    // Les fichiers de configuration tournent sous Node, pas dans le navigateur.
    files: ['*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Les tests remplacent les primitives de React : les regles des hooks ne
    // s'appliquent pas a du code qui n'est jamais rendu.
    files: ['src/tests/**/*.js'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
])
