#!/usr/bin/env node
/**
 * Ejecuta supabase/tests/rls_isolation.sql contra la base configurada.
 *
 * Existe como wrapper en Node (en vez de poner el comando psql directo en
 * package.json) por una razón práctica: los scripts de npm corren en `cmd.exe`
 * en Windows y en `sh` en macOS/Linux, y la sintaxis para leer una variable de
 * entorno (`%VAR%` vs `$VAR`) no es la misma. Node la lee igual en los tres.
 *
 *   SUPABASE_DB_URL="postgresql://..." npm run test:rls
 *
 * La cadena de conexión sale de: Supabase Dashboard > Project Settings >
 * Database > Connection string > modo "Session". Usa la contraseña de la base,
 * NO el service role.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const SQL = 'supabase/tests/rls_isolation.sql'
const url = process.env.SUPABASE_DB_URL

if (!url) {
  console.error(
    'Falta SUPABASE_DB_URL.\n' +
      '  Dashboard > Project Settings > Database > Connection string (modo "Session").\n' +
      `  Alternativa sin psql: pega ${SQL} entero en el SQL Editor del Dashboard.`,
  )
  process.exit(1)
}
if (!existsSync(SQL)) {
  console.error(`No encuentro ${SQL}. Ejecuta esto desde la raíz del proyecto.`)
  process.exit(1)
}

// -v ON_ERROR_STOP=1: sin esto psql sigue tras un error y termina en 0, que es
// justo lo contrario de lo que queremos en una suite de seguridad.
const r = spawnSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-f', SQL], { stdio: 'inherit' })

if (r.error?.code === 'ENOENT') {
  console.error(
    'No está instalado `psql` (viene con PostgreSQL client tools).\n' +
      `Alternativa: pega ${SQL} entero en el SQL Editor del Dashboard de Supabase.`,
  )
  process.exit(1)
}
process.exit(r.status ?? 1)
