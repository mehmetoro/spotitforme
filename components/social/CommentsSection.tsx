// components/social/CommentsSection.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Heart, MoreVertical, Smile } from 'lucide-react'

interface CommentsSectionProps {
  postId: string
  initialComments?: any[]
  onClose?: () => void
  autoFocus?: boolean
}

export default function CommentsSection({ 
  postId, 
  initialComments = [], 
  onClose,
  autoFocus = false 
}: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments()
    }
  }, [postId])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from('social_comments')
        .select(`
          *,
          user:user_profiles(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      setComments(data || [])
    } catch (error) {
      console.error('Yorumlar yüklenemedi:', error)
    }
  }

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Yorum yapmak için giriş yapmalısınız')
        return
      }

      const { data: comment, error } = await supabase
        .from('social_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment,
          parent_id: replyingTo || null
        })
        .select(`
          *,
          user:user_profiles(*)
        `)
        .single()

      if (error) throw error

      // Yeni yorumu listeye ekle
      setComments(prev => [...prev, comment])
      setNewComment('')
      setReplyingTo(null)

      // Bildirim gönder (post sahibine)
      const postOwnerId = comments[0]?.post?.user_id || postId
      if (postOwnerId !== user.id) {
        await supabase.from('social_notifications').insert({
          user_id: postOwnerId,
          type: 'comment',
          actor_id: user.id,
          post_id: postId,
          message: 'paylaşımına yorum yaptı'
        })
      }

      // Emoji picker'ı kapat
      setShowEmojiPicker(false)

    } catch (error) {
      console.error('Yorum gönderme hatası:', error)
      alert('Yorum gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Beğeni işlemi (like/unlike)
      const existingLike = comments.find(c => c.id === commentId)?.liked_by_user
      
      if (existingLike) {
        // Beğeniyi kaldır
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
      } else {
        // Beğen
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
      }

      // UI güncelle
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            like_count: existingLike ? comment.like_count - 1 : comment.like_count + 1,
            liked_by_user: !existingLike
          }
        }
        return comment
      }))

    } catch (error) {
      console.error('Yorum beğenme hatası:', error)
    }
  }

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo(commentId)
    setNewComment(`@${username} `)
    inputRef.current?.focus()
  }

  const addEmoji = (emoji: string) => {
    setNewComment(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const emojis = ['😊', '😍', '😂', '😮', '😢', '👍', '❤️', '🔥', '🎉', '👏']

  const renderComment = (comment: any, isChild = false) => {
    const childComments = comments.filter(c => c.parent_id === comment.id)
    
    return (
      <div key={comment.id} className={`${isChild ? 'ml-8' : ''}`}>
        <div className={`flex space-x-3 ${isChild ? 'mt-3' : 'mt-4'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
              {comment.user?.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {comment.user?.name?.[0] || 'K'}
                </div>
              )}
            </div>
          </div>

          {/* İçerik */}
          <div className="flex-1">
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm">{comment.user?.name || 'Kullanıcı'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => console.log('comment menu')}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <MoreVertical className="w-3 h-3 text-gray-500" />
                  </button>
                </div>
              </div>

              <p className="text-gray-800 text-sm whitespace-pre-line">
                {comment.content}
              </p>
            </div>

            {/* Aksiyonlar */}
            <div className="flex items-center space-x-4 mt-2 ml-3">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`text-xs flex items-center space-x-1 ${
                  comment.liked_by_user ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                <Heart className="w-3 h-3" />
                <span>{comment.like_count || 0}</span>
              </button>
              
              <button
                onClick={() => handleReply(comment.id, comment.user?.name)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Yanıtla
              </button>
              
              {!isChild && childComments.length > 0 && (
                <button className="text-xs text-blue-600">
                  {childComments.length} yanıt
                </button>
              )}
            </div>

            {/* Alt yorumlar */}
            {childComments.length > 0 && (
              <div className="mt-3">
                {childComments.map(child => renderComment(child, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100">
      {/* Yorumlar listesi */}
      <div className="max-h-80 overflow-y-auto px-6 py-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">💬</div>
            <p className="text-gray-600">Henüz yorum yok</p>
            <p className="text-sm text-gray-500 mt-1">İlk yorumu sen yap!</p>
          </div>
        ) : (
          <div>
            {comments
              .filter(comment => !comment.parent_id) // Sadece parent yorumlar
              .map(comment => renderComment(comment, false))}
          </div>
        )}
        
        <div ref={commentsEndRef} />
      </div>

      {/* Yanıtlama durumu */}
      {replyingTo && (
        <div className="px-6 py-2 bg-blue-50 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            Yanıtlanıyor: @{comments.find(c => c.id === replyingTo)?.user?.name}
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            × İptal
          </button>
        </div>
      )}

      {/* Yorum input */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex space-x-3">
          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border p-2 grid grid-cols-5 gap-1 z-50">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textarea */}
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorum ekle..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              autoFocus={autoFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitComment()
                }
              }}
            />
          </div>

          {/* Gönder butonu */}
          <button
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
            className="self-end bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Yorum ipuçları */}
        <div className="mt-3 text-xs text-gray-500">
          • Enter ile gönder, Shift+Enter ile yeni satır<br />
          • @kullanıcı ile etiketleyebilirsin<br />
          • Nazik ve yardımsever olalım
        </div>
      </div>

      {/* Kapatma butonu (mobile için) */}
      {onClose && (
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Yorumları Kapat
          </button>
        </div>
      )}
    </div>
  )
}