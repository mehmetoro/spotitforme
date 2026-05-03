import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function readLocalEnv() {
  const envPath = path.join(root, '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found')
  }

  const envText = fs.readFileSync(envPath, 'utf-8')
  const env = {}

  for (const rawLine of envText.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    env[key] = value
  }

  return env
}

function parseArgs() {
  const args = process.argv.slice(2)
  const argMap = new Map()

  for (const arg of args) {
    if (!arg.startsWith('--')) continue
    const [k, v] = arg.slice(2).split('=')
    argMap.set(k, v ?? 'true')
  }

  return {
    file: argMap.get('file') || 'scripts/data/rare-sights.sample.json',
    mode: argMap.get('mode') || 'dry-run',
    batchSize: Number(argMap.get('batch-size') || 100),
    table: argMap.get('table') || 'rare_sights',
    onConflict: argMap.get('on-conflict') || 'id',
    requiredFields: (argMap.get('required-fields') || 'user_id,title,description,location')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  }
}

function normalizeRecord(record) {
  const now = new Date().toISOString()
  const normalized = { ...record }

  if (normalized.created_at == null) normalized.created_at = now
  if (normalized.updated_at == null) normalized.updated_at = now

  if ('image_urls' in normalized && !Array.isArray(normalized.image_urls)) {
    normalized.image_urls = []
  }

  if ('tags' in normalized && !Array.isArray(normalized.tags)) {
    normalized.tags = []
  }

  return normalized
}

function validateRecord(record, index, requiredFields) {
  const missing = []
  for (const field of requiredFields) {
    if (record[field] == null || record[field] === '') {
      missing.push(field)
    }
  }

  if (missing.length > 0) {
    return {
      ok: false,
      message: `Row ${index + 1}: missing required fields -> ${missing.join(', ')}`,
    }
  }

  return { ok: true }
}

async function main() {
  const { file, mode, batchSize, table, onConflict, requiredFields } = parseArgs()
  const allowedModes = new Set(['dry-run', 'upsert'])

  if (!allowedModes.has(mode)) {
    throw new Error('Invalid mode. Use --mode=dry-run or --mode=upsert')
  }

  const env = readLocalEnv()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const fullPath = path.isAbsolute(file) ? file : path.join(root, file)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Data file not found: ${fullPath}`)
  }

  const raw = fs.readFileSync(fullPath, 'utf-8')
  const input = JSON.parse(raw)

  if (!Array.isArray(input)) {
    throw new Error('Input file must be a JSON array')
  }

  console.log(`Input rows: ${input.length}`)
  console.log(`Mode: ${mode}`)
  console.log(`Table: ${table}`)
  console.log(`onConflict: ${onConflict}`)
  console.log(`Required fields: ${requiredFields.join(', ') || '(none)'}`)

  const normalized = []
  const errors = []

  input.forEach((row, idx) => {
    const check = validateRecord(row, idx, requiredFields)
    if (!check.ok) {
      errors.push(check.message)
      return
    }
    normalized.push(normalizeRecord(row))
  })

  if (errors.length > 0) {
    console.log('\nValidation errors:')
    errors.forEach((err) => console.log(`- ${err}`))
    process.exit(1)
  }

  if (mode === 'dry-run') {
    console.log('\nDry-run successful. Preview of first 2 rows:')
    console.log(JSON.stringify(normalized.slice(0, 2), null, 2))
    const inferredColumns = [...new Set(normalized.flatMap((row) => Object.keys(row)))]
    console.log(`\nInferred columns (${inferredColumns.length}): ${inferredColumns.join(', ')}`)
    return
  }

  let inserted = 0

  for (let i = 0; i < normalized.length; i += batchSize) {
    const chunk = normalized.slice(i, i + batchSize)

    const { error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict })

    if (error) {
      throw new Error(`Batch ${i / batchSize + 1} failed: ${error.message}`)
    }

    inserted += chunk.length
    console.log(`Batch ${i / batchSize + 1} ok: +${chunk.length}`)
  }

  console.log(`\nDone. Upserted rows: ${inserted}`)
}

main().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
