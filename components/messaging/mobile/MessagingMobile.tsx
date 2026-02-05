// components/messaging/mobile/MessagingMobile.tsx
'use client'

import { useState } from 'react'
import MobileThreadList from './MobileThreadList'
import MobileMessageThread from './MobileMessageThread'
import MobileNewMessage from './MobileNewMessage'

export default function MessagingMobile({ userId }: { userId: string }) {
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list')
  const [selectedThread, setSelectedThread] = useState<string | null>(null)

  return (
    <div className="md:hidden h-screen bg-white">
      {view === 'list' && (
        <MobileThreadList
          userId={userId}
          onSelectThread={(threadId) => {
            setSelectedThread(threadId)
            setView('thread')
          }}
          onNewMessage={() => setView('new')}
        />
      )}

      {view === 'thread' && selectedThread && (
        <MobileMessageThread
          threadId={selectedThread}
          userId={userId}
          onBack={() => setView('list')}
        />
      )}

      {view === 'new' && (
        <MobileNewMessage
          userId={userId}
          onSend={() => setView('list')}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}