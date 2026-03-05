import Link from 'next/link'

interface SpotCardProps {
  spot: {
    id: string
    title: string
    description: string
    category: string | null
    location: string | null
    image_url: string | null
    status: string
    created_at: string
    views: number
    total_helps: number
    user?: {
      full_name: string | null
    }
  }
}

export default function SpotCard({ spot }: SpotCardProps) {
  // ZAMAN FORMATI
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'şimdi'
      if (diffMins < 60) return `${diffMins} dakika önce`
      if (diffHours < 24) return `${diffHours} saat önce`
      if (diffDays < 7) return `${diffDays} gün önce`
      return date.toLocaleDateString('tr-TR')
    } catch {
      return 'tarih belirsiz'
    }
  }

  // RESİM URL'SİNİ HAZIRLA
  const getImageUrl = (): string | null => {
    if (!spot.image_url) return null
    
    let url = spot.image_url
    
    // 1. NULL veya boş mu?
    if (!url || url.trim() === '') return null
    
    // 2. String mi?
    if (typeof url !== 'string') {
      console.error('image_url string değil:', typeof url, url)
      return null
    }
    
    // 3. Trim yap
    url = url.trim()
    
    // 4. Tırnak işaretlerini temizle
    url = url.replace(/["']/g, '')
    
    // 5. Başına https:// ekle (gerekirse)
    if (url.startsWith('//')) {
      url = 'https:' + url
    }
    
    // 6. http:// ile başlıyorsa https:// yap
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://')
    }
    
    // 7. Supabase URL kontrolü
    if (url.includes('supabase.co')) {
      // /object/public/ kontrolü
      if (url.includes('/storage/v1/object/') && !url.includes('/public/')) {
        url = url.replace('/object/', '/object/public/')
      }
    }
    
    // 8. Geçerli URL mi?
    try {
      new URL(url)
      return url
    } catch {
      console.error('Geçersiz URL:', url)
      return null
    }
  }

  const imageUrl = getImageUrl()
  const hasImage = !!imageUrl

  // KATEGORİ RENGİ
  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    
    const colors: Record<string, string> = {
      'Elektronik': 'bg-blue-100 text-blue-800',
      'Fotoğraf Makineleri': 'bg-blue-100 text-blue-800',
      'Giyim & Aksesuar': 'bg-green-100 text-green-800',
      'Ev & Bahçe': 'bg-yellow-100 text-yellow-800',
      'Ev Eşyaları': 'bg-yellow-100 text-yellow-800',
      'Koleksiyon': 'bg-purple-100 text-purple-800',
      'Kitap & Müzik': 'bg-red-100 text-red-800',
      'Oyunlar': 'bg-indigo-100 text-indigo-800',
      'Spor & Outdoor': 'bg-pink-100 text-pink-800',
      'Araç & Parça': 'bg-gray-100 text-gray-800',
      'Diğer': 'bg-gray-100 text-gray-800'
    }
    
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100">
      {/* RESİM BÖLÜMÜ - KESİN ÇALIŞACAK */}
      <div className="h-48 bg-gray-100 relative">
        {hasImage ? (
          <>
            {/* RESİM */}
            <img
              src={imageUrl}
              alt={spot.title}
              className="w-full h-full object-cover"
              onLoad={() => console.log(`✅ Resim yüklendi: ${spot.id}`)}
              onError={(e) => {
                console.error(`❌ Resim yüklenemedi: ${imageUrl}`)
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                
                // FALLBACK göster
                const fallback = document.createElement('div')
                fallback.className = 'absolute inset-0 flex items-center justify-center bg-gray-200'
                fallback.innerHTML = `
                  <div class="text-center">
                    <span class="text-3xl block mb-2">📷</span>
                    <p class="text-sm text-gray-600">Resim yüklenemedi</p>
                  </div>
                `
                img.parentNode?.appendChild(fallback)
              }}
            />
            
            {/* Yedek görünüm (resim yüklenene kadar) */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: 'none' }}>
              <div className="text-center">
                <span className="text-3xl block mb-2">📷</span>
                <p className="text-sm text-gray-600">Resim yükleniyor...</p>
              </div>
            </div>
          </>
        ) : (
          // RESİM YOKSA
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <span className="text-4xl block mb-3 text-gray-400">📷</span>
              <p className="text-sm text-gray-500">Resim Yok</p>
            </div>
          </div>
        )}
        
        {/* DURUM BADGE */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            spot.status === 'active' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
          </span>
        </div>
      </div>

      {/* İÇERİK BÖLÜMÜ */}
      <div className="p-5">
        {/* KULLANICI */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {spot.user?.full_name?.[0]?.toUpperCase() || 'K'}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">
              {spot.user?.full_name || 'Kullanıcı'}
            </p>
            <p className="text-xs text-gray-500">
              {getTimeAgo(spot.created_at)}
            </p>
          </div>
        </div>

        {/* BAŞLIK */}
        <Link href={`/spots/${spot.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-blue-600 line-clamp-1">
            {spot.title}
          </h3>
        </Link>
        
        {/* AÇIKLAMA */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {spot.description}
        </p>

        {/* KATEGORİ & KONUM */}
        <div className="flex flex-wrap gap-2 mb-4">
          {spot.category && (
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${getCategoryColor(spot.category)}`}>
              {spot.category}
            </span>
          )}
          
          {spot.location && (
            <span className="text-sm text-gray-500 flex items-center">
              <span className="mr-1">📍</span>
              {spot.location}
            </span>
          )}
        </div>

        {/* İSTATİSTİKLER */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              👁️ {spot.views || 0}
            </span>
            <span className="flex items-center">
              🤝 {spot.total_helps || 0}
            </span>
          </div>
          
          <Link 
            href={`/spots/${spot.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Detay →
          </Link>
        </div>

        {/* DEBUG: RESİM BİLGİSİ */}
        {hasImage && process.env.NODE_ENV === 'development' && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
            <p className="text-xs text-gray-400 truncate" title={imageUrl}>
              🔗 {imageUrl.substring(0, 40)}...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}