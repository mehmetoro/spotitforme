'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import LocationSelector from './LocationSelector'
import AuthModal from './AuthModal'

interface QuickSightingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialSourceType?: 'physical' | 'virtual'
  initialProductUrl?: string
  initialDescription?: string
}

export default function QuickSightingModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialSourceType,
  initialProductUrl,
  initialDescription,
}: QuickSightingModalProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentNoktaBalance, setCurrentNoktaBalance] = useState<number | null>(null)
  const [sourceType, setSourceType] = useState<'physical' | 'virtual'>('physical')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingWarning, setPendingWarning] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    hashtags: '',
    price: '',
    addToMuseum: false,
    hasPhoto: false,
    product_url: '',
    marketplace: '',
    seller_name: '',
    link_preview_title: '',
    link_preview_image: '',
    link_preview_description: '',
    link_preview_brand: '',
    link_preview_availability: '',
    link_preview_currency: 'TRY',
    source_domain: '',
  })
  const hashtagCount = formData.hashtags
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith('#')).length
  const suggestedHashtags = suggestHashtagsFromText([
    formData.title,
    formData.description,
    formData.link_preview_title,
    formData.link_preview_description,
    formData.category,
    formData.marketplace,
  ]).filter((tag) => !formData.hashtags.includes(tag))

  const commonCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED', 'SAR']
  const selectedCurrency = (formData.link_preview_currency || 'TRY').toUpperCase()
  const currencyOptions = commonCurrencies.includes(selectedCurrency)
    ? commonCurrencies
    : [...commonCurrencies, selectedCurrency]

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    if (code === 'JPY') return '¥'
    if (code === 'CNY') return '¥'
    return `${code} `
  }

  const buildCombinedDetail = (manualDetail: string, previewDetail: string) => {
    const normalizedManual = manualDetail.trim()
    const normalizedPreview = previewDetail.trim()

    if (normalizedManual && normalizedPreview) {
      if (normalizedManual.toLowerCase().includes(normalizedPreview.toLowerCase())) {
        return normalizedManual
      }
      return `${normalizedManual}\n\nUrun detayi: ${normalizedPreview}`
    }

    return normalizedManual || normalizedPreview || ''
  }

  const parsePriceNumber = (value: string) => {
    const text = (value || '').trim()
    if (!text) return null
    const match = text.match(/([0-9]+(?:[\s.,][0-9]+)*)/)
    let numeric = (match?.[1] || '').replace(/\s+/g, '')
    if (!numeric) return null

    const hasComma = numeric.includes(',')
    const hasDot = numeric.includes('.')
    const commaThousandsOnly = /^\d{1,3}(,\d{3})+$/.test(numeric)
    const dotThousandsOnly = /^\d{1,3}(\.\d{3})+$/.test(numeric)

    if (hasComma && hasDot) {
      const lastComma = numeric.lastIndexOf(',')
      const lastDot = numeric.lastIndexOf('.')
      if (lastComma > lastDot) {
        numeric = numeric.replace(/\./g, '').replace(',', '.')
      } else {
        numeric = numeric.replace(/,/g, '')
      }
    } else if (hasComma) {
      if (commaThousandsOnly) {
        numeric = numeric.replace(/,/g, '')
      } else if (/,[0-9]{1,2}$/.test(numeric)) {
        numeric = numeric.replace(/\./g, '').replace(',', '.')
      } else {
        numeric = numeric.replace(/,/g, '')
      }
    } else if (hasDot) {
      if (dotThousandsOnly) {
        numeric = numeric.replace(/\./g, '')
      } else if (/\.[0-9]{1,2}$/.test(numeric)) {
        numeric = numeric.replace(/,/g, '')
      } else {
        numeric = numeric.replace(/\./g, '')
      }
    }

    const parsed = Number(numeric)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return parsed
  }

  useEffect(() => {
    if (!isOpen) return

    if (initialSourceType) {
      setSourceType(initialSourceType)
    }

    if (initialProductUrl || initialDescription) {
      setFormData((prev) => ({
        ...prev,
        product_url: initialProductUrl || prev.product_url,
        title: initialDescription || prev.title,
      }))
    }
  }, [isOpen, initialSourceType, initialProductUrl, initialDescription])

  const fetchLinkPreview = async () => {
    if (!formData.product_url.trim()) return
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(formData.product_url.trim())}`)
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Link okunamadi')

      setFormData((prev) => ({
        ...prev,
        title: prev.title ? prev.title : (payload.title || prev.title),
        description: prev.description ? prev.description : (payload.description || prev.description),
        price: prev.price ? prev.price : (payload.price || prev.price),
        link_preview_title: payload.title || prev.link_preview_title,
        link_preview_image: payload.image || prev.link_preview_image,
        link_preview_description: payload.description || prev.link_preview_description,
        link_preview_brand: payload.brand || prev.link_preview_brand,
        link_preview_availability: payload.availability || prev.link_preview_availability,
        link_preview_currency: payload.currency || prev.link_preview_currency,
        marketplace: payload.marketplace || prev.marketplace,
        seller_name: payload.seller || prev.seller_name,
        product_url: payload.url || prev.product_url,
        source_domain: payload.domain || prev.source_domain,
      }))
    } catch (error: any) {
      alert(error?.message || 'Link onizlemesi alinamadi')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleLocationSelect = (location: any) => {
    setLocationData(location)
  }

  const handlePhotoToggle = (checked: boolean) => {
    setFormData({...formData, hasPhoto: checked})
    if (!checked) {
      setPhotoFile(null)
      setPhotoPreview(null)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Max 5MB kontrolü
      if (file.size > 5 * 1024 * 1024) {
        alert('Resim boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addSuggestedHashtag = (tag: string) => {
    const currentTags = formData.hashtags.trim()
    if (currentTags.includes(tag)) return
    setFormData({
      ...formData,
      hashtags: currentTags ? `${currentTags} ${tag}` : tag,
    })
  }

  const calculatePoints = () => {
    let points = 5 // Temel puan
    
    if (formData.hasPhoto) points += 10
    if (locationData || sourceType === 'virtual') points += 5
    if (formData.category) points += 3
    
    return points
  }

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchNoktaBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (!user) {
          setCurrentNoktaBalance(0)
          return
        }

        const { data: walletData } = await supabase
          .from('spot_wallets')
          .select('nokta_balance')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!isMounted) return
        setCurrentNoktaBalance(walletData?.nokta_balance || 0)
      } catch {
        if (isMounted) setCurrentNoktaBalance(0)
      }
    }

    fetchNoktaBalance()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const noktaBefore = currentNoktaBalance ?? 0
  const noktaProgressBefore = noktaBefore % 10
  const willConvertToSpot = noktaProgressBefore === 9
  const noktaProgressAfter = willConvertToSpot ? 0 : noktaProgressBefore + 1
  const progressFillPercent = willConvertToSpot ? 100 : (noktaProgressAfter / 10) * 100
  const previewPriceNumber = parsePriceNumber(formData.price)

  const handleSubmit = async () => {
    if (sourceType === 'physical' && !locationData) {
      alert('Lütfen konum seçin')
      return
    }

    if (sourceType === 'virtual' && !formData.product_url.trim()) {
      alert('Sanal nadir paylaşımı için ürün linki zorunlu')
      return
    }

    const normalizedTitle = (formData.title || '').trim()
    if (sourceType === 'physical' && normalizedTitle.length < 10) {
      alert('Fiziksel paylaşım için başlık zorunlu. En az 10 karakterle ürün adı/model yazın.')
      return
    }

    if (sourceType === 'virtual' && normalizedTitle.length < 10 && !formData.link_preview_title.trim()) {
      alert('Başlık en az 10 karakter olmalı. Ürün adı, seri veya model bilgisi ekleyin.')
      return
    }

    if (sourceType === 'physical' && !formData.description.trim()) {
      alert('Lütfen ne gördüğünüzü yazın')
      return
    }

    if (hashtagCount === 0) {
      alert('En az 1 hashtag ekleyin. Etiketler paylaşımınızın keşfini artırır.')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setShowAuthModal(true)
        return
      }

      let photoUrl = null
      
      // 1. Fotoğraf yükle
      if (photoFile) {
        const fileName = buildSeoImageFileName({
          folder: 'sightings',
          userId: user.id,
          title: formData.title || formData.link_preview_title || formData.description,
          originalName: photoFile.name,
        })
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, photoFile)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }
      if (!photoUrl && sourceType === 'virtual' && formData.link_preview_image.trim()) {
        photoUrl = formData.link_preview_image.trim()
      }

      const hasAnyPhoto = Boolean(photoUrl)

      // 2. Quick sighting oluştur
      const basePayload: Record<string, any> = {
        user_id: user.id,
        title: sourceType === 'virtual'
          ? formData.link_preview_title || formData.title || null
          : formData.title || null,
        description: buildCombinedDetail(formData.description, formData.link_preview_description),
        category: formData.category,
        hashtags: formData.hashtags.trim() || null,
        has_photo: hasAnyPhoto || formData.hasPhoto,
        is_in_museum: formData.addToMuseum,
        helper_commission_rate: 15,
        photo_url: photoUrl,
        location_name: sourceType === 'physical' ? locationData.name : (formData.marketplace || formData.source_domain || 'Sanal ortam'),
        address: sourceType === 'physical' ? locationData.address : formData.product_url,
        latitude: sourceType === 'physical' ? locationData.latitude : null,
        longitude: sourceType === 'physical' ? locationData.longitude : null,
        city: sourceType === 'physical' ? locationData.city : null,
        district: sourceType === 'physical' ? locationData.district : null,
        points_earned: calculatePoints(),
        status: 'active',
        source_channel: sourceType,
        product_url: formData.product_url || null,
        marketplace: formData.marketplace || null,
        seller_name: formData.seller_name || null,
        link_preview_title: formData.link_preview_title || null,
        link_preview_image: formData.link_preview_image || null,
        link_preview_description: formData.link_preview_description || null,
        link_preview_brand: formData.link_preview_brand || null,
        link_preview_availability: formData.link_preview_availability || null,
        source_domain: formData.source_domain || null,
      }

      // Pre-publish URL kontrolü (sadece sanal paylaşımlar)
      let isPendingReview = false
      if (sourceType === 'virtual' && formData.product_url.trim()) {
        try {
          const checkRes = await fetch('/api/product-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.product_url.trim() }),
          })
          const checkData = await checkRes.json()
          if (checkData.status === 'active') {
            // Satın alınabilir: direkt yayına al
            basePayload.is_hidden = false
            basePayload.product_check_status = 'active'
          } else {
            // Stokta yok, kaldırılmış, bot engeli vb: manuel onaya at
            basePayload.is_hidden = true
            basePayload.product_check_status = 'pending_review'
            isPendingReview = true
          }
        } catch {
          // Kontrol hatası: manuel onaya at
          basePayload.is_hidden = true
          basePayload.product_check_status = 'pending_review'
          isPendingReview = true
        }
      }

      // Fiyat varsa normalize et; geçersizse kullanıcıyı uyar
      if (formData.price) {
        const parsedPrice = parsePriceNumber(formData.price)
        if (parsedPrice == null) {
          alert('Fiyat bilgisi okunamadı. Lütfen 1139.99 veya 1139,99 formatında girin.')
          setLoading(false)
          return
        }
        basePayload.price = parsedPrice
      }

      basePayload.link_preview_currency = formData.link_preview_currency || null

      let { data: sighting, error: sightingError } = await supabase
        .from('quick_sightings')
        .insert(basePayload)
        .select()
        .single()

      // bazı kolonlar henüz migration almamış olabilir; sadece hata veren alanları kaldırıp tekrar dene
      if (sightingError && (
        sightingError.message?.includes('price') ||
        sightingError.message?.includes('is_in_museum') ||
        sightingError.message?.includes('helper_commission_rate') ||
        sightingError.message?.includes('hashtags')
      )) {
        if (sightingError.message?.includes('price')) delete basePayload.price
        if (sightingError.message?.includes('is_in_museum')) delete basePayload.is_in_museum
        if (sightingError.message?.includes('helper_commission_rate')) delete basePayload.helper_commission_rate
        if (sightingError.message?.includes('hashtags')) delete basePayload.hashtags
        const retry = await supabase
          .from('quick_sightings')
          .insert(basePayload)
          .select()
          .single()
        sighting = retry.data
        sightingError = retry.error
      }

      // Yeni sanal yardım kolonları henüz yoksa sadece ilgili alanları kaldırıp tekrar dene
      if (sightingError && (
        sightingError.message?.includes('product_url') ||
        sightingError.message?.includes('marketplace') ||
        sightingError.message?.includes('seller_name') ||
        sightingError.message?.includes('link_preview_title') ||
        sightingError.message?.includes('link_preview_image') ||
        sightingError.message?.includes('link_preview_description') ||
        sightingError.message?.includes('link_preview_brand') ||
        sightingError.message?.includes('link_preview_availability') ||
        sightingError.message?.includes('link_preview_currency') ||
        sightingError.message?.includes('title') ||
        sightingError.message?.includes('source_domain')
      )) {
        // source_channel KALDIRILMAMALI — hangi sayfada görüneceğini belirler
        if (sightingError.message?.includes('product_url')) delete basePayload.product_url
        if (sightingError.message?.includes('marketplace')) delete basePayload.marketplace
        if (sightingError.message?.includes('seller_name')) delete basePayload.seller_name
        if (sightingError.message?.includes('link_preview_title')) delete basePayload.link_preview_title
        if (sightingError.message?.includes('link_preview_image')) delete basePayload.link_preview_image
        if (sightingError.message?.includes('link_preview_description')) delete basePayload.link_preview_description
        if (sightingError.message?.includes('link_preview_brand')) delete basePayload.link_preview_brand
        if (sightingError.message?.includes('link_preview_availability')) delete basePayload.link_preview_availability
        if (sightingError.message?.includes('link_preview_currency')) delete basePayload.link_preview_currency
        if (sightingError.message?.includes('title')) delete basePayload.title
        if (sightingError.message?.includes('source_domain')) delete basePayload.source_domain

        const retryWithoutVirtualFields = await supabase
          .from('quick_sightings')
          .insert(basePayload)
          .select()
          .single()

        sighting = retryWithoutVirtualFields.data
        sightingError = retryWithoutVirtualFields.error
      }

      if (sightingError) throw sightingError

      // 3. Puan ekle (gamification)
      await supabase.rpc('add_user_points', {
        user_id: user.id,
        points_to_add: calculatePoints(),
        activity_type: 'quick_sighting'
      })

      // 4. Badge kontrolü (ilk sighting)
      const { data: reputation } = await supabase
        .from('user_reputation')
        .select('total_sightings')
        .eq('user_id', user.id)
        .single()

      if (reputation?.total_sightings === 1) {
        await supabase.rpc('award_badge', {
          user_id: user.id,
          badge_id: 'first_sighting'
        })
      }

      // 5. Ana sayfada gösterilmek üzere global state'e ekle
      // (Real-time için Supabase Realtime kullanılabilir)
      
      // 6. Social feed'e ekle (opsiyonel)
      if (process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true') {
        await supabase.from('social_posts').insert({
          user_id: user.id,
          post_type: 'rare_sight',
          content: `"${formData.title || formData.description}" gördüm!`,
          location: sourceType === 'physical' ? locationData.name : (formData.marketplace || 'Sanal ortam'),
          city: sourceType === 'physical' ? (locationData.city || null) : null,
          district: sourceType === 'physical' ? (locationData.district || null) : null,
          image_urls: photoUrl ? [photoUrl] : [],
          hashtags: ['#nadirgördüm', '#spotitforme']
        })
      }

      // Başarı mesajı
      alert(`🎉 Bildiriminiz kaydedildi! +1 Nokta kazandınız. Her 10 Nokta otomatik olarak 1 Spot'a dönüşür. Ayrıca ${calculatePoints()} puan kazandınız.${formData.addToMuseum ? ' Paylaşımınız nadir müzenize eklendi.' : ''}`)
      
      // Formu sıfırla
      setFormData({
        title: '', description: '', category: '', hashtags: '', price: '', addToMuseum: false, hasPhoto: false,
        product_url: '', marketplace: '', seller_name: '', link_preview_title: '', link_preview_image: '',
        link_preview_description: '', link_preview_brand: '', link_preview_availability: '', link_preview_currency: 'TRY', source_domain: ''
      })
      setLocationData(null)
      setPhotoFile(null)
      setPhotoPreview(null)
      
      // Sanal yardım ise sanal yardımlar sayfasına yönlendir
      if (sourceType === 'virtual') {
        if (isPendingReview) {
          setPendingWarning('Paylaşımınız alındı. Ürün bağlantısı otomatik doğrulanamadığı için incelendikten sonra yayınlanacaktır.')
          setLoading(false)
          setTimeout(() => {
            onClose()
            router.push('/virtual-sightings?tab=virtual-helps')
          }, 3000)
          return
        }
        onClose()
        router.push('/virtual-sightings?tab=virtual-helps')
      } else {
        onClose()
        if (onSuccess) onSuccess()
        router.refresh()
      }

    } catch (error: any) {
      console.error('Bildirim hatası:', error)
      alert(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          {pendingWarning && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⏳ {pendingWarning}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">👁️ Nadir Gördüm!</h2>
              <p className="text-gray-600">Hızlıca bildirim gönder, puan kazan</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-gray-200 p-1 grid grid-cols-2 gap-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setSourceType('physical')}
              className={`px-3 py-2 text-sm rounded-lg font-semibold ${sourceType === 'physical' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
            >
              Fiziksel
            </button>
            <button
              type="button"
              onClick={() => setSourceType('virtual')}
              className={`px-3 py-2 text-sm rounded-lg font-semibold ${sourceType === 'virtual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}`}
            >
              Sanal
            </button>
          </div>

          {/* Başlık / Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder={sourceType === 'virtual' ? 'Boş bırakırsanız ürün adı otomatik kullanılır' : 'Örn: Vintage Nikon F2 kamera'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {formData.title.length > 0 && formData.title.trim().length < 10 && (
              <p className="text-xs text-amber-600 mt-1">Başlıkta marka, seri veya model bilgisi kullanın.</p>
            )}
          </div>

          {sourceType === 'physical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ne gördünüz? *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Örn: Vintage Nikon F2 kamera, eski Rolex saat, antika Hereke halısı..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
          )}

          {sourceType === 'virtual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kendi Detayınız <span className="text-gray-400 font-normal">(boş bırakırsanız ürün detayı kullanılır)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Kondisyon, nadirlik sebebi, satıcı yorumu, tavsiye gibi bilgiler... Yazarsanız ürün özetiyle birlikte kullanılır."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          )}

          {/* FİYAT ALANI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Gördüğünüz Fiyat <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <select
                value={selectedCurrency}
                onChange={(e) => setFormData({ ...formData, link_preview_currency: e.target.value })}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              >
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="Örn: 2500"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Etikette veya satıcıdan öğrendiğiniz fiyatı yazın</p>
          </div>

          {/* KONUM SEÇİCİ */}
          {sourceType === 'physical' ? (
            <LocationSelector 
              onLocationSelect={handleLocationSelect}
              initialLocation=""
            />
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Ürün Linki *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.product_url}
                  onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={fetchLinkPreview}
                  className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={previewLoading || !formData.product_url.trim()}
                >
                  {previewLoading ? '...' : 'Önizle'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.marketplace}
                  onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                  placeholder="Pazar yeri"
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  placeholder="Satıcı (opsiyonel)"
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.link_preview_brand}
                  onChange={(e) => setFormData({ ...formData, link_preview_brand: e.target.value })}
                  placeholder="Marka (otomatik gelir)"
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.link_preview_availability}
                  onChange={(e) => setFormData({ ...formData, link_preview_availability: e.target.value })}
                  placeholder="Stok durumu (opsiyonel)"
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <textarea
                value={formData.link_preview_description}
                onChange={(e) => setFormData({ ...formData, link_preview_description: e.target.value })}
                placeholder="Ürün özeti (otomatik gelir, düzenlenebilir)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
              />

              {formData.link_preview_image && (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {formData.marketplace || formData.source_domain || 'Online pazar'}
                    </span>
                    <span className="text-[11px] text-gray-500">Mini Ürün Sayfası</span>
                  </div>
                  <div className="flex">
                    <div className="w-28 h-28 bg-gray-100 shrink-0">
                      <img src={formData.link_preview_image} alt="Link onizleme" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {formData.title || formData.link_preview_title || 'Ürün'}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {formData.link_preview_description || 'Linkten ürün özeti alındı.'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {formData.link_preview_brand && <span>Marka: {formData.link_preview_brand}</span>}
                        {formData.seller_name && <span>Satıcı: {formData.seller_name}</span>}
                        {formData.link_preview_availability && <span>Durum: {formData.link_preview_availability}</span>}
                      </div>
                      {previewPriceNumber != null && (
                        <p className="mt-2 text-sm font-bold text-green-700">
                          {getCurrencyPrefix(formData.link_preview_currency)}
                          {previewPriceNumber.toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">
                    {formData.product_url}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag'ler *
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="Örn: #vintage #nadir #koleksiyon"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Boşlukla ayırın. En az 1 hashtag ekleyin.</p>
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Otomatik etiket önerileri</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSuggestedHashtag(tag)}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">Kategori seçin (opsiyonel)</option>
              <option value="electronics">Elektronik</option>
              <option value="fashion">Giyim & Aksesuar</option>
              <option value="home">Ev & Bahçe</option>
              <option value="collectible">Koleksiyon</option>
              <option value="vehicle">Araç & Parça</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          {/* FOTOĞRAF BÖLÜMÜ */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.hasPhoto}
                onChange={(e) => handlePhotoToggle(e.target.checked)}
                className="w-4 h-4 text-green-600"
                id="hasPhoto"
              />
              <label htmlFor="hasPhoto" className="text-sm font-medium text-gray-700">
                📸 Fotoğrafım var (+10 ekstra puan!)
              </label>
            </div>

            {formData.hasPhoto && (
              <div className="mt-3">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition"
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <p className="font-medium">Fotoğraf yüklemek için tıkla</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Ürünün net fotoğrafını çek, daha hızlı bulunsun
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  capture="environment"
                />

                <p className="text-xs text-gray-500 mt-2">
                  ✓ Fotoğraflı bildirimler 2x daha hızlı bulunuyor<br />
                  ✓ Max 5MB • PNG, JPG, JPEG, WebP
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.addToMuseum}
                onChange={(e) => setFormData({ ...formData, addToMuseum: e.target.checked })}
                className="mt-1 w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-purple-900">
                <span className="font-semibold">🏛️ Nadir müzeme ekle</span>
                <span className="block text-purple-700 mt-1">
                  Bu paylaşım müze vitrininizde de yayınlanır. Sonradan profilinizden kaldırabilirsiniz.
                </span>
              </span>
            </label>
          </div>

          {/* PUAN HESAPLA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">🎯 Toplam Kazanacağınız Puan:</p>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {calculatePoints()} PUAN
                </div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
            <div className="text-sm text-green-700 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Temel bildirim:</span>
                <span className="font-medium">5 puan</span>
              </div>
              {formData.hasPhoto && (
                <div className="flex justify-between">
                  <span>Fotoğraf:</span>
                  <span className="font-medium">+10 puan</span>
                </div>
              )}
              {locationData && (
                <div className="flex justify-between">
                  <span>Detaylı konum:</span>
                  <span className="font-medium">+5 puan</span>
                </div>
              )}
              {formData.category && (
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="font-medium">+3 puan</span>
                </div>
              )}
            </div>
          </div>

          {/* NOKTA İLERLEME */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-blue-900">💠 Nokta İlerlemesi</p>
              <span className="text-sm font-semibold text-blue-700">10 Nokta = 1 Spot</span>
            </div>

            {currentNoktaBalance === null ? (
              <p className="text-sm text-blue-700">Nokta durumu yükleniyor...</p>
            ) : (
              <>
                <div className="text-sm text-blue-800 mb-2">
                  Bu paylaşım sonrası: <span className="font-semibold">{noktaProgressAfter}/10 Nokta</span>
                  {willConvertToSpot && <span className="font-semibold"> +1 Spot</span>}
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressFillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {willConvertToSpot
                    ? 'Tebrikler! Bu paylaşımda 10 Nokta tamamlanacak ve otomatik 1 Spot kazanacaksınız.'
                    : `Bir sonraki Spot için ${10 - noktaProgressAfter} Nokta kaldı.`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={handleSubmit}
            disabled={loading || (sourceType === 'physical' ? !locationData : !formData.product_url.trim()) || (sourceType === 'physical' && !formData.description.trim())}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Gönderiliyor...
              </span>
            ) : sourceType === 'physical' && !locationData ? (
              '📍 Konum Seçin'
            ) : sourceType === 'virtual' && !formData.product_url.trim() ? (
              '🔗 Link Ekleyin'
            ) : (
              `Bildir, +1 Nokta ve ${calculatePoints()} Puan Kazan!`
            )}
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-3">
            Bildiriminiz profil sayfanızda ve ana sayfada görünecek
          </p>
        </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
          }}
        />
      )}
    </>
  )
}