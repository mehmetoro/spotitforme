// components/social/FeedFilters.tsx - DÜZELTİLMİŞ
'use client'

export type FilterType =
  | 'for-you'
  | 'following'
  | 'popular'
  | 'category'
  | 'rare'
  | 'spots'
  | 'found'
  | 'products'

interface FeedFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void // TİP DÜZELTMESİ
}

export default function FeedFilters({ 
  activeFilter, 
  onFilterChange 
}: FeedFiltersProps) {
  const filters: Array<{ id: FilterType; label: string; icon: string }> = [
    { id: 'for-you', label: 'Özel', icon: '🎯' },
    { id: 'following', label: 'Takip', icon: '👥' },
    { id: 'popular', label: 'Popüler', icon: '🔥' },
    { id: 'rare', label: 'Nadir', icon: '👁️' },
    { id: 'spots', label: 'Spotlar', icon: '📍' },
    { id: 'found', label: 'Gördüm', icon: '🔍' },
    { id: 'products', label: 'Ürünler', icon: '🛍️' },
    { id: 'category', label: 'Kategoriler', icon: '🏷️' }
  ]

  return (
    <div className="w-full overflow-x-auto pb-3">
      <div className="inline-flex min-w-max gap-2 pr-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
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
    </div>
  )
}