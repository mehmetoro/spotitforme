/**
 * seed-from-txt.mjs
 * ==================
 * Reads a seyahat.txt style file and seeds places into the database.
 *
 * File format (see seyahat.txt):
 * ─────────────────────────────
 * 1.
 * <TR title>         ← Turkish title
 * <TR description>   ← Turkish description (multi-line OK)
 * <EN title>
 * <EN description>
 * <DE title>
 * <DE description>
 * <FR title>
 * <FR description>
 * <ES title>
 * <ES description>
 * <RU title>
 * <RU description>
 * 2.
 * ...
 *
 * Each language block = title line + description line (in order: tr, en, de, fr, es, ru)
 *
 * Usage:
 *   node scripts/seed-from-txt.mjs [options]
 *
 * Options:
 *   --file <path>          Input file (default: seyahat.txt in project root)
 *   --category <cat>       Post category (default: culture)
 *   --city <city>          City name (default: İstanbul)
 *   --country <country>    Country (default: Türkiye)
 *   --district <district>  District name (optional)
 *   --lat <number>         Latitude (optional)
 *   --lng <number>         Longitude (optional)
 *   --image <url>          Image URL (optional)
 *   --dry-run              Print parsed places without inserting
 *   --admin-email <email>  Override admin email (default: spotitformeweb@gmail.com)
 *   --url <url>            API base URL (default: http://localhost:3000)
 *
 * You can also put per-place metadata in the txt file using a META line right after the number:
 *   1.
 *   META: city=İstanbul district=Beyoğlu lat=41.0338 lng=28.9760 image=https://...
 *   <TR title>
 *   ...
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const getArg = (flag) => {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}
const hasFlag = (flag) => args.includes(flag)

const FILE_PATH = getArg('--file') || resolve(process.cwd(), 'seyahat.txt')
const CATEGORY  = getArg('--category') || 'culture'
const CITY      = getArg('--city') || 'İstanbul'
const COUNTRY   = getArg('--country') || 'Türkiye'
const DISTRICT  = getArg('--district') || null
const LAT       = getArg('--lat') ? parseFloat(getArg('--lat')) : null
const LNG       = getArg('--lng') ? parseFloat(getArg('--lng')) : null
const IMAGE     = getArg('--image') || null
const DRY_RUN   = hasFlag('--dry-run')
const ADMIN_EMAIL = getArg('--admin-email') || 'spotitformeweb@gmail.com'
const BASE_URL  = getArg('--url') || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || '0ef0a4a1e72055f6c69395cc215331ec50bc017831b488df3221561bd8305225'

// ── Parse txt file ────────────────────────────────────────────────────────────
function parseTxtFile(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  // Split by numeric entry markers like "1.", "2.", "12.", etc.
  const parts = raw.split(/^\d+\.\s*$/m).map(s => s.trim()).filter(Boolean)

  const places = []

  for (const part of parts) {
    const lines = part.split('\n').map(l => l.trim()).filter(Boolean)

    // Parse optional META line
    let meta = {}
    if (lines[0].startsWith('META:')) {
      const metaLine = lines.shift().slice(5).trim()
      metaLine.split(/\s+/).forEach(token => {
        const [k, ...v] = token.split('=')
        if (k && v.length) meta[k.trim()] = v.join('=').trim()
      })
    }

    // We expect exactly 12 lines: title+desc × 6 langs (tr, en, de, fr, es, ru)
    // But descriptions might span multiple lines — let's be smart about it.
    // Strategy: group into 6 pairs by detecting language order.
    // The simplest heuristic: odd indexed lines (0,2,4...) are titles, next is description.
    // Since each place has 6 langs × 2 lines = 12 lines minimum.
    // Multi-line descriptions not supported in this simple version — each entry is one line.

    if (lines.length < 12) {
      console.warn(`⚠  Skipping entry with only ${lines.length} lines (expected 12). Preview: "${lines[0]}"`)
      continue
    }

    const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ru']
    const translations = {}

    for (let i = 0; i < 6; i++) {
      const title = lines[i * 2]
      const description = lines[i * 2 + 1]
      translations[LANGS[i]] = { title, description }
    }

    const place = {
      // Main content from Turkish
      title: translations.tr.title,
      content: translations.tr.description,
      description: translations.tr.description,
      category: meta.category || CATEGORY,
      city: meta.city || CITY,
      district: meta.district || DISTRICT,
      country: meta.country || COUNTRY,
      latitude: meta.lat ? parseFloat(meta.lat) : LAT,
      longitude: meta.lng ? parseFloat(meta.lng) : LNG,
      images: (meta.image || IMAGE) ? [meta.image || IMAGE] : null,
      post_type: 'rare_sight',
      translations,
    }

    // Clean nulls
    Object.keys(place).forEach(k => place[k] === null && delete place[k])

    places.push(place)
  }

  return places
}

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seed(places) {
  // Split into chunks of 10
  const CHUNK = 10
  let totalInserted = 0
  let totalTranslations = 0

  for (let i = 0; i < places.length; i += CHUNK) {
    const chunk = places.slice(i, i + CHUNK)
    console.log(`\n📤 Sending chunk ${Math.floor(i / CHUNK) + 1} (${chunk.length} places)…`)

    const response = await fetch(`${BASE_URL}/api/admin/seed-places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRON_SECRET}`,
        'x-admin-email': ADMIN_EMAIL,
      },
      body: JSON.stringify({ places: chunk }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error(`❌ Chunk ${Math.floor(i / CHUNK) + 1} failed (${response.status}):`, result)
      process.exit(1)
    }

    console.log(`✅ Inserted: ${result.inserted}, Translations: ${result.translationsInserted}`)
    if (result.ids) {
      result.ids.forEach((id, j) => {
        console.log(`   [${i + j + 1}] ${chunk[j].title} → ${id}`)
      })
    }
    if (result.excludedColumns?.length) {
      console.warn(`   ⚠ Excluded columns: ${result.excludedColumns.join(', ')}`)
    }

    totalInserted += result.inserted || 0
    totalTranslations += result.translationsInserted || 0
  }

  console.log(`\n🎉 Done! Total inserted: ${totalInserted}, Total translations: ${totalTranslations}`)
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`📂 Reading: ${FILE_PATH}`)
  let places

  try {
    places = parseTxtFile(FILE_PATH)
  } catch (err) {
    console.error('❌ Failed to parse file:', err.message)
    process.exit(1)
  }

  console.log(`📋 Parsed ${places.length} place(s)`)

  if (DRY_RUN) {
    console.log('\n── DRY RUN ──')
    places.forEach((p, i) => {
      console.log(`\n[${i + 1}] ${p.title}`)
      console.log(`    city: ${p.city || '-'}, district: ${p.district || '-'}`)
      console.log(`    lat: ${p.latitude || '-'}, lng: ${p.longitude || '-'}`)
      console.log(`    langs: ${Object.keys(p.translations).join(', ')}`)
    })
    return
  }

  await seed(places)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
