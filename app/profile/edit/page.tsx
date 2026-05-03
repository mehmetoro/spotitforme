// app/profile/edit/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const peText = {
  tr: { title: 'Profil Düzenle', nameLabel: 'Adınız', namePlaceholder: 'Adınızı girin', bioLabel: 'Biyografi', bioPlaceholder: 'Kendiniz hakkında kısaca yazın...', locationLabel: 'Konum', locationPlaceholder: 'Şehir, Ülke', websiteLabel: 'Website', saving: 'Kaydediliyor...', save: 'Değişiklikleri Kaydet', cancel: 'İptal', successMsg: '✅ Profil başarıyla güncellendi!', errLogin: 'Giriş yapmalısınız' },
  en: { title: 'Edit Profile', nameLabel: 'Your Name', namePlaceholder: 'Enter your name', bioLabel: 'Biography', bioPlaceholder: 'Write a short bio about yourself...', locationLabel: 'Location', locationPlaceholder: 'City, Country', websiteLabel: 'Website', saving: 'Saving...', save: 'Save Changes', cancel: 'Cancel', successMsg: '✅ Profile updated successfully!', errLogin: 'You must be logged in' },
  de: { title: 'Profil bearbeiten', nameLabel: 'Ihr Name', namePlaceholder: 'Geben Sie Ihren Namen ein', bioLabel: 'Biografie', bioPlaceholder: 'Schreiben Sie kurz über sich...', locationLabel: 'Standort', locationPlaceholder: 'Stadt, Land', websiteLabel: 'Website', saving: 'Speichern...', save: 'Änderungen speichern', cancel: 'Abbrechen', successMsg: '✅ Profil erfolgreich aktualisiert!', errLogin: 'Sie müssen angemeldet sein' },
  fr: { title: 'Modifier le profil', nameLabel: 'Votre nom', namePlaceholder: 'Entrez votre nom', bioLabel: 'Biographie', bioPlaceholder: 'Écrivez une courte biographie...', locationLabel: 'Emplacement', locationPlaceholder: 'Ville, Pays', websiteLabel: 'Site web', saving: 'Enregistrement...', save: 'Enregistrer les modifications', cancel: 'Annuler', successMsg: '✅ Profil mis à jour avec succès !', errLogin: 'Vous devez être connecté' },
  es: { title: 'Editar perfil', nameLabel: 'Tu nombre', namePlaceholder: 'Ingresa tu nombre', bioLabel: 'Biografía', bioPlaceholder: 'Escribe una breve bio sobre ti...', locationLabel: 'Ubicación', locationPlaceholder: 'Ciudad, País', websiteLabel: 'Sitio web', saving: 'Guardando...', save: 'Guardar cambios', cancel: 'Cancelar', successMsg: '✅ ¡Perfil actualizado con éxito!', errLogin: 'Debes estar conectado' },
  ru: { title: 'Редактировать профиль', nameLabel: 'Ваше имя', namePlaceholder: 'Введите ваше имя', bioLabel: 'Биография', bioPlaceholder: 'Напишите краткую биографию...', locationLabel: 'Местоположение', locationPlaceholder: 'Город, Страна', websiteLabel: 'Веб-сайт', saving: 'Сохранение...', save: 'Сохранить изменения', cancel: 'Отмена', successMsg: '✅ Профиль успешно обновлён!', errLogin: 'Необходимо войти в систему' },
} as const

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const locale = useCurrentLocale()
  const t = peText[locale as keyof typeof peText] ?? peText.tr

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser(profile)
        setName(profile.name || '')
        setBio(profile.bio || '')
        setLocation(profile.location || '')
        setWebsite(profile.website || '')
      }
      setLoading(false)
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error(t.errLogin)

      const { error } = await supabase
        .from('user_profiles')
        .update({
          name,
          bio,
          location,
          website
        })
        .eq('id', authUser.id)

      if (error) throw error

      alert(t.successMsg)
      router.push('/profile')
    } catch (err: any) {
      alert('Hata: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <main className="container-custom max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.bioLabel}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.bioPlaceholder}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Konum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.locationLabel}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.websiteLabel}
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Butonlar */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? t.saving : t.save}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
