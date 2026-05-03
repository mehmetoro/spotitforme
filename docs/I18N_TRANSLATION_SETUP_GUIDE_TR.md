SpotItForMe - Coklu Dil ve Otomatik Ceviri Kurulum Kilavuzu

Hedef:
- Spot olusturulunca metin otomatik olarak 6 dile cevrilsin (tr, en, de, fr, es, ru)
- Kullanici ulkesine/diline gore site acilsin
- Kullanici isterse dili elle degistirebilsin

Bu kilavuzda senden beklenen manuel adimlari tek tek yapiyoruz.

Adim 0 - Hazirlik Kontrolu
1) Projede su dosyalar oldugunu dogrula:
- db/migrations/20260502_i18n_spot_translations.sql
- supabase/functions/translate-spot/index.ts
- app/api/translate/route.ts
2) .env.local dosyasi var ve Supabase URL + key dolu olmasi gerekir.

Adim 1 - Hugging Face uzerinde LibreTranslate endpoint alma
Secenek A (En kolay): Hazir LibreTranslate Space fork et
1) huggingface.co hesabina gir
2) New Space tikla
3) Space SDK olarak Docker sec
4) Bos bir Docker Space olustur
5) Asagidaki Dockerfile icerigini Space'e koy:

FROM libretranslate/libretranslate:latest
EXPOSE 7860
CMD ["libretranslate", "--host", "0.0.0.0", "--port", "7860"]

6) Space Build tamamlaninca acilan URL'yi al:
- Ornek: https://kullanici-adi-space-adi.hf.space/translate
7) Test et:
- Browser'da veya Postman'de POST /translate
- Body: {"q":"Merhaba","source":"tr","target":"en","format":"text"}
- Beklenen: translatedText donmeli.

Not:
- Ucretsiz planda uykuya gecebilir. Ilk istekte gecikme normaldir.

Adim 2 - Proje env degiskenine endpoint ekleme
1) Proje kokundeki .env.local dosyasina su satiri ekle:
HUGGINGFACE_LIBRETRANSLATE_URL=https://SENIN-SPACE-URL/translate
2) Kaydet
3) Uygulama calisiyorsa yeniden baslat

Adim 3 - Supabase SQL migration calistirma
1) Supabase Dashboard ac
2) SQL Editor ac
3) db/migrations/20260502_i18n_spot_translations.sql dosyasinin tamamini yapistir
4) Run
5) Basari kontrolu:
- spots tablosunda original_language kolonu var mi?
- spot_translations tablosu olustu mu?
- trg_auto_translate_spot trigger gorunuyor mu?

Adim 4 - Edge Function deploy (translate-spot)
Yontem A - Supabase CLI ile
1) Terminalde proje klasorune gel
2) Ilk kurulum (gerekiyorsa):
- npm i -g supabase
3) Login:
- supabase login
4) Project bagla:
- supabase link --project-ref gobzxreumkbgaohvzoef
5) Function deploy et:
- supabase functions deploy translate-spot --no-verify-jwt

Yontem B - Dashboard ile
1) Supabase Dashboard > Edge Functions
2) translate-spot function olustur
3) supabase/functions/translate-spot/index.ts icerigini yapistir
4) Deploy
5) Function URL not al

Adim 5 - Function secret ekleme
Yontem A - CLI
- supabase secrets set HUGGINGFACE_LIBRETRANSLATE_URL=https://SENIN-SPACE-URL/translate

Yontem B - Dashboard
1) Project Settings > Edge Functions (veya Secrets)
2) New secret ekle
3) Key: HUGGINGFACE_LIBRETRANSLATE_URL
4) Value: https://SENIN-SPACE-URL/translate

Adim 6 - spots insert/update oldugunda function tetikleme
Yontem A - Database Webhook (onerilen)
1) Supabase Dashboard > Database > Webhooks
2) Create Webhook
3) Name: translate-spot-on-change
4) Table: public.spots
5) Events: INSERT ve UPDATE
6) Type: HTTP Request
7) URL: translate-spot function URL
8) HTTP Method: POST
9) Header ekle:
- Content-Type: application/json
10) Save

Not:
- Function artik Supabase webhook payload formatini anlayacak sekilde guncellendi.

Adim 7 - Uctan uca test
1) Sitede yeni bir spot olustur
2) spots tablosunda kayit olusmali
3) spot_translations tablosunda en az 6 dil satiri gorunmeli
4) source dil satiri completed, digerleri completed veya kisa sure pending olabilir

Hata olursa hizli kontrol
1) Function Logs:
- Supabase Dashboard > Edge Functions > translate-spot > Logs
2) En sik hatalar:
- Missing HUGGINGFACE_LIBRETRANSLATE_URL
- Hugging Face endpoint timeout
- Webhook URL yanlis
3) SQL tarafi:
- spot_translations RLS policy ve trigger olusmus mu?

Canliya alma notu
1) Vercel/production env'e de HUGGINGFACE_LIBRETRANSLATE_URL ekle
2) Gecis sonrasi ilk 24 saatte function loglarini yakindan izle
