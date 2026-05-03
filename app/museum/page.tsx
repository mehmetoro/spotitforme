'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const museumText = {
  tr: { title: '🏛️ Nadir Müzesi', subtitle: 'Topluluğun vitrinde yayınladığı nadir seyahatler', empty: 'Henüz müzede yayınlanan nadir seyahat yok.', unknownUser: 'Kullanıcı' },
  en: { title: '🏛️ Rare Museum', subtitle: 'Rare sightings published in the community showcase', empty: 'No rare sightings published in the museum yet.', unknownUser: 'User' },
  de: { title: '🏛️ Seltenes Museum', subtitle: 'Seltene Sichtungen im Community-Schaufenster', empty: 'Noch keine seltenen Sichtungen im Museum.', unknownUser: 'Benutzer' },
  fr: { title: '🏛️ Musée des Raretés', subtitle: 'Observations rares publiées dans la vitrine communautaire', empty: 'Aucune observation rare publiée dans le musée pour l\'instant.', unknownUser: 'Utilisateur' },
  es: { title: '🏛️ Museo de Rarezas', subtitle: 'Avistamientos raros publicados en el escaparate comunitario', empty: 'Aún no hay avistamientos raros en el museo.', unknownUser: 'Usuario' },
  ru: { title: '🏛️ Музей Редкостей', subtitle: 'Редкие находки, опубликованные в витрине сообщества', empty: 'В музее пока нет редких находок.', unknownUser: 'Пользователь' },
} as const
import { buildRareSightingPath } from '@/lib/sighting-slug'
import { supabase } from '@/lib/supabase'

interface MuseumItem {
  id: string
  user_id: string
  title: string | null
  description: string
  link_preview_title: string | null
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
  const locale = useCurrentLocale()
  const t = museumText[locale as keyof typeof museumText] ?? museumText.tr
  const [items, setItems] = useState<MuseumItem[]>([])
  const [users, setUsers] = useState<Record<string, MuseumUser>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMuseum = async () => {
      try {
        const { data, error } = await supabase
          .from('quick_sightings')
          .select('id, user_id, title, description, link_preview_title, photo_url, location_name, city, category, price, created_at')
          .eq('status', 'active')
          .eq('is_in_museum', true)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error

        let museumItems = (data || []) as MuseumItem[]

        // Mevcut locale için çevirileri çek
        if (museumItems.length > 0) {
          const ids = museumItems.map((item) => item.id)
          const { data: translations } = await supabase
            .from('quick_sighting_translations')
            .select('quick_sighting_id, title, description')
            .in('quick_sighting_id', ids)
            .eq('language', locale)

          if (translations && translations.length > 0) {
            const translationMap: Record<string, { title: string; description: string }> = {}
            translations.forEach((tr: any) => {
              translationMap[tr.quick_sighting_id] = { title: tr.title, description: tr.description }
            })
            museumItems = museumItems.map((item) => {
              const tr = translationMap[item.id]
              if (!tr) return item
              return {
                ...item,
                title: tr.title || item.title,
                description: tr.description || item.description,
              }
            })
          }
        }

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
  }, [locale])

  return (
    <main className="container-custom py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-gray-600">{t.empty}</p>        </div>
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
                  <span>{users[item.user_id]?.full_name || t.unknownUser}</span>
                  <span>{new Date(item.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-US')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
