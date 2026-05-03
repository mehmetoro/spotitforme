# Bulk Rare Sights Import

Bu akıs MCP gerektirmez. Supabase service role anahtari ile terminalden guvenli sekilde toplu veri gonderebilirsiniz.

Script su an sema-esnektir:
- Veri dosyasindaki ekstra kolonlari (ornek: title_en, title_de, description_en) aynen gonderir.
- Tablo adini ve zorunlu alanlari parametreyle degistirebilirsiniz.

## 1) Veri dosyasi hazirla

Ornek format:
- scripts/data/rare-sights.sample.json

Gerekli alanlar:
- user_id
- title
- description
- location

Opsiyonel alanlar:
- id
- image_urls (array)
- latitude
- longitude
- tags (array)
- is_public
- created_at
- updated_at

## 2) Dry-run yap

```bash
npm run import:rare-sights:dry
```

Bu adim veriyi dogrular, veritabanina yazmaz.

## 3) Veritabanina yaz

```bash
npm run import:rare-sights
```

Not:
- Script upsert calisir (id cakisirsa gunceller, yoksa ekler).
- Farkli dosya / farkli tablo / farkli required alanlar icin direkt komut:

```bash
node scripts/bulk-import-rare-sights.mjs --mode=upsert --file=scripts/data/senin-dosyan.json --table=rare_sights --on-conflict=id --required-fields=user_id,title,description,location --batch-size=100
```

Ornek (coklu dil kolonlariyla):

```bash
node scripts/bulk-import-rare-sights.mjs --mode=upsert --file=scripts/data/rare-sights-tr-en.json --table=rare_sights --required-fields=user_id,title_tr,title_en,location
```

## 4) Guvenlik

- SUPABASE_SERVICE_ROLE_KEY sadece server/terminal tarafinda kullanilmali.
- Bu scripti browser tarafinda calistirmayin.
- Bu dosyayi sadece yetkili kisi kullanmali.
