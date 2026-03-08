// components/messaging/MessagingLayout.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
      // Önce iki kullanıcı arasında bu tipe ait aktif thread var mı kontrol et
      let threadId: string | null = null
      const nowIso = new Date().toISOString()

      const { data: existingThread, error: existingThreadError } = await supabase
        .from('message_threads')
        .select('id, participant1_id, participant2_id, request_status, request_initiator_id')
        .or(`and(participant1_id.eq.${userId},participant2_id.eq.${receiverId}),and(participant1_id.eq.${receiverId},participant2_id.eq.${userId})`)
        .eq('thread_type', threadType)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingThreadError) throw existingThreadError

      if (existingThread?.id) {
        threadId = existingThread.id

        if (existingThread.request_status === 'pending') {
          setSelectedThread(threadId)
          setShowNewMessageModal(false)

          if (existingThread.request_initiator_id === userId) {
            alert('Bu kullanıcıya mesajlaşma talebi zaten gönderildi. Onay bekleniyor.')
          } else {
            alert('Bu kullanıcı size mesajlaşma talebi göndermiş. Önce talebi yanıtlayın.')
          }
          return
        }

        if (existingThread.request_status === 'rejected') {
          const { error: reopenError } = await supabase
            .from('message_threads')
            .update({
              request_status: 'pending',
              request_initiator_id: userId,
              request_message: content,
              request_responded_at: null,
              last_message_at: nowIso,
              last_message_preview: 'Mesajlaşma talebi gönderildi',
              updated_at: nowIso,
            })
            .eq('id', threadId)

          if (reopenError) throw reopenError

          setSelectedThread(threadId)
          setShowNewMessageModal(false)
          fetchThreads()
          alert('Mesajlaşma talebi yeniden gönderildi.')
          return
        }
      } else {
        // Yeni thread oluştur (ilk temas = talep)
        const { data: thread, error: threadError } = await supabase
          .from('message_threads')
          .insert({
            participant1_id: userId,
            participant2_id: receiverId,
            thread_type: threadType,
            status: 'active',
            request_status: 'pending',
            request_initiator_id: userId,
            request_message: content,
            last_message_preview: 'Mesajlaşma talebi gönderildi',
            last_message_at: nowIso,
          })
          .select('id')
          .single()

        if (threadError) throw threadError
        threadId = thread.id

        // Katılımcı kayıtları (opsiyonel ama yararlı)
        await supabase
          .from('thread_participants')
          .insert([
            { thread_id: threadId, user_id: userId },
            { thread_id: threadId, user_id: receiverId }
          ])

        setSelectedThread(threadId)
        setShowNewMessageModal(false)
        fetchThreads()
        alert('Mesajlaşma talebi gönderildi. Karşı taraf onaylayınca sohbet açılacak.')
        return
      }

      // Sadece kabul edilmiş threadlerde mesaj gönder
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: userId,
          receiver_id: receiverId,
          content: content
        })

      if (messageError) throw messageError

      // Thread'i seç ve modal'ı kapat
      setSelectedThread(threadId)
      setShowNewMessageModal(false)
      
      // Thread listesini güncelle
      fetchThreads()

    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.')
    }
  }, [userId])

  useEffect(() => {
    if (autoRequestHandled) return
    if (initialThreadId) return
    if (!initialReceiverId) return

    const draft = initialDraft?.trim() || 'Merhaba, sizinle bu konu hakkında iletişime geçmek istiyorum.'
    const threadType = initialThreadType || 'help'

    setAutoRequestHandled(true)
    handleNewMessage(initialReceiverId, draft, threadType)
  }, [
    autoRequestHandled,
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