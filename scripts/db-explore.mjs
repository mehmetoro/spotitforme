import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// .env.local oku
const envContent = fs.readFileSync(path.join(root, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const eqIdx = line.indexOf('=');
  if (eqIdx < 0) return;
  const key = line.slice(0, eqIdx).trim();
  const val = line.slice(eqIdx + 1).trim();
  env[key] = val;
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('HATA: SUPABASE_URL veya SERVICE_ROLE_KEY eksik');
  process.exit(1);
}

// Service role ile admin client oluştur
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function request(urlStr, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(JSON.stringify(opts.body));
    req.end();
  });
}

async function runSQL(sql) {
  const res = await request(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    body: { query: sql },
  });
  return res;
}

async function getTableList() {
  const sql = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE' 
    ORDER BY table_name;
  `;
  return runSQL(sql);
}

async function getColumns(tableName) {
  const sql = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;
  return runSQL(sql);
}

async function getCount(tableName) {
  const res = await request(
    `${SUPABASE_URL}/rest/v1/${tableName}?select=count`,
    { headers: { Prefer: 'count=exact', Range: '0-0' } }
  );
  return res;
}

async function main() {
  console.log('=== Supabase Veritabani Kesif Raporu ===\n');
  console.log('Proje URL:', SUPABASE_URL, '\n');

  // 1. Tüm tabloları ve kolon bilgisini al
  const { data: tablesData, error: tablesErr } = await admin.rpc('exec_sql', {
    query: `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
  });

  // exec_sql RPC yoksa OpenAPI spec üzerinden dene
  const openApiRes = await new Promise((resolve) => {
    const u = new URL(SUPABASE_URL + '/rest/v1/');
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });

  let tableNames = [];

  if (openApiRes && openApiRes.definitions) {
    tableNames = Object.keys(openApiRes.definitions).sort();
    console.log(`OpenAPI spec'ten ${tableNames.length} tablo/view bulundu:\n`);
    tableNames.forEach(t => console.log('  -', t));
  } else {
    console.log('OpenAPI spec alinamadi, yanit:', JSON.stringify(openApiRes).slice(0, 200));
    process.exit(0);
  }

  // 2. Her tablo için satır sayısı
  console.log('\n=== Tablo Satir Sayilari ===');
  for (const tbl of tableNames) {
    const { count, error } = await admin.from(tbl).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${tbl}: erisim hatasi (${error.message.slice(0,40)})`);
    } else {
      console.log(`  ${tbl}: ${count} satir`);
    }
  }

  // 3. Kolon bilgisi – her tablonun kolonlarını OpenAPI'den al
  console.log('\n=== Tablo Kolonlari ===');
  for (const tbl of tableNames) {
    const def = openApiRes.definitions[tbl];
    if (def && def.properties) {
      const cols = Object.entries(def.properties).map(([name, info]) =>
        `${name}:${info.type || info.format || '?'}${info.description ? ' /*'+info.description.slice(0,30)+'*/' : ''}`
      );
      console.log(`\n  [${tbl}]`);
      cols.forEach(c => console.log('   ', c));
    }
  }
}

main().catch(console.error);
