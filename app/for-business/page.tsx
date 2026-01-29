// app/for-business/page.tsx
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

interface ShopFormData {
  shopName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  website: string
  description: string
  businessType: string
  monthlySpots: string
}

export default function ForBusinessPage() {
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    website: '',
    description: '',
    businessType: 'retail',
    monthlySpots: '20-50'
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const businessTypes = [
    { id: 'retail', name: 'Perakende Mağaza', icon: '🏪' },
    { id: 'antique', name: 'Antikacı', icon: '🏺' },
    { id: 'collector', name: 'Koleksiyoner', icon: '🎨' },
    { id: 'repair', name: 'Tamir Servisi', icon: '🔧' },
    { id: 'online', name: 'Online Mağaza', icon: '🛒' },
    { id: 'other', name: 'Diğer', icon: '🏢' },
  ]

  const spotRanges = [
    { id: '10-20', name: '10-20 spot/ay' },
    { id: '20-50', name: '20-50 spot/ay' },
    { id: '50-100', name: '50-100 spot/ay' },
    { id: '100+', name: '100+ spot/ay' },
  ]

  const packages = [
    {
      name: 'ÜCRETSİZ',
      price: 0,
      features: [
        '20 adet ücretsiz resim',
        'Temel mağaza profili',
        'Spot oluşturma',
        'Temel istatistikler',
        'Email desteği'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'PRO',
      price: 99,
      features: [
        '100 adet resim hakkı',
        'Gelişmiş mağaza profili',
        'Öne çıkan spot (5 adet)',
        'Detaylı istatistikler',
        'Öncelikli destek',
        'Mağaza haritada gösterim'
      ],
      color: 'blue',
      popular: true
    },
    {
      name: 'BUSINESS',
      price: 299,
      features: [
        '500 adet resim hakkı',
        'Premium mağaza profili',
        'Sınırsız öne çıkan spot',
        'API erişimi',
        'Özel temsilci',
        'Özel kategori oluşturma',
        'Çoklu kullanıcı hesabı'
      ],
      color: 'purple',
      popular: false
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Kullanıcı kontrolü
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Lütfen önce giriş yapın veya kayıt olun')
        setLoading(false)
        return
      }

      // 2. Mağazayı kaydet
      const { error } = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          shop_name: formData.shopName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          subscription_type: 'free',
          monthly_capacity: formData.monthlySpots
        })

      if (error) throw error

      // 3. Başarılı
      setSubmitted(true)
      
      // 4. Email gönder (opsiyonel)
      // await sendBusinessRegistrationEmail(formData.email, formData.shopName)

    } catch (error) {
      console.error('Mağaza kaydı hatası:', error)
      alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            İşletmeniz İçin <span className="text-blue-600">SpotItForMe</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Müşterilerinizin aradığı ürünleri sizde olduğunu anında bildirin, 
            satışlarınızı artırın ve sadık müşteriler kazanın.
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Paketler */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Paketler</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.name}
                    className={`bg-white rounded-2xl shadow-lg border-2 ${
                      pkg.popular 
                        ? 'border-blue-500 transform -translate-y-2' 
                        : 'border-gray-200'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="bg-blue-500 text-white text-center py-2 rounded-t-xl">
                        🏆 EN POPÜLER
                      </div>
                    )}
                    <div className="p-8">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                          <span className="text-gray-500 ml-2">TL/ay</span>
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="text-green-500 mr-3">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button className={`w-full py-3 rounded-lg font-medium ${
                        pkg.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}>
                        {pkg.price === 0 ? 'Ücretsiz Başla' : 'Satın Al'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kayıt Formu */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-center mb-8">
                İşletme Kayıt Formu
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* İşletme Bilgileri */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşletme Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Örn: Retro Eşya Mağazası"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yetkili Kişi Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Ad Soyad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="iletisim@sirket.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şehir *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Seçiniz</option>
                      {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon'].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşletme Türü *
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    >
                      {businessTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Adres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Tam adres bilgisi"
                    rows={3}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (varsa)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="https://www.ornek.com"
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İşletme Açıklaması *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="İşletmenizi tanıtın, uzmanlık alanlarınızı belirtin..."
                    rows={4}
                  />
                </div>

                {/* Tahmini Spot Sayısı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tahmini Aylık Spot Sayınız *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {spotRanges.map(range => (
                      <label 
                        key={range.id}
                        className={`cursor-pointer border-2 rounded-lg p-4 text-center ${
                          formData.monthlySpots === range.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="monthlySpots"
                          value={range.id}
                          checked={formData.monthlySpots === range.id}
                          onChange={(e) => setFormData({...formData, monthlySpots: e.target.value})}
                          className="sr-only"
                        />
                        <span className="font-medium">{range.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gizlilik */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm">
                      <strong>Kullanım Koşulları</strong> ve <strong>Gizlilik Politikası</strong>'nı okudum ve kabul ediyorum. 
                      İşletme bilgilerimin platformda yayınlanmasını onaylıyorum.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-lg disabled:opacity-50"
                  >
                    {loading ? 'Kaydediliyor...' : 'Ücretsiz Kayıt Ol'}
                  </button>
                  <p className="text-gray-500 text-sm mt-4">
                    *İşlem tamamlandığında size bir onay email'i göndereceğiz.
                  </p>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Başarılı Kayıt Mesajı */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✅
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kaydınız Alındı!
            </h2>
            <p className="text-gray-600 mb-8">
              <strong>{formData.shopName}</strong> işletmesi için kaydınız başarıyla alındı. 
              En kısa sürede <strong>{formData.email}</strong> adresinize bir onay email'i göndereceğiz.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Yeni Kayıt Oluştur
              </button>
              <a
                href="/"
                className="w-full block bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg"
              >
                Ana Sayfaya Dön
              </a>
            </div>
          </div>
        )}

        {/* Başarı Hikayeleri */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Başarı Hikayeleri</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl mr-4">
                  🏺
                </div>
                <div>
                  <h4 className="font-bold">Retro Antika</h4>
                  <p className="text-sm text-gray-500">İstanbul / 2 yıldır üyeyiz</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Platform sayesinde aylık satışlarımız %40 arttı. Müşteriler artık doğrudan bizi buluyor."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl mr-4">
                  📱
                </div>
                <div>
                  <h4 className="font-bold">Tekno Parça</h4>
                  <p className="text-sm text-gray-500">Ankara / 1 yıldır üyeyiz</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Eski model telefon parçaları için müşteri bulmak artık çok kolay. 200+ spot çözüldü."
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl mr-4">
                  📚
                </div>
                <div>
                  <h4 className="font-bold">Nadir Kitap</h4>
                  <p className="text-sm text-gray-500">İzmir / 8 aydır üyeyiz</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Koleksiyonerler için nadir kitaplar satıyoruz. SpotItForMe sayesinde hedef kitlemize ulaşıyoruz."
              </p>
            </div>
          </div>
        </div>

        {/* SSS */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Sıkça Sorulan Sorular</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "İşletme olarak nasıl spot oluşturabilirim?",
                a: "Kayıt olduktan sonra mağaza panelinizden ürünlerinizi spot olarak ekleyebilirsiniz. Her spot için fotoğraf, açıklama ve fiyat bilgisi girebilirsiniz."
              },
              {
                q: "Ücretsiz paketin limitleri neler?",
                a: "Ücretsiz pakette ayda 20 adet resim yükleme hakkınız var. Bu, ortalama 15-20 spot oluşturmaya denk gelir."
              },
              {
                q: "Müşteriler beni nasıl bulacak?",
                a: "Müşteriler aradıkları ürünü sizde görünce size özel mağaza profilinize yönlendirilecek ve iletişim bilgilerinizi görecek."
              },
              {
                q: "Ödemeler nasıl yapılıyor?",
                a: "Kredi kartı ile aylık/yıllık ödeme yapabilirsiniz. İlk 14 gün ücretsiz deneme süreniz var."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow">
                <h4 className="font-bold text-lg mb-3">❓ {faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}