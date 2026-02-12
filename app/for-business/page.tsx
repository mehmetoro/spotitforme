// app/for-business/page.tsx - DÜZELTMİŞ
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import { sendBusinessRegistrationEmail } from '@/lib/email-server'

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
  acceptTerms: boolean
  acceptPrivacy: boolean
  acceptMarketing: boolean
}

export default function ForBusinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === 'true'
  
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
    monthlySpots: '20-50',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [existingShop, setExistingShop] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [authSuccessCallback, setAuthSuccessCallback] = useState<() => void>(() => {})

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      // Kullanıcının mağazası var mı kontrol et
      checkExistingShop(user.id)
      // Forma email ve isim bilgilerini otomatik doldur
      if (!editMode) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          ownerName: user.user_metadata?.name || ''
        }))
      }
    }
  }

  const checkExistingShop = async (userId: string) => {
    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .single()

    if (shop) {
      setExistingShop(shop)
      if (!editMode) {
        router.push(`/shop/dashboard`)
      } else {
        // Edit modunda formu doldur
        setFormData({
          shopName: shop.shop_name || '',
          ownerName: shop.owner_name || '',
          email: shop.email || '',
          phone: shop.phone || '',
          address: shop.address || '',
          city: shop.city || '',
          website: shop.website || '',
          description: shop.description || '',
          businessType: shop.business_type || 'retail',
          monthlySpots: shop.monthly_capacity || '20-50',
          acceptTerms: true,
          acceptPrivacy: true,
          acceptMarketing: false
        })
      }
    }
  }

  const businessTypes = [
    { id: 'retail', name: 'Perakende Mağaza', icon: '🏪', description: 'Fiziksel veya online mağaza' },
    { id: 'antique', name: 'Antikacı', icon: '🏺', description: 'Antika ve koleksiyon ürünleri' },
    { id: 'collector', name: 'Koleksiyoner', icon: '🎨', description: 'Nadir ve koleksiyonluk ürünler' },
    { id: 'repair', name: 'Tamir Servisi', icon: '🔧', description: 'Onarım ve yedek parça' },
    { id: 'secondhand', name: '2. El Mağaza', icon: '🔄', description: 'İkinci el ürün satışı' },
    { id: 'specialty', name: 'Uzman Mağaza', icon: '🎯', description: 'Özel ürünler (hobi, sanat, vs.)' },
    { id: 'other', name: 'Diğer', icon: '🏢', description: 'Diğer işletme türleri' },
  ]

  const spotRanges = [
    { id: '1-10', name: '1-10 spot/ay', description: 'Yeni başlayanlar için' },
    { id: '10-20', name: '10-20 spot/ay', description: 'Orta ölçekli işletme' },
    { id: '20-50', name: '20-50 spot/ay', description: 'Aktif mağaza' },
    { id: '50-100', name: '50-100 spot/ay', description: 'Büyük ölçekli işletme' },
    { id: '100+', name: '100+ spot/ay', description: 'Çok aktif mağaza' },
  ]

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
    'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin', 'Kayseri', 'Eskişehir',
    'Trabzon', 'Samsun', 'Balıkesir', 'Aydın', 'Muğla', 'Denizli',
    'Tekirdağ', 'Kocaeli', 'Manisa', 'Hatay', 'Sakarya', 'Diyarbakır',
    'Van', 'Malatya', 'Elazığ', 'Erzurum', 'Kahramanmaraş', 'Sivas'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Kullanıcı kontrolü
      if (!user) {
        // Auth modal'ını aç ve form submit callback'ini kaydet
        setAuthSuccessCallback(() => () => handleFormSubmit())
        setShowAuthModal(true)
        setLoading(false)
        return
      }

      // Form submit işlemini yap
      await handleFormSubmit()
      
    } catch (error: any) {
      console.error('Mağaza kaydı hatası:', error)
      
      let errorMessage = 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      
      if (error.message?.includes('unique constraint')) {
        errorMessage = 'Bu email adresiyle zaten bir mağaza kaydı bulunmaktadır.'
      } else if (error.message?.includes('foreign key constraint')) {
        errorMessage = 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      alert('Lütfen Kullanım Koşulları ve Gizlilik Politikasını kabul edin.')
      return
    }

    let result

    if (editMode && existingShop) {
      // Güncelleme modu
      result = await supabase
        .from('shops')
        .update({
          shop_name: formData.shopName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          email: formData.email,
          business_type: formData.businessType,
          monthly_capacity: formData.monthlySpots,
          updated_at: new Date().toISOString(),
          owner_name: formData.ownerName  // EKLENDİ
        })
        .eq('id', existingShop.id)
        .select()
        .single()
    } else {
      // Yeni kayıt
      result = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          shop_name: formData.shopName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          email: formData.email,
          business_type: formData.businessType,
          monthly_capacity: formData.monthlySpots,
          subscription_type: 'free',
          is_verified: false,
          verification_status: 'pending',
          owner_name: formData.ownerName
        })
        .select()
        .single()
    }

    if (result.error) {
      // Mağaza zaten var mı kontrol et
      if (result.error.code === '23505') {
        const { data: existing } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single()
        
        if (existing) {
          alert('Zaten bir mağazanız var. Mağaza panelinize yönlendiriliyorsunuz.')
          router.push(`/shop/dashboard`)
          return
        }
      }
      
      // Daha detaylı hata mesajı
      console.error('Supabase error:', result.error)
      throw new Error(`Supabase error: ${result.error.message} (code: ${result.error.code})`)
    }

    // Email gönder (yeni kayıt için)
    if (!editMode) {
      try {
        await sendBusinessRegistrationEmail(
          formData.email, 
          formData.shopName, 
          user.id
        )
      } catch (emailError) {
        console.warn('Email gönderilemedi:', emailError)
        // Email hatası form submit işlemini durdurmaz
      }
    }

    // Başarılı
    setSubmitted(true)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkUser() // Kullanıcı bilgilerini yenile
    
    // Auth başarılı olduktan sonra kaydedilen callback'i çalıştır
    if (authSuccessCallback) {
      setTimeout(() => {
        authSuccessCallback()
      }, 500) // Kısa bir bekleme süresi
    }
  }

  const handleSkipForNow = () => {
    router.push('/spots')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✅
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {editMode ? 'Mağaza Bilgileriniz Güncellendi!' : 'Mağaza Kaydınız Alındı!'}
            </h1>
            
            <p className="text-gray-600 mb-8">
              <strong>{formData.shopName}</strong> mağazanız için {editMode ? 'bilgileriniz güncellendi' : 'kaydınız başarıyla alındı'}! 🎉
              <br />
              {!editMode && `Onay email'i ${formData.email} adresinize gönderildi.`}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/shop/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg"
              >
                Mağaza Paneline Git
              </button>
              
              <button
                onClick={() => router.push('/create-spot')}
                className="w-full bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-bold py-4 px-8 rounded-xl text-lg"
              >
                İlk Spot'unu Oluştur
              </button>
              
              <button
                onClick={() => {
                  setSubmitted(false)
                  if (editMode) {
                    router.push('/for-business')
                  }
                }}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                {editMode ? 'Başka Bir Mağaza Düzenle' : 'Yeni Mağaza Kaydı Oluştur'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            İşletmeniz İçin <span className="text-blue-600">SpotItForMe</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Müşterilerinizin aradığı ürünleri sizde olduğunu anında bildirin, 
            satışlarınızı artırın ve sadık müşteriler kazanın.
          </p>
          
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🎯 Tamamen Ücretsiz - Sınırsız Spot Oluşturma
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">👁️</div>
              <h3 className="font-bold text-gray-900 mb-2">Binlerce Potansiyel Müşteri</h3>
              <p className="text-gray-600 text-sm">Arayan müşteriler doğrudan size ulaşsın</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Anında Bildirim</h3>
              <p className="text-gray-600 text-sm">Müşteri aradığında hemen haberdar olun</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">Satışları Artırın</h3>
              <p className="text-gray-600 text-sm">Hedefli müşterilerle satış yapın</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">
                {editMode ? 'Mağaza Bilgilerini Güncelle' : 'Ücretsiz Mağaza Kaydı'}
              </h2>
              <p className="opacity-90">
                {editMode 
                  ? 'Mağaza bilgilerinizi güncelleyin' 
                  : 'Formu doldurun, 2 dakikada mağazanızı açın'}
              </p>
            </div>

            {/* User Status */}
            {!user && (
              <div className="mx-8 my-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">🔒</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Giriş Yapmanız Gerekiyor</h3>
                    <p className="text-gray-600 text-sm">
                      Mağaza kaydı için önce giriş yapmalısınız. Hesabınız yoksa 30 saniyede oluşturabilirsiniz.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => {
                      setAuthSuccessCallback(() => () => {}) // Boş callback
                      setShowAuthModal(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                  >
                    Giriş Yap / Kayıt Ol
                  </button>
                  
                  <button
                    onClick={handleSkipForNow}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg"
                  >
                    Şimdilik Atla
                  </button>
                </div>
              </div>
            )}

            {user && (
              <div className="mx-8 my-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">✅</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Giriş Yapıldı</h3>
                    <p className="text-gray-600 text-sm">
                      {user.email} olarak giriş yaptınız. Mağaza kaydına devam edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                {/* İşletme Bilgileri */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                    <span className="text-blue-600">🏪</span> İşletme Bilgileri
                  </h3>
                  
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: Retro Eşya Mağazası, Tekno Parça"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Müşterilerin göreceği isim</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ad Soyad"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">İletişim için gerekli</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Adresi *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="iletisim@magaza.com"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Onay ve bildirimler için</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="05XX XXX XX XX"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Müşterilerin arayabileceği numara</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şehir *
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!user && !editMode}
                      >
                        <option value="">Şehir seçin</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-xs mt-2">İşletmenizin bulunduğu şehir</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İşletme Türü *
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!user && !editMode}
                      >
                        <option value="">Seçiniz</option>
                        {businessTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.icon} {type.name} - {type.description}
                          </option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-xs mt-2">Ana faaliyet alanınız</p>
                    </div>
                  </div>
                </div>

                {/* Adres */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <span className="text-blue-600">📍</span> Adres Bilgileri
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mahalle, cadde, sokak, bina no, daire no..."
                      rows={3}
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">Müşterilerin bulabilmesi için tam adres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website (varsa)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.ornek.com"
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">Müşterilerin ziyaret edebileceği site</p>
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <span className="text-blue-600">📝</span> İşletme Açıklaması
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kısa Tanıtım *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İşletmenizi kısaca tanıtın. Uzmanlık alanlarınız, ürün yelpazeniz, hizmetleriniz..."
                      rows={4}
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Müşteriler bu açıklamayı görecek. Net ve çekici olun.
                    </p>
                  </div>
                </div>

                {/* Tahmini Spot Sayısı */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <span className="text-blue-600">📊</span> Tahmini Aktivite
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Ayda kaç spot oluşturmayı planlıyorsunuz? *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {spotRanges.map(range => (
                        <label 
                          key={range.id}
                          className={`cursor-pointer border-2 rounded-xl p-4 text-center transition duration-200 ${
                            formData.monthlySpots === range.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${(!user && !editMode) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="monthlySpots"
                            value={range.id}
                            checked={formData.monthlySpots === range.id}
                            onChange={(e) => setFormData({...formData, monthlySpots: e.target.value})}
                            className="sr-only"
                            required
                            disabled={!user && !editMode}
                          />
                          <div className="font-bold text-gray-900">{range.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{range.description}</div>
                        </label>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Size özel öneriler sunabilmemiz için bu bilgi önemlidir.
                    </p>
                  </div>
                </div>

                {/* Koşullar */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    <span className="text-blue-600">📜</span> Koşullar ve Onaylar
                  </h3>
                  
                  <div className="space-y-4">
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                        className="mt-1 mr-3"
                        required
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        <a 
                          href="/terms" 
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          SpotItForMe Kullanım Koşulları
                        </a>'nı okudum ve kabul ediyorum. *
                      </span>
                    </label>
                    
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData({...formData, acceptPrivacy: e.target.checked})}
                        className="mt-1 mr-3"
                        required
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        <a 
                          href="/privacy" 
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          SpotItForMe Gizlilik Politikası
                        </a>'nı okudum ve kabul ediyorum. *
                      </span>
                    </label>
                    
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptMarketing}
                        onChange={(e) => setFormData({...formData, acceptMarketing: e.target.checked})}
                        className="mt-1 mr-3"
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        SpotItForMe'den kampanyalar, indirimler ve güncellemeler hakkında 
                        email almak istiyorum. (İsteğe bağlı)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-8 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading || !user}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                        </span>
                      ) : editMode ? (
                        'Mağaza Bilgilerini Güncelle'
                      ) : user ? (
                        'Ücretsiz Mağaza Aç'
                      ) : (
                        'Önce Giriş Yapın'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-8 rounded-xl"
                    >
                      İptal
                    </button>
                  </div>
                  
                  {!user && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm text-center">
                        Mağaza kaydı için önce giriş yapmalısınız. 
                        <button
                          onClick={() => {
                            setAuthSuccessCallback(() => handleFormSubmit)
                            setShowAuthModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium ml-2 underline"
                        >
                          Hemen giriş yapın
                        </button>
                      </p>
                    </div>
                  )}
                  
                  <p className="text-center text-gray-500 text-sm mt-4">
                    Kayıt işlemi tamamlandığında size bir onay email'i göndereceğiz.
                    <br />
                    Ücretsiz paketle başlayın, ileride premium özelliklere geçebilirsiniz.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SSS */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Sıkça Sorulan Sorular</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Mağaza kaydı ücretsiz mi?",
                a: "Evet! SpotItForMe'de mağaza kaydı tamamen ücretsizdir. Sınırsız spot oluşturabilir, binlerce potansiyel müşteriye ulaşabilirsiniz."
              },
              {
                q: "Premium paketler ne zaman gelecek?",
                a: "Premium paketler (PRO, BUSINESS) platform büyüdükçe eklenecek. Şu anda tüm özellikler ücretsiz kullanılabilir."
              },
              {
                q: "Müşteriler beni nasıl bulacak?",
                a: "Müşteriler aradıkları ürünü sizde gördüğünde, mağaza profilinize yönlendirilecek ve iletişim bilgilerinizi görecek."
              },
              {
                q: "Kaç tane spot oluşturabilirim?",
                a: "Ücretsiz pakette aylık spot sınırı yok! Ancak resim yükleme için ayda 20 adet ücretsiz hakkınız var."
              },
              {
                q: "Hangi tür işletmeler katılabilir?",
                a: "Antikacılar, koleksiyonerler, tamir servisleri, ikinci el mağazalar, özel ürün satan tüm işletmeler katılabilir."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-600 mr-3">❓</span>
                  {faq.q}
                </h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Hala sorularınız mı var?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            İşletmeniz için SpotItForMe'yi nasıl kullanabileceğinizi konuşalım.
            Ücretsiz danışmanlık için bize ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:spotitformeweb@gmail.com"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg"
            >
              📧 Email Gönder
            </a>
            <a
              href="tel:+905555555555"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg"
            >
              📞 Ara
            </a>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}