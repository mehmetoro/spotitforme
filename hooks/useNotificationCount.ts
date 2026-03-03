// hooks/useNotificationCount.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true

    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        const { count } = await supabase
          .from('social_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)

        if (mounted) {
          setUnreadCount(count || 0)
        }

        // Subscribe to new notifications - Realtime updates
        const subscription = supabase
          .channel(`notifications_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'social_notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (mounted && payload.new && payload.new.read === false) {
                setUnreadCount((prev) => prev + 1)
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'social_notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              if (mounted && payload.old?.read === false && payload.new?.read === true) {
                setUnreadCount((prev) => Math.max(0, prev - 1))
              }
            }
          )
          .subscribe()

        return () => {
          subscription.unsubscribe()
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return
        }
        console.warn('Notification setup error:', err)
      }
    }

    setupSubscription()

    return () => {
      mounted = false
    }
  }, [])

  return unreadCount
}
