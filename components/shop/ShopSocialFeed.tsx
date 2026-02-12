// components/shop/ShopSocialFeed.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ShopSocialFeedProps {
  shopId: string
  limit?: number
  compact?: boolean
}

export default function ShopSocialFeed({ 
  shopId, 
  limit = 9,
  compact = false 
}: ShopSocialFeedProps) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSocialPosts()
  }, [shopId])

  const fetchSocialPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_social_posts')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', 'published')
        .order('publish_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Sosyal paylaşımlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPostIcon = (type: string) => {
    switch(type) {
      case 'product_showcase': return '📦'
      case 'new_arrival': return '🆕'
      case 'sale': return '🏷️'
      case 'behind_scenes': return '🎬'
      case 'customer_review': return '⭐'
      case 'looking_for': return '🔍'
      default: return '📢'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Bugün'
    if (diffDays === 1) return 'Dün'
    if (diffDays < 7) return `${diffDays} gün önce`
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">📱 Son Paylaşımlar</h3>
          <Link
            href={`/shop/${shopId}/social`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Tümü →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Henüz paylaşım yapılmamış</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {posts.slice(0, 6).map((post) => (
              <Link
                key={post.id}
                href={`/shop/${shopId}/social/${post.id}`}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                {post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={post.title || 'Post image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {getPostIcon(post.type)}
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                  <span className="text-white text-xs truncate">
                    {post.title || 'Paylaşım'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">📱 Sosyal Paylaşımlar</h3>
            <p className="text-sm text-gray-600">Mağazanın son aktiviteleri</p>
          </div>
          <Link
            href={`/shop/${shopId}/social/new`}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            + Paylaşım Yap
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h4 className="font-bold text-gray-900 mb-2">Henüz paylaşım yok</h4>
          <p className="text-gray-600 mb-6">Mağazanızın hikayesini paylaşın, takipçilerinizle bağlantı kurun</p>
          <Link
            href={`/shop/${shopId}/social/new`}
            className="btn-primary inline-block"
          >
            İlk Paylaşımı Yapın
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                {/* Post icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl">
                  {getPostIcon(post.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{post.title}</h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{formatDate(post.publish_at || post.created_at)}</span>
                        {post.like_count > 0 && (
                          <span className="flex items-center">
                            ❤️ {post.like_count}
                          </span>
                        )}
                        {post.comment_count > 0 && (
                          <span className="flex items-center">
                            💬 {post.comment_count}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/shop/${shopId}/social/${post.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Görüntüle →
                    </Link>
                  </div>

                  {post.content && (
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                  )}

                  {/* Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {post.images.slice(0, 3).map((image: string, index: number) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {post.images.length > 3 && (
                        <div className="aspect-square rounded-lg bg-gray-800 text-white flex items-center justify-center text-lg font-bold">
                          +{post.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <div className="p-6 border-t text-center">
          <Link
            href={`/shop/${shopId}/social`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Tüm Paylaşımları Gör →
          </Link>
        </div>
      )}
    </div>
  )
}