'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import { useNotificationCount } from '@/hooks/useNotificationCount'

interface User {
  id: string
  email: string
  name?: string
}

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const unreadCount = useNotificationCount()

  useEffect(() => {
    // Mevcut kullanıcıyı kontrol et
    checkUser()
    
    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
      })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowDropdown(false)
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
        >
          Giriş Yap / Kayıt Ol
        </button>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Notification Bell */}
        <a
          href="/notifications"
          className="relative p-2 text-gray-700 hover:text-blue-600 transition"
          title="Bildirimler"
        >
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </a>

        {/* User Menu */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-4 py-2 transition duration-200"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div className="text-left hidden md:block">
            <p className="font-medium text-sm">{user.name || 'Kullanıcı'}</p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
          </div>
        </button>
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50">
          <div className="p-4 border-b">
            <p className="font-medium">{user.name || 'Kullanıcı'}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          
          <div className="p-2">
            <a
              href="/profile"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>👤</span>
              <span>Profilim</span>
            </a>
            <a
              href="/profile/edit"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>✏️</span>
              <span>Profil Düzenle</span>
            </a>
            <a
              href="/leaderboard"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🏆</span>
              <span>Sırala</span>
            </a>
            <a
              href="/badges"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🎖️</span>
              <span>Rozetlerim</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🔔</span>
              <span>Bildirimler</span>
            </a>
            <a
              href="/my-spots"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>📝</span>
              <span>Spot'larım</span>
            </a>
            <a
              href="/help-given"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🤝</span>
              <span>Yardımlarım</span>
            </a>
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>⚙️</span>
              <span>Ayarlar</span>
            </a>
          </div>
          
          <div className="border-t p-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg"
            >
              <span>🚪</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {/* Dropdown dışına tıklayınca kapat */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}