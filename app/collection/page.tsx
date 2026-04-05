'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildCollectionPath } from '@/lib/sighting-slug'

interface CollectionPost {
  id: string
  user_id: string
  title: string
  description: string
  category: string | null
  photo_url: string | null
  estimated_price: number | null
  city: string | null
  district: string | null
  created_at: string
}

interface CollectionUser {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function CollectionPage() {
  const [items, setItems] = useState<CollectionPost[]>([])
  const [users, setUsers] = useState<Record<string, CollectionUser>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const { data, error } = await supabase
          .from('collection_posts')
          .select('id, user_id, title, description, category, photo_url, estimated_price, city, district, created_at')
          .eq('is_public', true)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        const collectionItems = (data || []) as CollectionPost[]
        setItems(collectionItems)

        const userIds = Array.from(new Set(collectionItems.map((item) => item.user_id).filter(Boolean)))
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)

          const profileMap: Record<string, CollectionUser> = {}
          ;(profileData || []).forEach((p: any) => {
            profileMap[p.id] = p
          })
          setUsers(profileMap)
        }
      } catch (err) {
        console.error('Collection page error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [])

  return (
    <main className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">💼 Koleksiyon</h1>
        <p className="text-gray-600 mt-1">Kullanıcıların fiziki koleksiyon vitrinleri</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-600">Henüz yayınlanan koleksiyon paylaşımı yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="h-48 bg-gray-100 overflow-hidden">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-blue-300">🧳</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h2>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                {item.category && <p className="text-xs text-gray-500 mb-1">Kategori: {item.category}</p>}
                {(item.city || item.district) && (
                  <p className="text-xs text-gray-500 mb-1">📍 {[item.city, item.district].filter(Boolean).join(', ')}</p>
                )}
                {item.estimated_price != null && (
                  <p className="text-sm font-semibold text-green-700 mb-2">Tahmini Değer: ₺{item.estimated_price.toLocaleString('tr-TR')}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                  <span>{users[item.user_id]?.full_name || 'Kullanıcı'}</span>
                  <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                <Link
                  href={buildCollectionPath(item.id, item.title)}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Detayı Görüntüle
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
