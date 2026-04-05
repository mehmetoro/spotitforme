'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { buildRareSightingPath } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'

interface MuseumItem {
  id: string
  user_id: string
  description: string
  photo_url: string | null
  location_name: string
  city: string | null
  category: string | null
  price: number | null
  created_at: string
}

interface MuseumUser {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function MuseumPage() {
  const [items, setItems] = useState<MuseumItem[]>([])
  const [users, setUsers] = useState<Record<string, MuseumUser>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMuseum = async () => {
      try {
        const { data, error } = await supabase
          .from('quick_sightings')
          .select('id, user_id, description, photo_url, location_name, city, category, price, created_at')
          .eq('status', 'active')
          .eq('is_in_museum', true)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        const museumItems = (data || []) as MuseumItem[]
        setItems(museumItems)

        const userIds = Array.from(new Set(museumItems.map((item) => item.user_id).filter(Boolean)))
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)

          const profileMap: Record<string, MuseumUser> = {}
          ;(profileData || []).forEach((p: any) => {
            profileMap[p.id] = p
          })
          setUsers(profileMap)
        }
      } catch (err) {
        console.error('Museum page error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMuseum()
  }, [])

  return (
    <main className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🏛️ Nadir Müzesi</h1>
        <p className="text-gray-600 mt-1">Topluluğun vitrinde yayınladığı nadir paylaşımlar</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-600">Henüz müzede yayınlanan nadir paylaşım yok.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={buildRareSightingPath(item.id, item.title || item.link_preview_title || item.description)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <div className="h-48 bg-gray-100 overflow-hidden">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.description} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-purple-300">💎</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900 line-clamp-2 mb-2">{item.description}</p>
                <p className="text-sm text-gray-600 mb-2">📍 {item.location_name}{item.city ? `, ${item.city}` : ''}</p>
                {item.price != null && (
                  <p className="text-sm font-semibold text-green-700 mb-2">₺{item.price.toLocaleString('tr-TR')}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                  <span>{users[item.user_id]?.full_name || 'Kullanıcı'}</span>
                  <span>{new Date(item.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
