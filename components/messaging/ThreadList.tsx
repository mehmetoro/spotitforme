// components/messaging/ThreadList.tsx - DÜZELTİLMİŞ
'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ADMIN_USER_ID } from '@/lib/admin';
import { useCurrentLocale, type SupportedLocale } from '@/hooks/useCurrentLocale'
import { translateTextInBrowser } from '@/lib/browser-translation'
import { MessageSquare, User, Clock, Trash2, CheckCircle, Search } from 'lucide-react'

interface Thread {
  id: string
  participant1_id: string
  participant2_id: string
  participant1_language?: SupportedLocale | null
  participant2_language?: SupportedLocale | null
  request_status?: 'pending' | 'accepted' | 'rejected'
  request_initiator_id?: string | null
  request_message?: string | null
  last_message_at: string
  last_message_preview?: string
  unread_count_p1: number
  unread_count_p2: number
  status: string
  participant1_name?: string
  participant2_name?: string
  // MessagingLayout'dan gelen ek alanlar
  thread_type?: string
  subject?: string
  spot_id?: string
  product_id?: string
  shop_id?: string
  created_at?: string
  updated_at?: string
  // active_conversations view'ından gelebilecek alanlar
  last_message_content?: string
  other_user_name?: string
  other_user_avatar?: string
  [key: string]: any // Diğer olası alanlar için
}

interface ThreadListProps {
  threads: Thread[]
  selectedThread: string | null
  onSelectThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => void
  loading: boolean
  userId: string
}

type RequestFilter = 'all' | 'incoming' | 'outgoing'
type ThreadTypeFilter = 'all' | 'general' | 'social' | 'shop' | 'spot' | 'help' | 'reward' | 'trade'
type QuickFilter = 'all' | 'unread' | 'pending' | 'active'
type SortOption = 'newest' | 'unread'

const FILTER_STORAGE_KEY = 'messages.filter'
const TYPE_STORAGE_KEY = 'messages.type'

export default function ThreadList({
  threads,
  selectedThread,
  onSelectThread,
  onDeleteThread,
  loading,
  userId
}: ThreadListProps) {
  const locale = useCurrentLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [translatedPreviews, setTranslatedPreviews] = useState<Record<string, string>>({})

  const t = {
    newItem: { tr: 'Yeni', en: 'New', de: 'Neu', fr: 'Nouveau', es: 'Nuevo', ru: 'Novoe' },
    minAgo: { tr: 'dk once', en: 'min ago', de: 'Min. her', fr: 'min', es: 'min', ru: 'min nazad' },
    hourAgo: { tr: 'saat once', en: 'h ago', de: 'Std. her', fr: 'h', es: 'h', ru: 'ch nazad' },
    loading: { tr: 'Yukleniyor...', en: 'Loading...', de: 'Wird geladen...', fr: 'Chargement...', es: 'Cargando...', ru: 'Zagruzka...' },
    noMessageYet: { tr: 'Henuz mesajiniz yok', en: 'No messages yet', de: 'Noch keine Nachrichten', fr: 'Pas encore de messages', es: 'Aun no hay mensajes', ru: 'Soobshcheniy poka net' },
    startFirstMessage: { tr: 'Ilk mesajinizi gondererek baslayin', en: 'Start by sending your first message', de: 'Senden Sie zuerst Ihre erste Nachricht', fr: 'Commencez par envoyer votre premier message', es: 'Comienza enviando tu primer mensaje', ru: 'Nachnite s otpravki pervogo soobshcheniya' },
    searchParticipant: { tr: 'Katilimci ara...', en: 'Search participant...', de: 'Teilnehmer suchen...', fr: 'Rechercher un participant...', es: 'Buscar participante...', ru: 'Poisk uchastnika...' },
    all: { tr: 'Tumu', en: 'All', de: 'Alle', fr: 'Tous', es: 'Todos', ru: 'Vse' },
    unread: { tr: 'Okunmamislar', en: 'Unread', de: 'Ungelesen', fr: 'Non lus', es: 'No leidos', ru: 'Neprochitannye' },
    pendingRequests: { tr: 'Bekleyen Talepler', en: 'Pending Requests', de: 'Ausstehende Anfragen', fr: 'Demandes en attente', es: 'Solicitudes pendientes', ru: 'Ozhidayushchie zaprosy' },
    activeChats: { tr: 'Aktif Konusmalar', en: 'Active Chats', de: 'Aktive Chats', fr: 'Conversations actives', es: 'Chats activos', ru: 'Aktivnye chaty' },
    newest: { tr: 'En Yeni', en: 'Newest', de: 'Neueste', fr: 'Plus recents', es: 'Mas recientes', ru: 'Snachala novye' },
    unreadFirst: { tr: 'Okunmamislar Once', en: 'Unread First', de: 'Ungelesene zuerst', fr: 'Non lus d abord', es: 'No leidos primero', ru: 'Neprochitannye snachala' },
    outgoingRequests: { tr: 'Gonderdigim Talepler', en: 'Outgoing Requests', de: 'Gesendete Anfragen', fr: 'Demandes envoyees', es: 'Solicitudes enviadas', ru: 'Moi zaprosy' },
    waitingApproval: { tr: 'Onay bekleyen', en: 'Waiting approval', de: 'Wartet auf Genehmigung', fr: 'En attente', es: 'En espera', ru: 'Ozhidaet podtverzhdeniya' },
    incomingRequests: { tr: 'Bana Gelen Talepler', en: 'Incoming Requests', de: 'Eingehende Anfragen', fr: 'Demandes recues', es: 'Solicitudes recibidas', ru: 'Vkhodyashchie zaprosy' },
    waitingResponse: { tr: 'Yanit bekleyen', en: 'Waiting response', de: 'Wartet auf Antwort', fr: 'En attente de reponse', es: 'Esperando respuesta', ru: 'Ozhidaet otveta' },
    allTypes: { tr: 'Tum Turler', en: 'All Types', de: 'Alle Typen', fr: 'Tous les types', es: 'Todos los tipos', ru: 'Vse tipy' },
    clearAll: { tr: 'Tumunu Temizle', en: 'Clear All', de: 'Alles loschen', fr: 'Tout effacer', es: 'Limpiar todo', ru: 'Ochistit vse' },
    noConversationForFilter: { tr: 'Bu filtreye uygun konusma bulunamadi.', en: 'No conversations match this filter.', de: 'Keine Unterhaltung fur diesen Filter gefunden.', fr: 'Aucune conversation pour ce filtre.', es: 'No hay conversaciones para este filtro.', ru: 'Net chatov dlya etogo filtra.' },
    pendingApprovalTag: { tr: 'Onay Bekleniyor', en: 'Pending Approval', de: 'Wartet auf Genehmigung', fr: 'En attente', es: 'Pendiente', ru: 'Ozhidaet podtverzhdeniya' },
    newRequestTag: { tr: 'Yeni Talep', en: 'New Request', de: 'Neue Anfrage', fr: 'Nouvelle demande', es: 'Nueva solicitud', ru: 'Novyy zapros' },
    rejected: { tr: 'reddedildi', en: 'rejected', de: 'abgelehnt', fr: 'refuse', es: 'rechazado', ru: 'otkloneno' },
    delete: { tr: 'Sil', en: 'Delete', de: 'Loschen', fr: 'Supprimer', es: 'Eliminar', ru: 'Udalit' },
    requestSent: { tr: 'Mesajlasma talebi gonderildi (onay bekleniyor)', en: 'Request sent (pending approval)', de: 'Anfrage gesendet (wartet auf Genehmigung)', fr: 'Demande envoyee (en attente)', es: 'Solicitud enviada (pendiente)', ru: 'Zapros otpravlen (ozhidaet podtverzhdeniya)' },
    requestPrefix: { tr: 'Mesajlasma talebi', en: 'Message request', de: 'Nachrichtenanfrage', fr: 'Demande de message', es: 'Solicitud de mensaje', ru: 'Zapros na perepisku' },
    firstRequest: { tr: 'Ilk mesaj talebi', en: 'First message request', de: 'Erste Nachrichtenanfrage', fr: 'Premiere demande', es: 'Primera solicitud', ru: 'Pervyy zapros' },
    requestRejected: { tr: 'Mesajlasma talebi reddedildi', en: 'Message request rejected', de: 'Nachrichtenanfrage abgelehnt', fr: 'Demande refusee', es: 'Solicitud rechazada', ru: 'Zapros otklonen' },
    noMessage: { tr: 'Mesaj yok', en: 'No message', de: 'Keine Nachricht', fr: 'Aucun message', es: 'Sin mensaje', ru: 'Net soobshcheniya' },
    incomingFilter: { tr: 'Bana Gelen Talep', en: 'Incoming', de: 'Eingehend', fr: 'Entrant', es: 'Entrante', ru: 'Vkhodyashchie' },
    outgoingFilter: { tr: 'Gonderdigim Talep', en: 'Outgoing', de: 'Ausgehend', fr: 'Sortant', es: 'Saliente', ru: 'Iskhodyashchie' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr

  const resolveFilter = (value: string | null): RequestFilter => {
    if (value === 'incoming' || value === 'outgoing') return value
    return 'all'
  }

  const resolveTypeFilter = (value: string | null): ThreadTypeFilter => {
    if (
      value === 'general' ||
      value === 'social' ||
      value === 'shop' ||
      value === 'spot' ||
      value === 'help' ||
      value === 'reward' ||
      value === 'trade'
    ) {
      return value
    }
    return 'all'
  }

  const activeFilter = resolveFilter(searchParams.get('filter'))
  const activeTypeFilter = resolveTypeFilter(searchParams.get('type'))

  useEffect(() => {
    const hasFilterQuery = !!searchParams.get('filter')
    const hasTypeQuery = !!searchParams.get('type')

    if (hasFilterQuery || hasTypeQuery) {
      return
    }

    const storedFilter = resolveFilter(localStorage.getItem(FILTER_STORAGE_KEY))
    const storedType = resolveTypeFilter(localStorage.getItem(TYPE_STORAGE_KEY))

    if (storedFilter === 'all' && storedType === 'all') {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (storedFilter !== 'all') {
      params.set('filter', storedFilter)
    }

    if (storedType !== 'all') {
      params.set('type', storedType)
    }

    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.replace(nextUrl, { scroll: false })
  }, [searchParams, pathname, router])

  useEffect(() => {
    if (activeFilter === 'all') {
      localStorage.removeItem(FILTER_STORAGE_KEY)
    } else {
      localStorage.setItem(FILTER_STORAGE_KEY, activeFilter)
    }

    if (activeTypeFilter === 'all') {
      localStorage.removeItem(TYPE_STORAGE_KEY)
    } else {
      localStorage.setItem(TYPE_STORAGE_KEY, activeTypeFilter)
    }
  }, [activeFilter, activeTypeFilter])

  const setFiltersAndSyncUrl = (
    nextFilter: RequestFilter = activeFilter,
    nextType: ThreadTypeFilter = activeTypeFilter
  ) => {

    const params = new URLSearchParams(searchParams.toString())

    if (nextFilter === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', nextFilter)
    }


    if (nextType === 'all') {
      params.delete('type')
      localStorage.setItem(TYPE_STORAGE_KEY, 'all')
    } else {
      params.set('type', nextType)
      localStorage.setItem(TYPE_STORAGE_KEY, nextType)
    }

    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.replace(nextUrl, { scroll: false })
  }

  const filteredThreads = useMemo(() => {
    let nextThreads = threads

    // Quick filter presets
    if (quickFilter === 'unread') {
      nextThreads = nextThreads.filter((thread) => {
        const unreadCount = thread.participant1_id === userId 
          ? thread.unread_count_p1 || 0 
          : thread.unread_count_p2 || 0
        return unreadCount > 0
      })
    } else if (quickFilter === 'pending') {
      nextThreads = nextThreads.filter((thread) => thread.request_status === 'pending')
    } else if (quickFilter === 'active') {
      nextThreads = nextThreads.filter((thread) => thread.request_status === 'accepted')
    }

    if (activeFilter === 'incoming') {
      nextThreads = nextThreads.filter(
        (thread) =>
          thread.request_status === 'pending' &&
          !!thread.request_initiator_id &&
          thread.request_initiator_id !== userId
      )
    }

    if (activeFilter === 'outgoing') {
      nextThreads = nextThreads.filter(
        (thread) =>
          thread.request_status === 'pending' &&
          thread.request_initiator_id === userId
      )
    }

    if (activeTypeFilter !== 'all') {
      nextThreads = nextThreads.filter((thread) => thread.thread_type === activeTypeFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      nextThreads = nextThreads.filter((thread) => {
        const participant1Name = thread.participant1_name?.toLowerCase() || ''
        const participant2Name = thread.participant2_name?.toLowerCase() || ''
        const otherUserName = thread.other_user_name?.toLowerCase() || ''
        
        return (
          participant1Name.includes(query) ||
          participant2Name.includes(query) ||
          otherUserName.includes(query)
        )
      })
    }

    // Sort threads
    if (sortBy === 'unread') {
      nextThreads = [...nextThreads].sort((a, b) => {
        const aUnread = a.participant1_id === userId ? (a.unread_count_p1 || 0) : (a.unread_count_p2 || 0)
        const bUnread = b.participant1_id === userId ? (b.unread_count_p1 || 0) : (b.unread_count_p2 || 0)
        return bUnread - aUnread
      })
    } else {
      // Default sort by newest (last_message_at)
      nextThreads = [...nextThreads].sort((a, b) => {
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      })
    }

    return nextThreads
  }, [threads, activeFilter, activeTypeFilter, userId, searchQuery, quickFilter, sortBy])

  const outgoingPendingCount = useMemo(() => {
    return threads.filter(
      (thread) => thread.request_status === 'pending' && thread.request_initiator_id === userId
    ).length
  }, [threads, userId])

  const incomingPendingCount = useMemo(() => {
    return threads.filter(
      (thread) =>
        thread.request_status === 'pending' &&
        !!thread.request_initiator_id &&
        thread.request_initiator_id !== userId
    ).length
  }, [threads, userId])

  const handlePendingSummaryClick = (targetFilter: RequestFilter) => {
    setQuickFilter('all')
    setFiltersAndSyncUrl(targetFilter, 'all')
  }

  const getThreadTypeLabel = (threadType?: string) => {
    switch (threadType) {
      case 'shop':
        return 'shop'
      case 'spot':
        return 'spot'
      case 'help':
        return locale === 'tr' ? 'yardim' : locale === 'en' ? 'help' : locale === 'de' ? 'hilfe' : locale === 'fr' ? 'aide' : locale === 'es' ? 'ayuda' : 'pomoshch'
      case 'social':
        return locale === 'tr' ? 'sosyal' : locale === 'en' ? 'social' : locale === 'de' ? 'sozial' : locale === 'fr' ? 'social' : locale === 'es' ? 'social' : 'social'
      case 'reward':
        return locale === 'tr' ? 'odul' : locale === 'en' ? 'reward' : locale === 'de' ? 'belohnung' : locale === 'fr' ? 'recompense' : locale === 'es' ? 'recompensa' : 'nagrada'
      case 'trade':
        return locale === 'tr' ? 'ticaret' : locale === 'en' ? 'trade' : locale === 'de' ? 'handel' : locale === 'fr' ? 'echange' : locale === 'es' ? 'comercio' : 'obmen'
      default:
        return locale === 'tr' ? 'genel' : locale === 'en' ? 'general' : locale === 'de' ? 'allgemein' : locale === 'fr' ? 'general' : locale === 'es' ? 'general' : 'obshchiy'
    }
  }

  const getRequestFilterLabel = (filter: RequestFilter) => {
    switch (filter) {
      case 'incoming':
        return trText('incomingFilter')
      case 'outgoing':
        return trText('outgoingFilter')
      default:
        return trText('all')
    }
  }

  const getThreadTypeClass = (threadType?: string) => {
    switch (threadType) {
      case 'shop':
        return 'bg-indigo-100 text-indigo-800'
      case 'spot':
        return 'bg-sky-100 text-sky-800'
      case 'help':
        return 'bg-emerald-100 text-emerald-800'
      case 'social':
        return 'bg-pink-100 text-pink-800'
      case 'reward':
        return 'bg-amber-100 text-amber-800'
      case 'trade':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getOtherParticipantName = (thread: Thread) => {
    // Her zaman sadece full_name göster
    const otherId = thread.participant1_id === userId ? thread.participant2_id : thread.participant1_id;
    const otherName = thread.participant1_id === userId ? thread.participant2_name : thread.participant1_name;
    return otherName || 'Kullanıcı';
  }

  const getUnreadCount = (thread: Thread) => {
    if (thread.participant1_id === userId) {
      return thread.unread_count_p1 || 0
    }
    return thread.unread_count_p2 || 0
  }

  const getMessagePreview = (thread: Thread) => {
    if (thread.request_status === 'pending') {
      if (thread.request_initiator_id === userId) {
        return trText('requestSent')
      }
      return `${trText('requestPrefix')}: ${thread.request_message || trText('firstRequest')}`
    }

    if (thread.request_status === 'rejected') {
      return trText('requestRejected')
    }

    return thread.last_message_preview || 
           thread.last_message_content || 
           trText('noMessage')
  }

  useEffect(() => {
    let cancelled = false

    const translatePreviews = async () => {
      const nextPreviews: Record<string, string> = {}

      for (const thread of threads) {
        const preview = getMessagePreview(thread)
        if (!preview || thread.request_status === 'pending' || thread.request_status === 'rejected') {
          continue
        }

        const targetLanguage =
          thread.participant1_id === userId
            ? thread.participant1_language || locale
            : thread.participant2_language || locale

        const result = await translateTextInBrowser({
          text: preview,
          targetLanguage,
        })

        if (cancelled) return

        if (result.supported) {
          nextPreviews[thread.id] = result.translatedText
        }
      }

      if (!cancelled) {
        setTranslatedPreviews(nextPreviews)
      }
    }

    void translatePreviews()

    return () => {
      cancelled = true
    }
  }, [threads, userId, locale])

  const formatTime = (dateString: string) => {
    if (!dateString) return trText('newItem')
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 60) {
        return `${diffMins} ${trText('minAgo')}`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} ${trText('hourAgo')}`
      } else {
        return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'ru-RU')
      }
    } catch {
      return trText('newItem')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{trText('loading')}</p>
        </div>
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{trText('noMessageYet')}</h3>
        <p className="text-gray-600">{trText('startFirstMessage')}</p>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="px-3 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={trText('searchParticipant')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setQuickFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              quickFilter === 'all' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('all')}
          </button>
          <button
            onClick={() => setQuickFilter('unread')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              quickFilter === 'unread' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('unread')}
          </button>
          <button
            onClick={() => setQuickFilter('pending')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              quickFilter === 'pending' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('pendingRequests')}
          </button>
          <button
            onClick={() => setQuickFilter('active')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              quickFilter === 'active' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('activeChats')}
          </button>
          <div className="flex-shrink-0 h-4 border-l border-gray-300 mx-1"></div>
          <button
            onClick={() => setSortBy('newest')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              sortBy === 'newest' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('newest')}
          </button>
          <button
            onClick={() => setSortBy('unread')}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium ${
              sortBy === 'unread' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {trText('unreadFirst')}
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => handlePendingSummaryClick('outgoing')}
          className={`flex-1 min-w-[180px] text-left rounded-xl border px-3 py-2 transition-colors ${
            activeFilter === 'outgoing'
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{trText('outgoingRequests')}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{outgoingPendingCount}</p>
          <p className="text-xs text-gray-600">{trText('waitingApproval')}</p>
        </button>
        <button
          onClick={() => handlePendingSummaryClick('incoming')}
          className={`flex-1 min-w-[180px] text-left rounded-xl border px-3 py-2 transition-colors ${
            activeFilter === 'incoming'
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >
          <p className="text-[11px] uppercase tracking-wide text-gray-500">{trText('incomingRequests')}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{incomingPendingCount}</p>
          <p className="text-xs text-gray-600">{trText('waitingResponse')}</p>
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFiltersAndSyncUrl('all', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {trText('all')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl('incoming', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'incoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {trText('incomingFilter')} ({incomingPendingCount})
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl('outgoing', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'outgoing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {trText('outgoingFilter')} ({outgoingPendingCount})
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'all')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {trText('allTypes')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'shop')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'shop' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          shop
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'spot')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'spot' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          spot
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'help')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'help' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getThreadTypeLabel('help')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'social')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'social' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getThreadTypeLabel('social')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'reward')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'reward' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getThreadTypeLabel('reward')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'general')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'general' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getThreadTypeLabel('general')}
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'trade')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'trade' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getThreadTypeLabel('trade')}
        </button>
      </div>

      {(activeFilter !== 'all' || activeTypeFilter !== 'all') && (
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {activeFilter !== 'all' && (
            <button
              onClick={() => setFiltersAndSyncUrl('all', activeTypeFilter)}
              className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {trText('requestPrefix')}: {getRequestFilterLabel(activeFilter)} ({filteredThreads.length}) ×
            </button>
          )}
          {activeTypeFilter !== 'all' && (
            <button
              onClick={() => setFiltersAndSyncUrl(activeFilter, 'all')}
              className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              {locale === 'tr' ? 'Tur' : locale === 'en' ? 'Type' : locale === 'de' ? 'Typ' : locale === 'fr' ? 'Type' : locale === 'es' ? 'Tipo' : 'Tip'}: {getThreadTypeLabel(activeTypeFilter)} ({filteredThreads.length}) ×
            </button>
          )}
          <button
            onClick={() => setFiltersAndSyncUrl('all', 'all')}
            className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {trText('clearAll')}
          </button>
        </div>
      )}

      {filteredThreads.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          {trText('noConversationForFilter')}
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {filteredThreads.map((thread) => {
          const unreadCount = getUnreadCount(thread)
          const isSelected = selectedThread === thread.id
          const isPending = thread.request_status === 'pending'
          const isRejected = thread.request_status === 'rejected'
          const isRequestInitiator = thread.request_initiator_id === userId
          
          return (
            <div
              key={thread.id}
              className={`p-4 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-r-4 border-r-blue-600' : 
                isPending ? 'bg-amber-50/30 hover:bg-amber-50' :
                isRejected ? 'bg-red-50/20 hover:bg-red-50/40' :
                'hover:bg-gray-50'
              }`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {getOtherParticipantName(thread)}
                          </h4>
                          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${getThreadTypeClass(thread.thread_type)}`}>
                            {getThreadTypeLabel(thread.thread_type)}
                          </span>
                          {isPending && (
                            <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-amber-500 text-white font-semibold animate-pulse shadow-sm">
                              {isRequestInitiator ? `⚡ ${trText('pendingApprovalTag')}` : `🔔 ${trText('newRequestTag')}`}
                            </span>
                          )}
                          {isRejected && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                              {trText('rejected')}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(thread.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {translatedPreviews[thread.id] || getMessagePreview(thread)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-2">
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                  {thread.status === 'active' && !unreadCount && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteThread(thread.id)
                    }}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title={trText('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}