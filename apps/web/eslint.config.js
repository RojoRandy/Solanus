import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Los primitivos de shadcn/ui exportan a la vez el componente y su función
    // `xVariants` (cva) desde el mismo archivo — patrón oficial de la librería.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Inicializar estado desde una fuente externa (localStorage, matchMedia) dentro
    // de un efecto de montaje es el patrón estándar de React para este caso — no
    // dispara la cascada de renders que la regla busca prevenir.
    files: ['src/components/providers/AuthProvider.tsx', 'src/hooks/use-mobile.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
