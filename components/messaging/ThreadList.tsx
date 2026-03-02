// components/messaging/ThreadList.tsx - DÜZELTİLMİŞ
'use client'

import { MessageSquare, User, Clock, Trash2, CheckCircle } from 'lucide-react'

interface Thread {
  id: string
  participant1_id: string
  participant2_id: string
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
      <div className="divide-y divide-gray-100">
        {threads.map((thread) => {
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
                        <h4 className="font-medium text-gray-900 truncate">
                          {getOtherParticipantName(thread)}
                        </h4>
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