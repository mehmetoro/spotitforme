// components/shop/InventoryGrid.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ProductCard from './ProductCard'

interface InventoryGridProps {
  shopId: string
  limit?: number
  showFilters?: boolean
}

export default function InventoryGrid({ 
  shopId, 
  limit = 12, 
  showFilters = false 
}: InventoryGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'newest'
  })

  useEffect(() => {
    fetchProducts()
  }, [shopId, filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', 'active')

      // Filtreler
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition)
      }
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice))
      }

      // Sıralama
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('view_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      query = query.limit(limit)

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Products yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  // Geri kalan kod aynı...
  return (
    <div>
      {/* Filtreler */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-xl shadow p-4">
          {/* Filtre UI */}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz ürün yok</h3>
          <p className="text-gray-600">Bu mağaza henüz ürün eklememiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              shopId={shopId}
            />
          ))}
        </div>
      )}
    </div>
  )
}