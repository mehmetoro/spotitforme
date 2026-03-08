'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MessagingLayout from '@/components/messaging/MessagingLayout'
import SecurityDisclaimer from '@/components/messaging/SecurityDisclaimer'

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialThreadId = searchParams.get('thread') || undefined
  const initialReceiverId = searchParams.get('receiver') || undefined
  const initialThreadType = searchParams.get('type') || undefined
  const initialDraft = searchParams.get('draft') || undefined

  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.id) {
        router.push('/')
        return
      }

      setUserId(user.id)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Mesajlar hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="space-y-4">
      <SecurityDisclaimer variant="inline" />
      <MessagingLayout
        userId={userId}
        initialThreadId={initialThreadId}
        initialReceiverId={initialReceiverId}
        initialThreadType={initialThreadType}
        initialDraft={initialDraft}
      />
    </div>
  )
}
