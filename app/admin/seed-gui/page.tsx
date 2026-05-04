'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface PlaceEntry {
  id: string
  title: string
  translations: {
    tr: { title: string; description: string }
    en: { title: string; description: string }
    de: { title: string; description: string }
    fr: { title: string; description: string }
    es: { title: string; description: string }
    ru: { title: string; description: string }
  }
  metadata?: {
    city?: string
    district?: string
    lat?: number
    lng?: number
    image?: string
  }
}

export default function SeedGUI() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [txtContent, setTxtContent] = useState('')
  const [places, setPlaces] = useState<PlaceEntry[]>([])
  const [seeding, setSeeding] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [formData, setFormData] = useState({
    city: 'İstanbul',
    district: 'Beyoğlu',
    lat: 41.0338,
    lng: 28.9753,
    category: 'culture',
    adminEmail: 'spotitformeweb@gmail.com',
  })

  const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ru'] as const

  useEffect(() => {
    // For development, allow access without auth
    setAuthenticated(true)
    setLoading(false)
  }, [])

  if (loading) return <div className="text-center p-8">Kontrol ediliyor...</div>
  if (!authenticated) return null

  // Parse txt file
  const parseTxt = () => {
    setError(null)
    setParsing(true)
    try {
      const raw = txtContent
      const parts = raw.split(/^\d+\.\s*$/m).map((s) => s.trim()).filter(Boolean)

      const parsed: PlaceEntry[] = []

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const lines = part.split('\n').map((l) => l.trim()).filter(Boolean)

        // Parse optional META line
        let metadata: Record<string, any> = {}
        let startIdx = 0
        if (lines[0]?.startsWith('META:')) {
          const metaLine = lines[0].slice(5).trim()
          metaLine.split(/\s+/).forEach((token) => {
            const [k, ...v] = token.split('=')
            if (k && v.length) {
              const val = v.join('=').trim()
              metadata[k.trim()] = isNaN(Number(val)) ? val : Number(val)
            }
          })
          startIdx = 1
        }

        // Need at least 12 lines (6 langs × 2)
        if (lines.length - startIdx < 12) {
          console.warn(`⚠ Skipping entry ${i + 1}: only ${lines.length - startIdx} lines`)
          continue
        }

        const translations: PlaceEntry['translations'] = {
          tr: { title: '', description: '' },
          en: { title: '', description: '' },
          de: { title: '', description: '' },
          fr: { title: '', description: '' },
          es: { title: '', description: '' },
          ru: { title: '', description: '' },
        }

        for (let j = 0; j < 6; j++) {
          const title = lines[startIdx + j * 2]
          const description = lines[startIdx + j * 2 + 1]
          translations[LANGS[j]] = { title, description }
        }

        parsed.push({
          id: `place-${i}`,
          title: translations.tr.title,
          translations,
          metadata,
        })
      }

      setPlaces(parsed)
      setParsing(false)
    } catch (err: any) {
      setError(err.message)
      setParsing(false)
    }
  }

  // Add manual entry
  const addManualEntry = () => {
    const newEntry: PlaceEntry = {
      id: `place-${Date.now()}`,
      title: 'Yeni Yer',
      translations: {
        tr: { title: 'Başlık (TR)', description: 'Açıklama (TR)' },
        en: { title: 'Title (EN)', description: 'Description (EN)' },
        de: { title: 'Titel (DE)', description: 'Beschreibung (DE)' },
        fr: { title: 'Titre (FR)', description: 'Description (FR)' },
        es: { title: 'Título (ES)', description: 'Descripción (ES)' },
        ru: { title: 'Заголовок (RU)', description: 'Описание (RU)' },
      },
    }
    setPlaces([...places, newEntry])
  }

  // Update entry
  const updateEntry = (id: string, field: string, lang: string, value: string) => {
    setPlaces(
      places.map((p) => {
        if (p.id === id) {
          if (field === 'title' && !lang) {
            return { ...p, title: value }
          } else if (field === 'metadata-key') {
            // lang actually contains the metadata key name
            const numVal = parseFloat(value)
            return {
              ...p,
              metadata: { ...p.metadata, [lang]: isNaN(numVal) ? value : numVal },
            }
          } else {
            const newP = JSON.parse(JSON.stringify(p))
            newP.translations[lang][field] = value
            return newP
          }
        }
        return p
      })
    )
  }

  // Delete entry
  const deleteEntry = (id: string) => {
    setPlaces(places.filter((p) => p.id !== id))
  }

  // Seed all
  const seedAll = async () => {
    setSeeding(true)
    setError(null)
    setResult(null)

    try {
      const payload = places.map((p) => ({
        title: p.title,
        content: p.translations.tr.description,
        description: p.translations.tr.description,
        category: formData.category,
        city: p.metadata?.city || formData.city,
        district: p.metadata?.district || formData.district,
        latitude: p.metadata?.lat || formData.lat,
        longitude: p.metadata?.lng || formData.lng,
        images: p.metadata?.image ? [p.metadata.image] : null,
        post_type: 'rare_sight',
        translations: p.translations,
      }))

      const response = await fetch('/api/admin/seed-from-gui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
        body: JSON.stringify({ places: payload, adminEmail: formData.adminEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Seeding failed')
      } else {
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🌍 Nadir Seyahat Seed GUI</h1>
        <p className="text-gray-600 mb-8">Yerler ekle, çevirilerini sağla, veritabanına kaydet</p>

        {/* Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">⚙️ Ayarlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Import seyahat.txt */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📋 seyahat.txt İçe Aktar</h2>
          <textarea
            value={txtContent}
            onChange={(e) => setTxtContent(e.target.value)}
            placeholder="Yapıştır veya yaz..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={parseTxt}
              disabled={parsing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Parse Et
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-green-800">
              <strong>Başarılı!</strong> {result.inserted} yer + {result.translationsInserted} çeviri eklendi.
            </div>
          </div>
        )}

        {/* Places */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📍 Yerler ({places.length})</h2>
            <button
              onClick={addManualEntry}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Yeni Yer Ekle
            </button>
          </div>

          <div className="space-y-6">
            {places.map((place, idx) => (
              <div key={place.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={place.title}
                      onChange={(e) => updateEntry(place.id, 'title', '', e.target.value)}
                      className="w-full text-lg font-semibold px-2 py-1 border border-gray-300 rounded"
                    />
                  </div>
                  <button
                    onClick={() => deleteEntry(place.id)}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Meta</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {['city', 'district', 'lat', 'lng'].map((k) => (
                      <div key={k}>
                        <label className="block text-gray-600 mb-1">{k}</label>
                        <input
                          type="text"
                          defaultValue={place.metadata?.[k as keyof typeof place.metadata] ?? formData[k as keyof typeof formData]}
                          onChange={(e) => updateEntry(place.id, 'metadata-key', k, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {LANGS.map((lang) => (
                    <div key={lang} className="border border-gray-200 rounded p-3">
                      <p className="text-xs font-semibold uppercase text-gray-600 mb-2">{lang}</p>
                      <input
                        type="text"
                        placeholder="Başlık"
                        value={place.translations[lang].title}
                        onChange={(e) =>
                          updateEntry(place.id, 'title', lang, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                      />
                      <textarea
                        placeholder="Açıklama"
                        value={place.translations[lang].description}
                        onChange={(e) =>
                          updateEntry(place.id, 'description', lang, e.target.value)
                        }
                        className="w-full h-20 px-2 py-1 border border-gray-300 rounded text-sm font-mono resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {places.length > 0 && (
            <button
              onClick={seedAll}
              disabled={seeding}
              className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {seeding ? 'Seed Yapılıyor...' : `Hepsini Seed Et (${places.length} yer)`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
