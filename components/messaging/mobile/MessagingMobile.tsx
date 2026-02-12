// components/messaging/mobile/MessagingMobile.tsx
'use client'

import { useState, useEffect } from 'react'
import { Menu, MessageSquare, Search, User } from 'lucide-react'
import MobileThreadList from './MobileThreadList'
import MobileMessageThread from './MobileMessageThread'
import MobileNewMessage from './MobileNewMessage'

interface Thread {
  id: string
  participant_name: string
  last_message_preview: string
  last_message_at: string
}

interface MobileMessagingProps {
  userId: string
}

type ViewType = 'list' | 'thread' | 'newMessage'

export default function MessagingMobile({ userId }: MobileMessagingProps) {
  const [currentView, setCurrentView] = useState<ViewType>('list')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThreads()
  }, [])

  const fetchThreads = async () => {
    try {
      // Örnek veri - gerçek API'yi bağlayacaksınız
      const mockThreads: Thread[] = [
        {
          id: '1',
          participant_name: 'Ahmet Yılmaz',
          last_message_preview: 'O ürünü Kadıköy\'de gördüm',
          last_message_at: '2024-01-15T10:30:00'
        },
        {
          id: '2',
          participant_name: 'Zeynep Demir',
          last_message_preview: 'Fotoğrafı ekledim',
          last_message_at: '2024-01-14T15:45:00'
        },
        {
          id: '3',
          participant_name: 'Mehmet Öz',
          last_message_preview: 'Yarın buluşabilir miyiz?',
          last_message_at: '2024-01-13T09:15:00'
        }
      ]
      setThreads(mockThreads)
    } catch (error) {
      console.error('Threads yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId)
    setCurrentView('thread')
  }

  const handleNewMessage = () => {
    setCurrentView('newMessage')
  }

  const handleSendMessage = async (receiverId: string, content: string) => {
    try {
      console.log('Mobil mesaj gönderiliyor:', { receiverId, content, userId })
      // Gerçek API çağrısını buraya ekleyin
      alert('Mesaj gönderildi!')
      setCurrentView('list')
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error)
      alert('Mesaj gönderilemedi')
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <h1 className="text-xl font-bold">Mesajlar</h1>
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNewMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
            <MobileThreadList
              threads={threads}
              onSelectThread={handleSelectThread}
              loading={loading}
            />
          </>
        )
      
      case 'thread':
        return (
          <>
            <div className="p-4 border-b bg-white">
              <button
                onClick={() => setCurrentView('list')}
                className="text-blue-600 font-medium"
              >
                ← Mesajlara dön
              </button>
            </div>
            {selectedThreadId && (
              <MobileMessageThread
                threadId={selectedThreadId}
                userId={userId}
                onBack={() => setCurrentView('list')}
              />
            )}
          </>
        )
      
      case 'newMessage':
        return (
          <MobileNewMessage
            onClose={() => setCurrentView('list')}
            onSendMessage={handleSendMessage}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* Bottom Navigation (sadece list view'da göster) */}
      {currentView === 'list' && (
        <div className="border-t bg-white">
          <div className="flex justify-around items-center py-3">
            <button className="flex flex-col items-center">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <span className="text-xs mt-1 font-medium text-blue-500">Mesajlar</span>
            </button>
            <button 
              onClick={handleNewMessage}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center -mt-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs mt-1">Yeni Mesaj</span>
            </button>
            <button className="flex flex-col items-center">
              <User className="w-6 h-6 text-gray-500" />
              <span className="text-xs mt-1 text-gray-500">Profil</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats (sadece list view'da) */}
      {currentView === 'list' && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="text-center text-xs text-gray-500">
            <p>Aktif kullanıcı: {userId?.substring(0, 8) || 'guest'} • {threads.length} görüşme</p>
          </div>
        </div>
      )}
    </div>
  )
}