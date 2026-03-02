// components/social/LocationPicker.tsx
'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  value: string
  onChange: (value: string) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const popularLocations = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
    'Evim', 'İşyeri', 'Sahil', 'Alışveriş Merkezi'
  ]

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nerede çektiniz? (opsiyonel)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {popularLocations.map((location) => (
          <button
            key={location}
            type="button"
            onClick={() => onChange(location)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm"
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  )
}