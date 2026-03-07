# Spot Sistemi - Migration Dosyaları

Bu klasördeki SQL dosyalarını Supabase Dashboard'da çalıştırmanız gerekiyor.

## Çalıştırma Sırası (ÖNEMLİ!)

1. **20260303_add_category_column.sql**
   - `social_posts` tablosuna `category` kolonu ekler
   - Kategori bazlı filtreleme için gerekli

2. **20260304_create_spots_table.sql**
   - Ana `spots` tablosunu oluşturur
   - Kullanıcıların aradıkları ürünler için spot oluşturur
   - İçerik: 
     * Tablo yapısı (id, user_id, title, description, category, location, image_url, status, views, helps, timestamps)
     * Performans indexleri (user_id, status, created_at, category)
     * RLS policies (public read, owner CRUD)
     * Auto-update timestamp trigger

3. **20260304_create_sightings_table.sql**
   - `sightings` tablosunu oluşturur
   - "Ben Gördüm" özelliği için kullanılır
   - İçerik:
     * Tablo yapısı (id, spot_id, spotter_id, image_url, location_description, price, notes, created_at)
     * Foreign keys (spots, auth.users)
     * RLS policies (spot owners + spotters can view, authenticated can create)
     * Indexler (spot_id, spotter_id, created_at)

4. **20260304_increment_spot_helps_function.sql**
   - RPC function oluşturur: `increment_spot_helps()`
   - Sighting eklendiğinde spot.helps sayacını güvenli şekilde artırır
   - SECURITY DEFINER ile çalışır

5. **20260307_create_spot_wallet_and_ledger.sql**
   - Spot ekonomisi için `spot_wallets` ve `spot_ledger` tablolarını oluşturur
   - Güvenli RPC fonksiyonları ekler:
     * `get_spot_balance()`
     * `award_spot()`
     * `spend_spot()`
     * `transfer_spot()`
   - RLS ve yetki kurallarını tanımlar (owner read, controlled write)

6. **20260307_spot_wallet_admin_test.sql**
   - Faz 1 doğrulaması için admin test scripti
   - Wallet oluşturma, award, transfer, spend adımlarını test eder
   - Ledger ve bakiye çıktısını doğrulama sorguları içerir

## Supabase'de Nasıl Çalıştırılır?

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Sol menüden **SQL Editor** seç
3. **New Query** butonuna tıkla
4. Yukarıdaki sırayla her dosyayı aç, içeriği kopyala ve SQL Editor'e yapıştır
5. **Run** butonuna tıkla (her dosya için)
6. Her dosya başarıyla çalıştıktan sonra "Success!" mesajı göreceksin

## Kontrol Etme

Migration'lar başarılı oldu mu kontrol etmek için:

```sql
-- 1. Tabloları kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('spots', 'sightings');

-- 2. social_posts.category kolonunu kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'social_posts' 
AND column_name = 'category';

-- 3. RPC fonksiyonunu kontrol et
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'increment_spot_helps';

-- 4. Spot ekonomi tablolarını kontrol et
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('spot_wallets', 'spot_ledger');

-- 5. Spot RPC fonksiyonlarını kontrol et
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
   'get_spot_balance',
   'award_spot',
   'spend_spot',
   'transfer_spot'
)
ORDER BY routine_name;
```

## Sorun Giderme

### "relation already exists" hatası
Bu normal! Tablo zaten varsa bu hatayı alabilirsin. `IF NOT EXISTS` kullandığımız için sorun olmaz.

### RLS policy hataları
Eğer policy zaten varsa, önce DROP edip sonra CREATE yapabilirsin:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

### Function zaten var hatası
`CREATE OR REPLACE FUNCTION` kullandık, bu yüzden sorun olmaz. Fonksiyon güncellenir.

## Test Etme

Migration'ları çalıştırdıktan sonra:

1. `/create-spot` sayfasına git ve yeni bir spot oluştur
2. Ana sayfada "Son Spot'lar" bölümünde göründüğünü kontrol et
3. Spot detay sayfasına git (`/spots/[id]`)
4. "Ben Gördüm" butonuna tıkla
5. Sighting formunu doldur ve gönder
6. spot.helps sayacının arttığını kontrol et

## Yapılan Değişiklikler (Kod)

- ✅ `components/SightingModal.tsx` - Yeni component oluşturuldu
- ✅ `app/spots/[id]/page.tsx` - SightingModal entegre edildi
- ✅ `components/RecentSpots.tsx` - Hazır (migration'dan sonra çalışacak)
- ✅ `app/create-spot/page.tsx` - Hazır (migration'dan sonra çalışacak)

## Sonraki Adımlar (Migration sonrası)

1. Test spot oluştur
2. Sighting ekle ve test et
3. Ana sayfada spot görünümünü kontrol et
4. Leaderboard sistemine geç
5. Notification sistemini aktive et
