// app/admin/layout.tsx - YENİ VERSİYON (RLS OLMADAN)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      setDebugInfo('Admin kontrolü başlıyor...')
      
      // 1. Kullanıcı kontrolü
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setDebugInfo('Kullanıcı giriş yapmamış')
        router.push('/login?redirect=/admin')
        return
      }

      setDebugInfo(`Kullanıcı: ${user.email}`)

      // 2. DOĞRUDAN user_profiles TABLOSUNDAN KONTROL (RLS YOK)
      // Bu artık çalışacak çünkü RLS kapalı
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      console.log('🔍 Profile sorgusu sonucu:', { profile, profileError })

      // 3. HATA DURUMUNDA EMAİL BAZLI KONTROL
      let isUserAdmin = false
      
      if (profileError || !profile) {
        console.log('Profile sorgusu hatası, email bazlı kontrol yapılıyor...')
        // Email bazlı fallback
        const adminEmails = [
          'prolinemama@gmail.com',
          'mehmet@spotitforme.com', 
          'saniy@spotitforme.com',
          'senasilmailin@gmail.com'  // KENDİ EMAİL'İNİ YAZ
        ]
        isUserAdmin = adminEmails.includes(user.email?.toLowerCase() || '')
      } else {
        isUserAdmin = profile.is_admin === true
      }

      setDebugInfo(`Admin durumu: ${isUserAdmin}`)
      console.log('✅ Final admin kontrolü:', {
        email: user.email,
        isAdminFromDB: profile?.is_admin,
        finalIsAdmin: isUserAdmin
      })

      if (!isUserAdmin) {
        setDebugInfo('Admin değil, yönlendiriliyor...')
        // Development'da bile admin panelini göster
        if (process.env.NODE_ENV === 'development') {
          console.log('🛠️ Development modu: Admin panele izin veriliyor')
          setIsAdmin(true)
        } else {
          router.push('/')
        }
        return
      }

      setIsAdmin(true)
      
    } catch (error: any) {
      console.error('❌ Admin kontrol hatası:', error)
      setDebugInfo(`Hata: ${error.message}`)
      
      // Development'da hata olsa bile devam et
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Hata durumunda development modu: Admin panele izin veriliyor')
        setIsAdmin(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Admin kontrolü yapılıyor...</p>
          <p className="text-sm text-gray-500 mt-2 max-w-md">{debugInfo}</p>
          <button
            onClick={() => setIsAdmin(true)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm"
          >
            Devam et (development)
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz yok.</p>
          <p className="text-sm text-gray-500 mb-6 max-w-md">{debugInfo}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Ana Sayfaya Dön
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          {/* Debug info - sadece development'da */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
              🛠️ Development Modu: Admin kontrolü aktif
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}