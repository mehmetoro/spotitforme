// components/social/HashtagInput.tsx
'use client'

import { useState } from 'react'

interface HashtagInputProps {
  hashtags: string[]
  onAdd: (hashtag: string) => void
  onRemove: (hashtag: string) => void
}

export default function HashtagInput({ hashtags, onAdd, onRemove }: HashtagInputProps) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const cleanTag = input.trim().replace(/#/g, '')
    if (cleanTag && !hashtags.includes(cleanTag)) {
      onAdd(cleanTag)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Hashtag'ler (opsiyonel)
      </label>
      
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="#vintage #kamera #antika"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-r-lg"
        >
          Ekle
        </button>
      </div>

      {/* Hashtag listesi */}
      <div className="flex flex-wrap gap-2">
        {hashtags.map((tag) => (
          <div
            key={tag}
            className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-2 text-blue-600 hover:text-blue-900"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Hashtag başına +2 puan kazanırsınız. Max 5 hashtag.
      </p>
    </div>
  )
}