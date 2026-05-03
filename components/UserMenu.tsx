'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const userMenuText = {
  tr: {
    login: 'Giriş',
    loginFull: 'Giriş Yap / Kayıt Ol',
    user: 'Kullanıcı',
    profile: 'Profilim',
    editProfile: 'Profil Düzenle',
    leaderboard: 'Sırala',
    badges: 'Rozetlerim',
    notifications: 'Bildirimler',
    messages: 'Mesajlar',
    mySpots: "Spot'larım",
    myHelps: 'Yardımlarım',
    settings: 'Ayarlar',
    logout: 'Çıkış Yap',
  },
  en: {
    login: 'Login',
    loginFull: 'Login / Sign Up',
    user: 'User',
    profile: 'My Profile',
    editProfile: 'Edit Profile',
    leaderboard: 'Leaderboard',
    badges: 'My Badges',
    notifications: 'Notifications',
    messages: 'Messages',
    mySpots: 'My Spots',
    myHelps: 'My Helps',
    settings: 'Settings',
    logout: 'Log Out',
  },
  de: {
    login: 'Anmelden',
    loginFull: 'Anmelden / Registrieren',
    user: 'Benutzer',
    profile: 'Mein Profil',
    editProfile: 'Profil bearbeiten',
    leaderboard: 'Rangliste',
    badges: 'Meine Abzeichen',
    notifications: 'Benachrichtigungen',
    messages: 'Nachrichten',
    mySpots: 'Meine Spots',
    myHelps: 'Meine Hilfen',
    settings: 'Einstellungen',
    logout: 'Abmelden',
  },
  fr: {
    login: 'Connexion',
    loginFull: 'Connexion / Inscription',
    user: 'Utilisateur',
    profile: 'Mon profil',
    editProfile: 'Modifier le profil',
    leaderboard: 'Classement',
    badges: 'Mes badges',
    notifications: 'Notifications',
    messages: 'Messages',
    mySpots: 'Mes Spots',
    myHelps: 'Mes aides',
    settings: 'Parametres',
    logout: 'Se deconnecter',
  },
  es: {
    login: 'Entrar',
    loginFull: 'Entrar / Registrarse',
    user: 'Usuario',
    profile: 'Mi perfil',
    editProfile: 'Editar perfil',
    leaderboard: 'Clasificacion',
    badges: 'Mis insignias',
    notifications: 'Notificaciones',
    messages: 'Mensajes',
    mySpots: 'Mis Spots',
    myHelps: 'Mis ayudas',
    settings: 'Configuracion',
    logout: 'Cerrar sesion',
  },
  ru: {
    login: 'Vkhod',
    loginFull: 'Vkhod / Registratsiya',
    user: 'Polzovatel',
    profile: 'Moy profil',
    editProfile: 'Redaktirovat profil',
    leaderboard: 'Reyting',
    badges: 'Moi znachki',
    notifications: 'Uvedomleniya',
    messages: 'Soobshcheniya',
    mySpots: 'Moi Spoty',
    myHelps: 'Moya pomoshch',
    settings: 'Nastroyki',
    logout: 'Vyyti',
  },
} as const

interface User {
  id: string
  email: string
  name?: string
}

export default function UserMenu() {
  const locale = useCurrentLocale()
  const t = userMenuText[locale]
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
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name,
        })
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return
      }
      console.warn('Kullanıcı bilgisi alınamadı:', err)
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-6 rounded-lg transition duration-200 text-sm sm:text-base whitespace-nowrap"
        >
          <span className="sm:hidden">{t.login}</span>
          <span className="hidden sm:inline">{t.loginFull}</span>
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
            <p className="font-medium text-sm">{user.name || t.user}</p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
          </div>
        </button>
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50">
          <div className="p-4 border-b">
            <p className="font-medium">{user.name || t.user}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
          
          <div className="p-2">
            <a
              href="/profile"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>👤</span>
              <span>{t.profile}</span>
            </a>
            <a
              href="/profile/edit"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>✏️</span>
              <span>{t.editProfile}</span>
            </a>
            <a
              href="/leaderboard"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🏆</span>
              <span>{t.leaderboard}</span>
            </a>
            <a
              href="/badges"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🎖️</span>
              <span>{t.badges}</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🔔</span>
              <span>{t.notifications}</span>
            </a>
            <a
              href="/messages"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>💬</span>
              <span>{t.messages}</span>
            </a>
            <a
              href="/my-spots"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>📝</span>
              <span>{t.mySpots}</span>
            </a>
            <a
              href="/help-given"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>🤝</span>
              <span>{t.myHelps}</span>
            </a>
            <a
              href="/settings"
              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg"
            >
              <span>⚙️</span>
              <span>{t.settings}</span>
            </a>
          </div>
          
          <div className="border-t p-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg"
            >
              <span>🚪</span>
              <span>{t.logout}</span>
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