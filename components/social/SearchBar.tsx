// components/social/SearchBar.tsx
'use client'

import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
}

export default function SearchBar({ onSearch, initialValue }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue || '')

  // initialValue prop'u değiştiğinde query'yi güncelle
  useEffect(() => {
    if (initialValue !== undefined) {
      setQuery(initialValue)
    }
  }, [initialValue])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }


  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm p-4 mb-6">
      {/* Arama Kutusu */}
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Paylaşımları ara... (başlık, içerik)"
        className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
      />
    </div>
  )
}
