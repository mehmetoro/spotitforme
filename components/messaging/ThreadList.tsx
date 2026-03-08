// components/messaging/ThreadList.tsx - DÜZELTİLMİŞ
'use client'

import { useMemo, useState } from 'react'
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

export default function ThreadList({
  threads,
  selectedThread,
  onSelectThread,
  onDeleteThread,
  loading,
  userId
}: ThreadListProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'incoming' | 'outgoing'>('all')

  const filteredThreads = useMemo(() => {
    if (activeFilter === 'incoming') {
      return threads.filter(
        (thread) =>
          thread.request_status === 'pending' &&
          !!thread.request_initiator_id &&
          thread.request_initiator_id !== userId
      )
    }

    if (activeFilter === 'outgoing') {
      return threads.filter(
        (thread) =>
          thread.request_status === 'pending' &&
          thread.request_initiator_id === userId
      )
    }

    return threads
  }, [threads, activeFilter, userId])

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
          onClick={() => setActiveFilter('all')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setActiveFilter('incoming')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'incoming' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bana Gelen Talep
        </button>
        <button
          onClick={() => setActiveFilter('outgoing')}
          className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
            activeFilter === 'outgoing' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gönderdiğim Talep
        </button>
      </div>

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