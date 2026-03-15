// components/social/PostActions.tsx - DÜZELTİLMİŞ
'use client'

import { useState } from 'react'

interface PostActionsProps {
  isLiked: boolean
  isSaved: boolean
  onLike: (e?: React.MouseEvent) => void | Promise<void> // allow event
  onSave: (e?: React.MouseEvent) => void | Promise<void> // allow event
  onComment: () => void
  onShare: () => void
}

export default function PostActions({
  isLiked,
  isSaved,
  onLike,
  onSave,
  onComment,
  onShare
}: PostActionsProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const reactions = [
    { emoji: '❤️', label: 'Like', value: 'like' },
    { emoji: '😍', label: 'Love', value: 'love' },
    { emoji: '😮', label: 'Wow', value: 'wow' },
    { emoji: '😂', label: 'Haha', value: 'laugh' },
    { emoji: '😢', label: 'Sad', value: 'sad' },
    { emoji: '😠', label: 'Angry', value: 'angry' }
  ]

  const shareOptions = [
    { icon: '📱', label: 'Mesaj', action: 'message' },
    { icon: '📧', label: 'Email', action: 'email' },
    { icon: '🔗', label: 'Kopyala', action: 'copy' },
    { icon: '📘', label: 'Facebook', action: 'facebook' },
    { icon: '🐦', label: 'Twitter', action: 'twitter' }
  ]

  const handleReaction = (reaction: string) => {
    console.log('Reaction:', reaction)
    setShowReactions(false)
  }

  const handleShare = (action: string) => {
    console.log('Share action:', action)
    setShowShareMenu(false)
  }

  return (
    <div className="px-6 py-3 border-t border-gray-100 overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Sol taraf - Beğeni ve yorum */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Beğeni butonu ve reactions */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(e) }}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition whitespace-nowrap ${
                isLiked 
                  ? 'bg-red-50 text-red-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
              <span className="font-medium hidden sm:inline">Beğen</span>
            </button>

            {/* Reactions popup */}
            {showReactions && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border p-2 flex space-x-1 z-50 max-w-[calc(100vw-2rem)]"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
              >
                {reactions.map((reaction) => (
                  <button
                    key={reaction.value}
                    onClick={() => handleReaction(reaction.value)}
                    className="w-10 h-10 hover:scale-125 transform transition duration-200 text-2xl"
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Yorum butonu */}
          <button
            onClick={(e) => { e.stopPropagation(); onComment() }}
            className="flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 whitespace-nowrap"
          >
            <span className="text-xl">💬</span>
            <span className="font-medium hidden sm:inline">Yorum</span>
          </button>
        </div>

        {/* Sağ taraf - Paylaş ve kaydet */}
        <div className="flex items-center space-x-2">
          {/* Kaydet butonu */}
          <button
            onClick={(e) => { e.stopPropagation(); onSave(e) }}
            className={`p-2 rounded-full ${
              isSaved 
                ? 'bg-yellow-50 text-yellow-600' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={isSaved ? 'Kaydedildi' : 'Kaydet'}
          >
            <span className="text-xl">
              {isSaved ? '⭐' : '✰'}
            </span>
          </button>

          {/* Paylaş butonu ve menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu) }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              title="Paylaş"
            >
              <span className="text-xl">📤</span>
            </button>

            {/* Share menu */}
            {showShareMenu && (
              <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-2xl border p-3 w-48 z-50">
                <div className="space-y-2">
                  {shareOptions.map((option) => (
                    <button
                      key={option.action}
                      onClick={() => handleShare(option.action)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}