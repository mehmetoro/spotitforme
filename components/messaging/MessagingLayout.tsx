// components/messaging/MessagingLayout.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'
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
  const locale = useCurrentLocale()
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

  const t = {
    pendingRequestInfo: {
      tr: 'Bu kullanıcıya gönderdiğiniz talep hala onay bekliyor.',
      en: 'Your request to this user is still pending approval.',
      de: 'Ihre Anfrage an diesen Nutzer wartet noch auf Genehmigung.',
      fr: 'Votre demande a cet utilisateur est toujours en attente.',
      es: 'Tu solicitud para este usuario sigue pendiente de aprobacion.',
      ru: 'Vash zapros etomu polzovatelyu vse eshche ozhidaet podtverzhdeniya.',
    },
    authFailed: {
      tr: 'Oturum dogrulanamadi. Lutfen tekrar giris yapin.',
      en: 'Session validation failed. Please sign in again.',
      de: 'Sitzung konnte nicht verifiziert werden. Bitte erneut anmelden.',
      fr: 'La session n a pas pu etre validee. Veuillez vous reconnecter.',
      es: 'No se pudo validar la sesion. Inicia sesion de nuevo.',
      ru: 'Ne udalos proverit sessiyu. Voydite snova.',
    },
    sendFailed: {
      tr: 'Mesaj gonderilemedi. Lutfen tekrar deneyin.',
      en: 'Message could not be sent. Please try again.',
      de: 'Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.',
      fr: 'Le message n a pas pu etre envoye. Veuillez reessayer.',
      es: 'No se pudo enviar el mensaje. Intentalo de nuevo.',
      ru: 'Ne udalos otpravit soobshchenie. Poprobuyte eshche raz.',
    },
    autoDraft: {
      tr: 'Merhaba, sizinle bu konu hakkinda iletisime gecmek istiyorum.',
      en: 'Hello, I would like to contact you about this topic.',
      de: 'Hallo, ich mochte Sie zu diesem Thema kontaktieren.',
      fr: 'Bonjour, je souhaite vous contacter a ce sujet.',
      es: 'Hola, me gustaria contactarte sobre este tema.',
      ru: 'Privet, ya khochu svyazatsya s vami po etomu voprosu.',
    },
    confirmDelete: {
      tr: 'Bu konusmayi silmek istediginize emin misiniz?',
      en: 'Are you sure you want to delete this conversation?',
      de: 'Mochten Sie diese Unterhaltung wirklich loschen?',
      fr: 'Voulez-vous vraiment supprimer cette conversation ?',
      es: 'Seguro que quieres eliminar esta conversacion?',
      ru: 'Vy uvereny, chto khotite udalit etot chat?',
    },
    deleteFailed: {
      tr: 'Konusma silinemedi.',
      en: 'Conversation could not be deleted.',
      de: 'Unterhaltung konnte nicht geloscht werden.',
      fr: 'La conversation n a pas pu etre supprimee.',
      es: 'No se pudo eliminar la conversacion.',
      ru: 'Ne udalos udalit chat.',
    },
    messagesTitle: { tr: 'Mesajlar', en: 'Messages', de: 'Nachrichten', fr: 'Messages', es: 'Mensajes', ru: 'Soobshcheniya' },
    newMessage: { tr: 'Yeni mesaj', en: 'New message', de: 'Neue Nachricht', fr: 'Nouveau message', es: 'Nuevo mensaje', ru: 'Novoe soobshchenie' },
    noAccessTitle: {
      tr: 'Bu konusmaya erisiminiz yok veya konusma bulunamadi.',
      en: 'You do not have access to this conversation or it was not found.',
      de: 'Sie haben keinen Zugriff auf diese Unterhaltung oder sie wurde nicht gefunden.',
      fr: 'Vous n avez pas acces a cette conversation ou elle est introuvable.',
      es: 'No tienes acceso a esta conversacion o no se encontro.',
      ru: 'U vas net dostupa k etomu chatu ili on ne nayden.',
    },
    noAccessBody: {
      tr: 'Erisim izniniz olmayan veya silinmis bir konusmayi acmaya calisiyor olabilirsiniz.',
      en: 'You may be trying to open a deleted conversation or one you cannot access.',
      de: 'Sie versuchen moglicherweise, eine geloschte oder nicht zugangliche Unterhaltung zu offnen.',
      fr: 'Vous essayez peut-etre d ouvrir une conversation supprimee ou non autorisee.',
      es: 'Puede que estes intentando abrir una conversacion eliminada o sin permiso.',
      ru: 'Vozmozhno, vy pytaetes otkryt udalennyy chat ili chat bez prav dostupa.',
    },
    backToList: { tr: 'Konusma Listesine Don', en: 'Back to Conversation List', de: 'Zuruck zur Liste', fr: 'Retour a la liste', es: 'Volver a la lista', ru: 'Nazad k spisku' },
    pickConversation: { tr: 'Bir konusma secin', en: 'Select a conversation', de: 'Wahlen Sie eine Unterhaltung', fr: 'Selectionnez une conversation', es: 'Selecciona una conversacion', ru: 'Vyberite chat' },
    pickConversationBody: {
      tr: 'Mevcut konusmalarinizi soldan secebilir veya yeni bir mesaj baslatabilirsiniz.',
      en: 'Pick an existing conversation from the left or start a new message.',
      de: 'Wahlen Sie links eine Unterhaltung oder starten Sie eine neue Nachricht.',
      fr: 'Choisissez une conversation a gauche ou demarrez un nouveau message.',
      es: 'Elige una conversacion a la izquierda o inicia un nuevo mensaje.',
      ru: 'Vyberite sushchestvuyushchiy chat sleva ili nachnite novoe soobshchenie.',
    },
    startNewMessage: { tr: 'Yeni Mesaj Baslat', en: 'Start New Message', de: 'Neue Nachricht starten', fr: 'Demarrer un nouveau message', es: 'Iniciar nuevo mensaje', ru: 'Nachat novoe soobshchenie' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr

  useEffect(() => {
    fetchThreads()
    setupRealtimeSubscription()
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [userId])

  // Mobil geri tuşu kontrolü - mesajlaşma ekranındayken geri tuşu listeye döner
  useEffect(() => {
    const handlePopState = () => {
      if (selectedThread) {
        setSelectedThread(null)
      }
    }

    // selectedThread açıldığında history state ekle
    if (selectedThread) {
      window.history.pushState({ threadOpen: true }, '')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [selectedThread])

  const fetchThreads = useCallback(async () => {
    try {
      // Hem kullanıcılar arası hem de adminle olan thread'leri çek
      const { data, error } = await supabase
        .from('active_conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      setThreads(data || [])
      
      // Okunmamış mesaj sayısını hesapla
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
        // URL'ye thread parametresi ekle
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          params.set('thread', data.id)
          // receiver/type/draft parametrelerini temizle
          params.delete('receiver')
          params.delete('type')
          params.delete('draft')
          params.delete('filter')
          const nextUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname
          window.history.replaceState({}, '', nextUrl)
        }
        if (data.request_status === 'pending' && data.request_initiator_id === userId) {
          toast.info(trText('pendingRequestInfo'), 6000)
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
            new Notification(trText('messagesTitle'), {
              body: payload.new.content?.substring(0, 50) || trText('newMessage'),
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
        toast.error(trText('authFailed'))
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
        toast.error(result?.error || trText('sendFailed'))
        return false
      }

      setShowNewMessageModal(false)
      
      // Thread listesini yenile ve bekle
      await fetchThreads()

      // Thread yüklendikten SONRA seç
      if (result?.threadId) {
        setSelectedThread(result.threadId)
        // URL'ye thread parametresi ekle
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          params.set('thread', result.threadId)
          // receiver/type/draft parametrelerini temizle
          params.delete('receiver')
          params.delete('type')
          params.delete('draft')
          params.delete('filter')
          const nextUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname
          window.history.replaceState({}, '', nextUrl)
        }
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
      toast.error(trText('sendFailed'))
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

    const draft = initialDraft?.trim() || trText('autoDraft')
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
    if (!confirm(trText('confirmDelete'))) return

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
      toast.error(trText('deleteFailed'))
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-120px)] bg-white rounded-xl shadow-lg">
      {/* Sol sidebar - Thread listesi - Mobilde sadece mesaj seçili değilken görünür */}
      <div className={`w-full md:w-96 border-r border-gray-200 flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{trText('messagesTitle')}</h2>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                title={trText('newMessage')}
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

      {/* Sağ taraf - Mesajlaşma ekranı - Mobilde sadece mesaj seçiliyken görünür */}
      <div className={`flex-1 flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
        {selectedThread ? (
          threads.find(t => t.id === selectedThread) ? (
            <MessageThread
              threadId={selectedThread}
              userId={userId}
              onBack={() => setSelectedThread(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-medium text-red-700 mb-2">{trText('noAccessTitle')}</h3>
              <p className="text-gray-600">{trText('noAccessBody')}</p>
              <button
                onClick={() => setSelectedThread(null)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {trText('backToList')}
              </button>
            </div>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {trText('pickConversation')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {trText('pickConversationBody')}
            </p>
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="btn-primary"
            >
              {trText('startNewMessage')}
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