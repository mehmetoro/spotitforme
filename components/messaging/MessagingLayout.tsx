// components/messaging/MessagingLayout.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import ThreadList from './ThreadList'
import MessageThread from './MessageThread'
import NewMessageModal from './NewMessageModal'
import SecurityDisclaimer from './SecurityDisclaimer'

interface MessagingLayoutProps {
  initialThreadId?: string
  userId: string
  initialReceiverId?: string
  initialThreadType?: string
  initialDraft?: string
}

// Thread türünü tanımla
interface Thread {
  id: string
  participant1_id: string
  participant2_id: string
  request_status?: 'pending' | 'accepted' | 'rejected'
  request_initiator_id?: string | null
  request_message?: string | null
  unread_count_p1: number
  unread_count_p2: number
  last_message_at: string
  thread_type: string
  status: string
  [key: string]: any // Diğer özellikler için
}

export default function MessagingLayout({
  initialThreadId,
  userId,
  initialReceiverId,
  initialThreadType,
  initialDraft,
}: MessagingLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedThread, setSelectedThread] = useState<string | null>(initialThreadId || null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [autoRequestHandled, setAutoRequestHandled] = useState(false)
  const requestInFlightRef = useRef(false)
  const toast = useToast()
  
  // Realtime subscription için
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    fetchThreads()
    setupRealtimeSubscription()
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [userId])

  const fetchThreads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('active_conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      setThreads(data || [])
      
      // Okunmamış mesaj sayısını hesapla - DÜZELTİLDİ
      const totalUnread = (data || []).reduce((sum: number, thread: Thread) => {
        if (thread.participant1_id === userId) {
          return sum + (thread.unread_count_p1 || 0)
        } else {
          return sum + (thread.unread_count_p2 || 0)
        }
      }, 0)
      
      setUnreadCount(totalUnread)
    } catch (error) {
      console.error('Threads yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const focusExistingThread = useCallback(async (receiverId: string, threadType: string): Promise<boolean> => {
    try {
      const threadTypeCandidates =
        threadType === 'reward'
          ? ['reward', 'help', 'spot', 'general', 'social', 'shop']
          : threadType === 'help'
            ? ['help', 'spot', 'general', 'social', 'shop']
            : threadType === 'trade'
              ? ['trade', 'shop', 'general', 'social', 'spot']
              : [threadType, 'general']

      const { data, error } = await supabase
        .from('active_conversations')
        .select('id, request_status, request_initiator_id')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .in('thread_type', threadTypeCandidates)
        .or(
          `and(participant1_id.eq.${userId},participant2_id.eq.${receiverId}),and(participant1_id.eq.${receiverId},participant2_id.eq.${userId})`
        )
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (data?.id) {
        setSelectedThread(data.id)

        if (data.request_status === 'pending' && data.request_initiator_id === userId) {
          toast.info('Bu kullanıcıya gönderdiğiniz talep hâlâ onay bekliyor.', 6000)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Mevcut thread odaklanamadı:', error)
      return false
    }
  }, [toast, userId])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          console.log('Yeni mesaj geldi:', payload)
          fetchThreads() // Thread listesini yenile
          
          // Bildirim göster (native browser notification)
          if (Notification.permission === 'granted') {
            new Notification('Yeni Mesaj', {
              body: payload.new.content?.substring(0, 50) || 'Yeni mesajınız var',
              icon: '/logo.png'
            })
          }
        }
      )
      .subscribe()

    setSubscription(channel)
  }

  const handleNewMessage = useCallback(async (receiverId: string, content: string, threadType: string): Promise<boolean> => {
    if (requestInFlightRef.current) {
      return false
    }

    requestInFlightRef.current = true

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      let accessToken = session?.access_token || null

      if (!accessToken) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        accessToken = refreshed.session?.access_token || null
      }

      if (!accessToken) {
        toast.error('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.')
        return false
      }

      const response = await fetch('/api/messages/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          receiverId,
          content,
          threadType,
        }),
      })

      let result: any = null
      try {
        result = await response.json()
      } catch {
        result = null
      }

      if (!response.ok) {
        toast.error(result?.error || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.')
        return false
      }

      setShowNewMessageModal(false)
      
      // Thread listesini yenile ve bekle
      await fetchThreads()

      // Thread yüklendikten SONRA seç
      if (result?.threadId) {
        setSelectedThread(result.threadId)
      }

      // Başarı mesajını daha uzun süre göster (6 saniye)
      if (result?.message) {
        const successCodes = ['REQUEST_CREATED', 'REQUEST_REOPENED', 'MESSAGE_SENT']
        if (successCodes.includes(result?.code)) {
          toast.success(result.message, 6000)
        } else {
          toast.info(result.message, 6000)
        }
      }

      return true
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.')
      return false
    } finally {
      requestInFlightRef.current = false
    }
  }, [fetchThreads, toast])

  const clearAutoRequestParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    const hadReceiver = params.has('receiver')
    const hadType = params.has('type')
    const hadDraft = params.has('draft')
    const hadFilter = params.has('filter')

    if (typeof window !== 'undefined') {
      localStorage.removeItem('messages.filter')
      localStorage.removeItem('messages.type')
    }

    if (!hadReceiver && !hadType && !hadDraft && !hadFilter) {
      return
    }

    params.delete('receiver')
    params.delete('type')
    params.delete('draft')
    params.delete('filter')

    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (autoRequestHandled) return
    if (initialThreadId) return
    if (!initialReceiverId) return

    const draft = initialDraft?.trim() || 'Merhaba, sizinle bu konu hakkında iletişime geçmek istiyorum.'
    const threadType = initialThreadType || 'help'
    const autoGuardKey = `messages:auto-request:${initialReceiverId}:${threadType}:${draft}`

    const runAutoRequest = async () => {
      setAutoRequestHandled(true)

      if (typeof window !== 'undefined') {
        const alreadyHandledInSession = sessionStorage.getItem(autoGuardKey)
        if (alreadyHandledInSession) {
          clearAutoRequestParams()
          await fetchThreads()
          const found = await focusExistingThread(initialReceiverId, threadType)

          if (found) {
            return
          }

          // Eski/bozuk guard anahtarıysa tekrar denemeye izin ver
          sessionStorage.removeItem(autoGuardKey)
        }
      }

      clearAutoRequestParams()
      const sent = await handleNewMessage(initialReceiverId, draft, threadType)

      if (sent && typeof window !== 'undefined') {
        sessionStorage.setItem(autoGuardKey, '1')
      }
    }

    void runAutoRequest()
  }, [
    autoRequestHandled,
    clearAutoRequestParams,
    fetchThreads,
    focusExistingThread,
    initialDraft,
    initialReceiverId,
    initialThreadId,
    initialThreadType,
    handleNewMessage,
  ])

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('Bu konuşmayı silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('message_threads')
        .update({ status: 'archived' })
        .eq('id', threadId)

      if (error) throw error

      // Eğer silinen thread seçiliyse, seçimi temizle
      if (selectedThread === threadId) {
        setSelectedThread(null)
      }

      // Listeyi güncelle
      fetchThreads()

    } catch (error) {
      console.error('Thread silme hatası:', error)
      toast.error('Konuşma silinemedi.')
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg">
      {/* Sol sidebar - Thread listesi */}
      <div className="w-full md:w-96 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Mesajlar</h2>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                title="Yeni mesaj"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Güvenlik uyarısı (küçük) */}
          <div className="mt-3">
            <SecurityDisclaimer variant="mini" />
          </div>
        </div>

        <ThreadList
          threads={threads}
          selectedThread={selectedThread}
          onSelectThread={setSelectedThread}
          onDeleteThread={handleDeleteThread}
          loading={loading}
          userId={userId}
        />
      </div>

      {/* Sağ taraf - Mesajlaşma ekranı */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <MessageThread
            threadId={selectedThread}
            userId={userId}
            onBack={() => setSelectedThread(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Bir konuşma seçin
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Mevcut konuşmalarınızı soldan seçebilir veya yeni bir mesaj başlatabilirsiniz.
            </p>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="btn-primary"
            >
              Yeni Mesaj Başlat
            </button>
          </div>
        )}
      </div>

      {/* Yeni Mesaj Modal'ı */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSendMessage={handleNewMessage}
        currentUserId={userId}
        initialReceiverId={initialReceiverId}
        initialThreadType={initialThreadType}
        initialDraft={initialDraft}
      />
    </div>
  )
}