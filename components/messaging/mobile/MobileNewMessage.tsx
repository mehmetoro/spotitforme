// components/messaging/mobile/MobileNewMessage.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Search, User, Send, AlertCircle } from 'lucide-react'

interface MobileNewMessageProps {
  onClose: () => void
  onSendMessage: (receiverId: string, content: string) => void
}

export default function MobileNewMessage({ 
  onClose, 
  onSendMessage 
}: MobileNewMessageProps) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const users = [
    { id: '1', name: 'Ahmet Yılmaz', lastActive: '2 saat önce' },
    { id: '2', name: 'Zeynep Demir', lastActive: '1 gün önce' },
    { id: '3', name: 'Mehmet Öz', lastActive: 'Çevrimiçi' }
  ]

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId)
    const user = users.find(u => u.id === userId)
    if (user) {
      setMessage(`Merhaba ${user.name},\n\n`)
    }
  }

  const handleSend = () => {
    if (!selectedUser || !message.trim()) {
      alert('Lütfen bir kullanıcı seçin ve mesajınızı yazın')
      return
    }
    
    onSendMessage(selectedUser, message)
    onClose()
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center bg-white">
        <button onClick={onClose} className="mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {selectedUser ? 'Yeni Mesaj' : 'Kime?'}
        </h2>
      </div>

      {!selectedUser ? (
        /* Kullanıcı Seçimi */
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kişi ara..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Kullanıcı bulunamadı</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.lastActive}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 text-sm">Seç</button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Mesaj Yazma */
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">
                  {users.find(u => u.id === selectedUser)?.name}
                </p>
                <p className="text-xs text-gray-500">Mesaj gönderiliyor</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="w-full h-40 p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            />
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Güvenlik Uyarısı
                  </p>
                  <p className="text-xs text-yellow-700">
                    • Kişisel bilgilerinizi paylaşmayın
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t">
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-5 h-5 mr-2" />
              Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  )
}