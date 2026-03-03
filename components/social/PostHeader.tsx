// components/social/PostHeader.tsx
'use client'

import { useState, useEffect } from 'react'
import { MoreVertical, MapPin, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface PostHeaderProps {
  user: any
  post: any
  onFollow?: () => void
  onReport?: () => void
}

export default function PostHeader({ user: author, post, onFollow, onReport }: PostHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    // başlangıçta takip durumunu kontrol et
    const checkFollow = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !author?.id) return

        const { data: follow } = await supabase
          .from('social_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', author.id)
          .maybeSingle()

        setIsFollowing(!!follow)
      } catch (e) {
        console.warn('Takip bilgisi alınamadı', e)
      }
    }
    checkFollow()
  }, [author?.id])

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isFollowing) {
        await supabase
          .from('social_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', author.id)
      } else {
        await supabase
          .from('social_follows')
          .insert({ follower_id: user.id, following_id: author.id })
      }
      setIsFollowing(!isFollowing)
      if (onFollow) onFollow()
    } catch (e) {
      console.error('Takip işleminde hata', e)
    }
  }

  const handleReport = () => {
    setShowMenu(false)
    if (onReport) onReport()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return 'Az önce'
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-start justify-between">
        {/* Sol taraf - Kullanıcı bilgileri */}
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author?.name || 'Kullanıcı'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {author?.name?.[0]?.toUpperCase() || 'K'}
                </div>
              )}
            </div>
            
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Kullanıcı bilgileri */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-gray-900">
                {author?.name || 'Kullanıcı'}
              </h4>
              
              {/* Verified badge (mağaza veya premium kullanıcı) */}
              {post?.shop_id && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  🏪 Mağaza
                </span>
              )}
              
              {/* Seviye badge */}
              {author?.reputation?.level && author.reputation.level > 2 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  ⭐ Lv.{author.reputation.level}
                </span>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 space-x-3 mt-1">
              {post?.location && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{post.location}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ taraf - Menü ve takip butonu */}
        <div className="flex items-center space-x-2">
          {/* Takip butonu */}
          <button
            onClick={handleFollow}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </button>

          {/* Daha fazla menüsü */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border w-48 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    // Paylaşımı kaydet
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700"
                >
                  📌 Kaydet
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    // Bağlantıyı kopyala
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700"
                >
                  🔗 Bağlantıyı Kopyala
                </button>
                <button
                  onClick={handleReport}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600 border-t"
                >
                  ⚠️ Bildir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post tipi indicator */}
      {post?.type && (
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            post.type === 'sighting' 
              ? 'bg-green-100 text-green-800' 
              : post.type === 'collection'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {post.type === 'sighting' && '👁️ Görüldü'}
            {post.type === 'collection' && '🏆 Koleksiyon'}
            {post.type === 'question' && '❓ Soru'}
            {post.type === 'showcase' && '✨ Vitrin'}
          </span>
        </div>
      )}
    </div>
  )
}