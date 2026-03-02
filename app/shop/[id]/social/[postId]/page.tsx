// app/shop/[id]/social/[postId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ShopPostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  const postId = params.postId as string

  const [post, setPost] = useState<any>(null)
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        // get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setCurrentUserId(user.id)

        // get shop info
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single()
        setShop(shopData)

        // get post
        const { data: p, error: postError } = await supabase
          .from('shop_social_posts')
          .select('*')
          .eq('id', postId)
          .maybeSingle()
        if (postError) throw postError
        if (!p) {
          setError('Gönderi bulunamadı')
          return
        }

        // check if liked
        if (user) {
          const { data: likeData } = await supabase
            .from('shop_social_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle()
          setIsLiked(!!likeData)
        }

        // get comments
        const { data: commentsData } = await supabase
          .from('shop_social_comments')
          .select('*, user:user_id(id, name, avatar_url)')
          .eq('post_id', postId)
          .order('created_at', { ascending: false })
        
        setComments(commentsData || [])
        setPost(p)
      } catch (err: any) {
        console.error('Post yükleme hatası', err)
        setError(err.message || 'Hata')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [postId, shopId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleLike = async () => {
    if (!currentUserId) {
      alert('Giriş yapmalısınız')
      return
    }

    try {
      if (isLiked) {
        await supabase
          .from('shop_social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
      } else {
        await supabase
          .from('shop_social_likes')
          .insert({ post_id: postId, user_id: currentUserId })

        // Mağaza sahibine bildirim gönder
        if (shop?.owner_id && shop.owner_id !== currentUserId) {
          try {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: shop.owner_id,
                actorId: currentUserId,
                type: 'post_liked',
                postId: postId,
                postType: 'shop',
                message: 'Sosyal gönderiniz beğenildi'
              })
            })
          } catch (e) {
            console.warn('Notification gönderme başarısız:', e)
          }
        }
      }
      setIsLiked(!isLiked)
      setPost((p: any) => ({
        ...p,
        like_count: isLiked ? (p.like_count || 1) - 1 : (p.like_count || 0) + 1
      }))
    } catch (err: any) {
      console.error('Like hatası', err)
      alert('Beğeni işlemi başarısız oldu')
    }
  }

  const handleAddComment = async () => {
    if (!currentUserId) {
      alert('Giriş yapmalısınız')
      return
    }

    if (!newComment.trim()) {
      alert('Yorum boş olamaz')
      return
    }

    setSubmittingComment(true)
    try {
      const { data: newCommentData, error } = await supabase
        .from('shop_social_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        })
        .select('*, user:user_id(id, name, avatar_url)')
        .single()

      if (error) throw error

      setComments([newCommentData, ...comments])
      setNewComment('')
      setPost((p: any) => ({
        ...p,
        comment_count: (p.comment_count || 0) + 1
      }))

      // Mağaza sahibine bildirim gönder
      if (shop?.owner_id && shop.owner_id !== currentUserId) {
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: shop.owner_id,
              actorId: currentUserId,
              type: 'post_commented',
              postId: postId,
              postType: 'shop',
              message: 'Sosyal gönderinize yorum yapıldı'
            })
          })
        } catch (e) {
          console.warn('Notification gönderme başarısız:', e)
        }
      }
    } catch (err: any) {
      console.error('Yorum hatası', err)
      alert('Yorum gönderilemedi')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }
  if (error) {
    return (
      <div className="text-center py-12">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← Geri
        </button>
      </div>
      {post && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">
              {(() => {
                switch (post.type) {
                  case 'product_showcase': return '📦'
                  case 'new_arrival': return '🆕'
                  case 'sale': return '🏷️'
                  case 'behind_scenes': return '🎬'
                  case 'customer_review': return '⭐'
                  case 'looking_for': return '🔍'
                  default: return '📢'
                }
              })()}
            </span>
            <h1 className="text-xl font-bold">{post.title}</h1>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {post.publish_at ? formatDate(post.publish_at) : formatDate(post.created_at)}
          </p>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-1 gap-3 mb-4">
              {post.images.map((img: string, idx: number) => (
                <img key={idx} src={img} alt={`image-${idx}`} className="w-full rounded-lg" />
              ))}
            </div>
          )}
          {post.content && (
            <div className="prose max-w-none whitespace-pre-line mb-4">
              {post.content}
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="border-t border-b py-3 my-4 flex items-center space-x-6 text-sm">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{post.like_count || 0}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>💬</span>
              <span>{post.comment_count || 0} yorum</span>
            </div>
          </div>

          {/* Yorum Bölümü */}
          <div className="mt-6">
            <h3 className="font-bold mb-4">Yorumlar</h3>

            {/* Yorum Ekle */}
            <div className="mb-6 pb-6 border-b">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bir yorum yaz..."
                className="w-full border border-gray-300 rounded-lg p-3 mb-2"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {submittingComment ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>

            {/* Yorumlar Listesi */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Henüz yorum yok</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{comment.user?.name || 'Anonim'}</p>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
