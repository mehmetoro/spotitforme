// components/social/FeedFilters.tsx - DÜZELTİLMİŞ
'use client'

export type FilterType = 'for-you' | 'following' | 'popular' | 'category'

interface FeedFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void // TİP DÜZELTMESİ
}

export default function FeedFilters({ 
  activeFilter, 
  onFilterChange 
}: FeedFiltersProps) {
  const filters: Array<{ id: FilterType; label: string; icon: string }> = [
    { id: 'for-you', label: 'Sana Özel', icon: '🎯' },
    { id: 'following', label: 'Takip Edilenler', icon: '👥' },
    { id: 'popular', label: 'Popüler', icon: '🔥' },
    { id: 'category', label: 'Kategoriler', icon: '🏷️' }
  ]

  return (
    <div className="flex overflow-x-auto space-x-2 pb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
            activeFilter === filter.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  )
}