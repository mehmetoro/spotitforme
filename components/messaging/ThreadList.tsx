// components/messaging/ThreadList.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MessageSquare, CheckCircle, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Thread {
  id: string
  participant_name: string
  participant_avatar: string
  last_message_preview: string
  last_message_at: string
  unread_count: number
  spot_title?: string
  is_read: boolean
}

interface ThreadListProps {
  threads: Thread[]
  selectedThread: string | null
  onSelectThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => Promise<void>
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Bu görüşmeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    setDeletingId(threadId)
    try {
      await onDeleteThread(threadId)
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Silme işlemi başarısız oldu')
    } finally {
      setDeletingId(null)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Dün'
    } else {
      return date.toLocaleDateString('tr-TR')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="p-4 border-b">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
              </div>
              <div className="w-12 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Mesajlar</h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-500">Toplam {threads.length} görüşme</p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {threads.filter(t => t.unread_count > 0).length} okunmamış
            </span>
          </div>
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">Henüz mesajınız yok</p>
            <p className="text-sm">Bir spot için mesaj gönderin veya size mesaj gelmesini bekleyin</p>
          </div>
        ) : (
          <div className="divide-y">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`
                  p-4 cursor-pointer transition-colors relative group
                  ${selectedThread === thread.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50'}
                  ${thread.unread_count > 0 ? 'bg-blue-50/50' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${thread.unread_count > 0 ? 'bg-blue-100' : 'bg-gray-100'}
                      `}>
                        {thread.participant_avatar ? (
                          <img
                            src={thread.participant_avatar}
                            alt={thread.participant_name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <span className={`font-semibold ${thread.unread_count > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                            {thread.participant_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {thread.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {thread.unread_count}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">
                            {thread.participant_name}
                          </span>
                          {thread.is_read ? (
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(thread.last_message_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {thread.last_message_preview}
                      </p>
                      
                      {thread.spot_title && (
                        <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          <span className="truncate max-w-[120px]">
                            {thread.spot_title}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    disabled={deletingId === thread.id}
                    className={`
                      ml-2 p-1 rounded opacity-0 group-hover:opacity-100
                      hover:bg-gray-200 disabled:opacity-50
                      transition-opacity
                    `}
                  >
                    {deletingId === thread.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Aktif kullanıcı: {userId.substring(0, 8)}...</span>
          <span>
            {threads.length > 0 && (
              <>
                {threads.filter(t => !t.is_read).length} bekleyen •{' '}
                {threads.filter(t => t.unread_count > 0).length} okunmamış
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}