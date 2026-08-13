// Configuración de ESLint en formato "flat" (ESLint 9).
//
// Antes no existía este archivo y `npm run lint` ejecutaba `next lint`. Next 16
// eliminó ese subcomando, así que la CLI interpretaba "lint" como el directorio
// del proyecto y fallaba con "Invalid project directory provided". Ahora se
// invoca ESLint directamente con las mismas reglas que traía `next lint`.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      // Tipos generados por Supabase: no son código nuestro.
      'src/lib/supabase/database.types.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // El guion bajo es la convención del proyecto para "existe por la firma
      // pero no se usa" (parámetros de interfaces, destructuring parcial).
      // Sin esto, cumplir un contrato de tipos genera avisos.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
]

export default config
