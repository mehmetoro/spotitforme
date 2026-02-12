// components/shop/ProductCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    title: string
    description?: string
    price: number
    currency: string
    images: string[]
    condition: string
    location?: string
    view_count: number
    created_at: string
  }
  shopId: string
}

export default function ProductCard({ product, shopId }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const getConditionText = (condition: string) => {
    const conditions: Record<string, string> = {
      'new': 'Yeni',
      'like_new': 'Yeni Gibi',
      'used_good': 'İyi Durumda',
      'used_fair': 'Orta Durumda',
      'for_parts': 'Parça İçin'
    }
    return conditions[condition] || condition
  }

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-green-100 text-green-800',
      'like_new': 'bg-blue-100 text-blue-800',
      'used_good': 'bg-yellow-100 text-yellow-800',
      'used_fair': 'bg-orange-100 text-orange-800',
      'for_parts': 'bg-red-100 text-red-800'
    }
    return colors[condition] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Link href={`/shop/${shopId}/products/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0]}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <span className="text-3xl text-gray-400">📦</span>
                <p className="text-sm text-gray-500 mt-2">Resim Yok</p>
              </div>
            </div>
          )}
          
          {/* Condition badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
              {getConditionText(product.condition)}
            </span>
          </div>
          
          {/* View count */}
          {product.view_count > 0 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
              👁️ {product.view_count}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600">
            {product.title}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="font-bold text-lg text-gray-900">
              {product.price.toLocaleString('tr-TR')} {product.currency}
            </div>
            
            {product.location && (
              <div className="text-sm text-gray-500 flex items-center">
                <span className="mr-1">📍</span>
                {product.location.split(',')[0]}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {new Date(product.created_at).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}