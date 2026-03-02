// components/social/SearchBar.tsx
'use client'

import { useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  onPostTypeFilter?: (type: string) => void
}

export default function SearchBar({ onSearch, onPostTypeFilter }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    onPostTypeFilter?.(type)
  }

  const types = [
    { id: 'all', label: 'Hepsi' },
    { id: 'rare_sight', label: '👁️ Nadir Gördüm' },
    { id: 'spot', label: '📍 Spot' },
    { id: 'found', label: '🔍 Ben Gördüm' },
    { id: 'product', label: '🛍️ Ürün' }
  ]

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      {/* Arama Kutusu */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Paylaşımları ara... (başlık, içerik)"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tür Filtreleri */}
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeFilter(type.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
