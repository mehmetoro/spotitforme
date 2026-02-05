// components/social/FeedPost.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import PostActions from './PostActions'
import CommentsSection from './CommentsSection' // ✅ DÜZELTİLDİ
import PostHeader from './PostHeader' // ✅ DÜZELTİLDİ

interface FeedPostProps {
  post: any
  onLike: (postId: string, liked: boolean) => void
  onSave: (postId: string, saved: boolean) => void
  onComment: () => void
  onShare: () => void
  showFull?: boolean
}

export default function FeedPost({ 
  post, 
  onLike, 
  onSave, 
  onComment, 
  onShare,
  showFull = false 
}: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUserInteractions()
    fetchUser()
  }, [post.id])

  const checkUserInteractions = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Beğeni kontrolü
      const { data: like } = await supabase
        .from('social_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', authUser.id)
        .single()

      // Kaydetme kontrolü
      const { data: save } = await supabase
        .from('social_saves')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', authUser.id)
        .single()

      setIsLiked(!!like)
      setIsSaved(!!save)
    } catch (error) {
      // Hata durumunda silent fail
    }
  }

  const fetchUser = async () => {
    if (!post.user_id) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', post.user_id)
      .single()
    setUser(data)
  }

  // TİP DÜZELTMESİ - async/await eklendi
  const handleLikeClick = async () => {
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    await onLike(post.id, isLiked)
  }

  // TİP DÜZELTMESİ - async/await eklendi
  const handleSaveClick = async () => {
    const newSavedState = !isSaved
    setIsSaved(newSavedState)
    await onSave(post.id, isSaved)
  }

  const hasMultipleImages = post.image_urls && post.image_urls.length > 1

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header - Kullanıcı bilgileri */}
      <PostHeader 
        user={user || post.user}
        post={post}
        onFollow={() => console.log('follow')}
      />

      {/* Caption */}
      {post.caption && (
        <div className="px-6 pt-4">
          <p className="text-gray-800 whitespace-pre-line">
            {post.caption}
            
            {/* Hashtag'ler */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-2">
                {post.hashtags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/discover/tags/${tag.replace('#', '')}`}
                    className="inline-block text-blue-600 hover:text-blue-800 mr-2 text-sm"
                  >
                    {tag}
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

      {/* Medya - Image/Video */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="relative mt-4">
          {/* Ana resim */}
          <div className="relative h-[500px] bg-gray-100">
            <img
              src={post.image_urls[imageIndex]}
              alt={post.caption || 'Post image'}
              className="w-full h-full object-contain"
            />

            {/* Çoklu resim navigasyonu */}
            {hasMultipleImages && (
              <>
                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {post.image_urls.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === imageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                {imageIndex > 0 && (
                  <button
                    onClick={() => setImageIndex(prev => prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100"
                  >
                    ←
                  </button>
                )}
                {imageIndex < post.image_urls.length - 1 && (
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

          {/* Image counter */}
          {hasMultipleImages && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
              {imageIndex + 1} / {post.image_urls.length}
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
              <span className="mr-1">📤</span>
              <span className="font-medium">{post.share_count || 0}</span>
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
        onLike={handleLikeClick} // async fonksiyon
        onSave={handleSaveClick} // async fonksiyon
        onComment={() => {
          setShowComments(!showComments)
          onComment()
        }}
        onShare={onShare}
      />

      {/* Yorumlar Bölümü */}
      {showComments && (
        <CommentsSection 
          postId={post.id}
          initialComments={post.comments || []}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Zamansal bilgi */}
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