// components/messaging/ThreadList.tsx - DÜZELTİLMİŞ
'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MessageSquare, User, Clock, Trash2, CheckCircle } from 'lucide-react'

interface Thread {
  id: string
  participant1_id: string
  participant2_id: string
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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
    } else {
      params.set('type', nextType)
    }

    const query = params.toString()
    const nextUrl = query ? `${pathname}?${query}` : pathname
    router.replace(nextUrl, { scroll: false })
  }

  const filteredThreads = useMemo(() => {
    let nextThreads = threads

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

    return nextThreads
  }, [threads, activeFilter, activeTypeFilter, userId])

  const getThreadTypeLabel = (threadType?: string) => {
    switch (threadType) {
      case 'shop':
        return 'shop'
      case 'spot':
        return 'spot'
      case 'help':
        return 'yardım'
      case 'social':
        return 'sosyal'
      case 'reward':
        return 'ödül'
      case 'trade':
        return 'ticaret'
      default:
        return 'genel'
    }
  }

  const getRequestFilterLabel = (filter: RequestFilter) => {
    switch (filter) {
      case 'incoming':
        return 'Bana Gelen Talep'
      case 'outgoing':
        return 'Gönderdiğim Talep'
      default:
        return 'Tümü'
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
    if (thread.participant1_id === userId) {
      return thread.participant2_name || thread.other_user_name || `Kullanıcı-${thread.participant2_id?.substring(0, 8) || 'unknown'}`
    }
    return thread.participant1_name || thread.other_user_name || `Kullanıcı-${thread.participant1_id?.substring(0, 8) || 'unknown'}`
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
        return 'Mesajlaşma talebi gönderildi (onay bekleniyor)'
      }
      return `Mesajlaşma talebi: ${thread.request_message || 'İlk mesaj talebi'}`
    }

    if (thread.request_status === 'rejected') {
      return 'Mesajlaşma talebi reddedildi'
    }

    return thread.last_message_preview || 
           thread.last_message_content || 
           'Mesaj yok'
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Yeni'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 60) {
        return `${diffMins} dk önce`
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)} saat önce`
      } else {
        return date.toLocaleDateString('tr-TR')
      }
    } catch {
      return 'Yeni'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz mesajınız yok</h3>
        <p className="text-gray-600">İlk mesajınızı göndererek başlayın</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFiltersAndSyncUrl('all', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl('incoming', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'incoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bana Gelen Talep
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl('outgoing', activeTypeFilter)}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'outgoing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gönderdiğim Talep
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'all')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tüm Türler
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
          yardım
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'social')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'social' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          sosyal
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'reward')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'reward' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ödül
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'general')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'general' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          genel
        </button>
        <button
          onClick={() => setFiltersAndSyncUrl(activeFilter, 'trade')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeTypeFilter === 'trade' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ticaret
        </button>
      </div>

      {(activeFilter !== 'all' || activeTypeFilter !== 'all') && (
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          {activeFilter !== 'all' && (
            <button
              onClick={() => setFiltersAndSyncUrl('all', activeTypeFilter)}
              className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Talep: {getRequestFilterLabel(activeFilter)} ×
            </button>
          )}
          {activeTypeFilter !== 'all' && (
            <button
              onClick={() => setFiltersAndSyncUrl(activeFilter, 'all')}
              className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
            >
              Tür: {getThreadTypeLabel(activeTypeFilter)} ×
            </button>
          )}
          <button
            onClick={() => setFiltersAndSyncUrl('all', 'all')}
            className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Tümünü Temizle
          </button>
        </div>
      )}

      {filteredThreads.length === 0 && (
        <div className="p-6 text-center text-sm text-gray-500">
          Bu filtreye uygun konuşma bulunamadı.
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {filteredThreads.map((thread) => {
          const unreadCount = getUnreadCount(thread)
          const isSelected = selectedThread === thread.id
          
          return (
            <div
              key={thread.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
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
                          {thread.request_status === 'pending' && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                              talep
                            </span>
                          )}
                          {thread.request_status === 'rejected' && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                              reddedildi
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTime(thread.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {getMessagePreview(thread)}
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
                    title="Sil"
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