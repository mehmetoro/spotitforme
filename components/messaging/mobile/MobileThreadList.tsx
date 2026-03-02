// components/messaging/mobile/MobileThreadList.tsx
'use client'

interface Thread {
  id: string
  participant_name: string
  last_message_preview: string
  last_message_at: string
  unread_count?: number
}

interface MobileThreadListProps {
  threads: Thread[]
  onSelectThread: (threadId: string) => void
  loading: boolean
}

export default function MobileThreadList({ 
  threads, 
  onSelectThread, 
  loading 
}: MobileThreadListProps) {
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
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {threads.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Henüz mesajınız yok</p>
        </div>
      ) : (
        <div className="divide-y">
          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className="p-4 border-b hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${thread.unread_count ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <span className={`font-semibold ${thread.unread_count ? 'text-blue-600' : 'text-gray-600'}`}>
                        {thread.participant_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    {thread.unread_count && thread.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {thread.unread_count}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">
                        {thread.participant_name || 'Kullanıcı'}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(thread.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {thread.last_message_preview || '...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}