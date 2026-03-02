// components/social/FeedPost.tsx - GÜNCELLENMİŞ (veritabanı yapısına uygun)
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import PostActions from './PostActions'
import CommentsSection from './CommentsSection'
import PostHeader from './PostHeader'

interface FeedPostProps {
  post: any
  onLike: (postId: string, liked: boolean) => void
  onSave: (postId: string, saved: boolean) => void
  onComment: () => void
  onShare: () => void
  showFull?: boolean
  initialShowComments?: boolean // yeni: detay sayfası için
  onFound?: (post: any) => void // spot'u bulan buton
}

export default function FeedPost({ 
  post, 
  onLike, 
  onSave, 
  onComment, 
  onShare,
  showFull = false,
  initialShowComments = false,
  onFound
}: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [isSaved, setIsSaved] = useState(post.is_saved || false)
  const [showComments, setShowComments] = useState(initialShowComments || false)
  const [imageIndex, setImageIndex] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [post.user_id])

  useEffect(() => {
    const getCurr = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    getCurr()
  }, [])

  const fetchUser = async () => {
    if (!post.user_id) return
    
    // Eğer post.user zaten varsa onu kullan
    if (post.user) {
      setUser(post.user)
      return
    }
    
    // Yoksa veritabanından getir
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', post.user_id)
      .single()
    
    setUser(data)
  }

  const handleLikeClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    await onLike(post.id, isLiked)
  }

  const handleSaveClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    await onSave(post.id, isSaved)
  }

  // post tipi - yeni schema `post_type`, eskiden `type` kullanılmış olabilir
  let postType: string = post.post_type || post.type || ''
  // eski değerleri normalize edelim
  if (postType === 'sighting') postType = 'rare_sight'
  if (postType === 'collection') postType = 'product'

  // images veya image_urls - hangisi varsa onu kullan
  const images = post.images || post.image_urls || []
  const hasMultipleImages = images.length > 1

  // content veya caption - hangisi varsa onu kullan
  const content = post.content || post.caption || ''

  // hashtags
  const hashtags = post.hashtags || []

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer">
      {/* Header - Kullanıcı bilgileri */}
      <PostHeader 
        user={user || post.user || { full_name: 'Kullanıcı', username: 'kullanici' }}
        post={post}
        onFollow={() => console.log('follow')}
      />

      {/* gönderi türüne göre küçük üst bilgi */}
      {postType === 'spot' && post.reward && (
        <div className="px-6 pt-4">
          <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Ödül: {post.reward}₺
          </div>
        </div>
      )}
      {postType === 'found' && post.is_public === false && (
        <div className="px-6 pt-4">
          <div className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            🔒 Gizli ben gördüm
          </div>
        </div>
      )}
      {postType === 'rare_sight' && (
        <div className="px-6 pt-4">
          <div className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            👁️ Nadir Gördüm
          </div>
        </div>
      )}
      {postType === 'product' && (
        <div className="px-6 pt-4">
          <div className="inline-block bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            🛍️ Ürün paylaşımı
          </div>
        </div>
      )}

      {/* parent spot link */}
      {post.parent_spot_id && (
        <div className="px-6 pt-4">
          <Link href={`/social/${post.parent_spot_id}`} className="text-sm text-blue-600 hover:underline">
            🔗 Bu gönderi bir spota bağlı
          </Link>
        </div>
      )}

      {/* İçerik (Açıklama) */}
      {content && (
        <div className="px-6 pt-4">
          <p className="text-gray-800 whitespace-pre-line">
            {content}
            
            {/* Hashtag'ler */}
            {hashtags.length > 0 && (
              <div className="mt-2">
                {hashtags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/discovery/tags/${tag.replace('#', '')}`}
                    className="inline-block text-blue-600 hover:text-blue-800 mr-2 text-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </p>
          
          {/* Konum */}
          {post.location && (
            <div className="mt-2 flex items-center text-gray-600 text-sm">
              <span className="mr-1">📍</span>
              {post.location}
            </div>
          )}
        </div>
      )}

      {/* Medya - Resimler */}
      {images.length > 0 && (
        <div className="relative mt-4">
          {/* Ana resim */}
          <div className="relative h-[500px] bg-gray-100">
            <img
              src={images[imageIndex]}
              alt={content || 'Post image'}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Resim yüklenemezse placeholder göster
                e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Resim+Yüklenemedi'
              }}
            />

            {/* Çoklu resim navigasyonu */}
            {hasMultipleImages && (
              <>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === imageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>

                {imageIndex > 0 && (
                  <button
                    onClick={() => setImageIndex(prev => prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100"
                  >
                    ←
                  </button>
                )}
                {imageIndex < images.length - 1 && (
                  <button
                    onClick={() => setImageIndex(prev => prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100"
                  >
                    →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Resim sayacı */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {imageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      {/* İstatistikler */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-1">❤️</span>
              <span className="font-medium">{post.like_count || 0}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">💬</span>
              <span className="font-medium">{post.comment_count || 0}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">🔖</span>
              <span className="font-medium">{post.save_count || 0}</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-1">👁️</span>
            <span className="font-medium">{post.view_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <PostActions
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={handleLikeClick}
        onSave={handleSaveClick}
        onComment={() => {
          setShowComments(!showComments)
          onComment()
        }}
        onShare={onShare}
      />

      {/* Spot’u bulan için buton */}
      {postType === 'spot' && onFound && !showFull && post.user_id !== currentUserId && (
        <div className="px-6 py-2">
          <button
            onClick={(e) => { e.stopPropagation(); onFound(post) }}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            🕵️ Bulundu
          </button>
        </div>
      )}

      {/* Yorumlar Bölümü */}
      {showComments && (
        <CommentsSection 
          postId={post.id}
          initialComments={[]}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Zaman bilgisi */}
      <div className="px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {new Date(post.created_at).toLocaleDateString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}