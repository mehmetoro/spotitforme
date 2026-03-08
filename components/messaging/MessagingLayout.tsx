// components/messaging/MessagingLayout.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

  const fetchThreads = async () => {
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
  }

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

  const handleNewMessage = useCallback(async (receiverId: string, content: string, threadType: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        alert('Oturum doğrulanamadı. Lütfen tekrar giriş yapın.')
        return
      }

      const response = await fetch('/api/messages/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          receiverId,
          content,
          threadType,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result?.error || 'Mesaj gönderilemedi. Lütfen tekrar deneyin.')
        return
      }

      if (result?.threadId) {
        setSelectedThread(result.threadId)
      }

      setShowNewMessageModal(false)
      fetchThreads()

      if (result?.message) {
        alert(result.message)
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.')
    }
  }, [fetchThreads])

  const clearAutoRequestParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    const hadReceiver = params.has('receiver')
    const hadType = params.has('type')
    const hadDraft = params.has('draft')

    if (!hadReceiver && !hadType && !hadDraft) {
      return
    }

    params.delete('receiver')
    params.delete('type')
    params.delete('draft')

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

    setAutoRequestHandled(true)
    clearAutoRequestParams()
    handleNewMessage(initialReceiverId, draft, threadType)
  }, [
    autoRequestHandled,
    clearAutoRequestParams,
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
      alert('Konuşma silinemedi.')
    }
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl shadow-lg overflow-hidden">
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