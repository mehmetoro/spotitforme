'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import FeedPost from '@/components/social/FeedPost'

interface PostPageProps {
  params: { id: string }
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = params
  const router = useRouter()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        // get base post
        const { data: p, error: postError } = await supabase
          .from('social_posts')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (postError) throw postError
        if (!p) {
          setError('Gönderi bulunamadı')
          return
        }

        // gather additional fields (counts, user, saved/liked)
        let like_count = 0
        let comment_count = 0
        let save_count = 0
        let isLiked = false
        let isSaved = false

        const [{ count: lc }, { count: cc }] = await Promise.all([
          supabase
            .from('social_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id),
          supabase
            .from('social_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)
        ])
        like_count = lc || 0
        comment_count = cc || 0

        try {
          const { count: sc } = await supabase
            .from('social_saves')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', id)
          save_count = sc || 0
        } catch {
          save_count = 0
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const [{ data: ld }, { data: sd }] = await Promise.all([
            supabase
              .from('social_likes')
              .select('id')
              .eq('post_id', id)
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase
              .from('social_saves')
              .select('id')
              .eq('post_id', id)
              .eq('user_id', user.id)
              .maybeSingle()
          ])
          isLiked = !!ld
          isSaved = !!sd
        }

        // fetch user profile if not included
        if (!p.user) {
          const { data: u } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', p.user_id)
            .maybeSingle()
          p.user = u
        }

        setPost({
          ...p,
          like_count,
          comment_count,
          save_count,
          is_liked: isLiked,
          is_saved: isSaved
        })
      } catch (err: any) {
        console.error('Post yükleme hatası', err)
        setError(err.message || 'Hata')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleLike = async (postId: string, liked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (liked) {
        await supabase.from('social_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      } else {
        await supabase.from('social_likes').insert({ post_id: postId, user_id: user.id })
      }
      setPost((p: any) => ({
        ...p,
        like_count: liked ? p.like_count - 1 : p.like_count + 1,
        is_liked: !liked
      }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = async (postId: string, saved: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (saved) {
        await supabase.from('social_saves').delete().eq('post_id', postId).eq('user_id', user.id)
      } else {
        await supabase.from('social_saves').insert({ post_id: postId, user_id: user.id })
      }
      setPost((p: any) => ({
        ...p,
        save_count: saved ? p.save_count - 1 : p.save_count + 1,
        is_saved: !saved
      }))
    } catch (e) {
      console.error(e)
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
        <FeedPost
          post={post}
          onLike={handleLike}
          onSave={handleSave}
          onComment={() => {}}
          onShare={() => {}}
          showFull={true}
          initialShowComments={true}
        />
      )}
    </div>
  )
}
