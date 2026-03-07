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

7. **20260308_add_sighting_verification_and_spot_reward.sql**
   - Faz 2 için sightings doğrulama state makinesi ekler (`pending/approved/rejected/cancelled`)
   - Spot sahibi onay akışını RPC ile yönetir: `verify_sighting_and_process_reward()`
   - Onaylanınca +1 Spot ödülünü ledger ile yazar (çift ödül korumalı)
   - Spotter'ın pending kaydı iptal etmesi için `cancel_own_pending_sighting()` ekler

8. **20260308_add_shop_product_limits_and_spot_upgrade.sql**
   - Faz 3 için mağaza ürün limiti kolonunu ekler: `shops.product_limit`
   - Plan bazlı limit senkronizasyonu ekler (Starter=`20`, Pro=`100`)
   - Veritabanı seviyesinde ürün ekleme limitini trigger ile zorunlu kılar
   - Spot ile Pro yükseltme RPC fonksiyonunu ekler: `upgrade_shop_to_pro_with_spot()` (10 Spot)

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

-- 6. Faz 2 doğrulama fonksiyonlarını kontrol et
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
   'verify_sighting_and_process_reward',
   'cancel_own_pending_sighting'
)
ORDER BY routine_name;

-- 7. sightings state machine kolonlarını kontrol et
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
   AND table_name = 'sightings'
   AND column_name IN (
      'verification_status',
      'approved_by',
      'approved_at',
      'rejection_reason',
      'spot_reward_granted',
      'spot_reward_ledger_id'
   )
ORDER BY column_name;

-- 8. Faz 3 shop limit kolonunu kontrol et
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'shops'
  AND column_name = 'product_limit';

-- 9. Faz 3 fonksiyonlarını kontrol et
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
   'sync_shop_product_limit',
   'enforce_shop_inventory_limit',
   'upgrade_shop_to_pro_with_spot'
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

1. `/spots/[id]` detayında sighting gönder ve kaydın `pending` geldiğini doğrula.
2. Spot sahibi hesabıyla `verify_sighting_and_process_reward()` çağırarak onay ver; spotter cüzdanına +1 Spot işlendiğini kontrol et.
3. Free (Starter) mağazada 20 ürüne kadar ekleme yap; 21. eklemede DB trigger hatası alındığını doğrula.
4. `upgrade_shop_to_pro_with_spot()` çağır; cüzdandan 10 Spot düştüğünü ve `shops.subscription_type='pro'`, `shops.product_limit=100` olduğunu doğrula.
5. Upgrade sonrası 21+ ürün eklemeyi tekrar dene ve başarılı olduğunu kontrol et.

## Sonraki Adımlar (Migration sonrası)

1. Faz 3 UI akışını canlı veride uçtan uca test et (envanter/add ekranı).
2. Faz 4 için `spot_discount_products` veri modelini eklemeye başla.
3. Spot transferli satın alma akışını (buyer -> seller) ledger üstünden tasarla.
