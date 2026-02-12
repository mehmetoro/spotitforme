// components/shop/ShopHeader.tsx
'use client'

interface ShopHeaderProps {
  shop: any
  followersCount: number
  isFollowing: boolean
  onFollowToggle: () => void
  onContact: () => void
  onShare: () => void
}

export default function ShopHeader({
  shop,
  followersCount,
  isFollowing,
  onFollowToggle,
  onContact,
  onShare
}: ShopHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        {shop.cover_image ? (
          <img 
            src={shop.cover_image} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-4xl opacity-50">🏪</span>
          </div>
        )}
        
        {/* Verified Badge */}
        {shop.is_verified && (
          <div className="absolute top-4 right-4 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <span className="mr-1">✅</span>
            Doğrulanmış Mağaza
          </div>
        )}
      </div>

      {/* Shop Info */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {shop.shop_name?.[0] || 'M'}
              </div>
            </div>

            {/* Details */}
            <div className="pt-4">
              <h1 className="text-3xl font-bold text-gray-900">{shop.shop_name}</h1>
              <p className="text-gray-600 mt-2">{shop.description || 'Açıklama yok'}</p>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">📍</span>
                  <span>{shop.city || 'Konum belirtilmemiş'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">👥</span>
                  <span>{followersCount} takipçi</span>
                </div>
                {shop.owner && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">👤</span>
                    <span>{shop.owner.name || 'Mağaza sahibi'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onFollowToggle}
              className={`px-6 py-3 rounded-lg font-medium ${
                isFollowing
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? '✓ Takip Ediliyor' : '👥 Takip Et'}
            </button>
            
            <button
              onClick={onContact}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
            >
              📞 İletişim
            </button>
            
            <button
              onClick={onShare}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
              title="Paylaş"
            >
              📤
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}