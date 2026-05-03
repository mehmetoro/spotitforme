'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const settingsText = {
  tr: { title: '⚙️ Ayarlar', subtitle: 'Hesap ve gizlilik ayarlarını yönetin', saved: '✅ Ayarlarınız kaydedildi', notifTitle: '🔔 Bildirim Ayarları', email: 'E-posta Bildirimleri', emailDesc: 'Beğeni, yorum ve önemli güncelleme e-postaları', push: 'Push Bildirimleri', pushDesc: 'Tarayıcı push bildirimleri', newsletter: 'Bültene Abone Ol', newsletterDesc: 'Haftalık haberler ve ipuçları', privTitle: '🔒 Gizlilik Ayarları', publicProfile: 'Genel Profil', publicProfileDesc: 'Diğer kullanıcılar seni bulabilir', showActivity: 'Aktiviteyi Göster', showActivityDesc: 'Paylaşımlarını ve aktiviteni herkese göster', allowMessages: 'Mesaj Al', allowMessagesDesc: 'Diğer kullanıcılardan özel mesaj al', secTitle: '🔐 Güvenlik Ayarları', changePassword: '🔑 Şifreyi Değiştir', passwordHint: 'Hesabını korumak için düzenli olarak şifreni değiştir.', dangerTitle: '⚠️ Tehlikeli İşlemler', deleteAccount: '🗑️ Hesabı Sil', deleteHint: 'Hesabın kalıcı olarak silinecek. Verilerin kurtarılamayacak.', saveBtn: '✅ Ayarları Kaydet', pwdPrompt: 'Lütfen yeni şifreni gir (en az 8 karakter):', pwdShort: 'Şifre en az 8 karakter olmalıdır', pwdSuccess: '✅ Şifreni başarıyla değiştirdim', confirmDelete: 'Hesabını silmek istediğine emin misin? Bu işlem geri alınamaz.', deleteContact: 'Hesap silme işlemi için destek ekibine başvur' },
  en: { title: '⚙️ Settings', subtitle: 'Manage your account and privacy settings', saved: '✅ Settings saved', notifTitle: '🔔 Notification Settings', email: 'Email Notifications', emailDesc: 'Like, comment and important update emails', push: 'Push Notifications', pushDesc: 'Browser push notifications', newsletter: 'Subscribe to Newsletter', newsletterDesc: 'Weekly news and tips', privTitle: '🔒 Privacy Settings', publicProfile: 'Public Profile', publicProfileDesc: 'Other users can find you', showActivity: 'Show Activity', showActivityDesc: 'Show your posts and activity to everyone', allowMessages: 'Receive Messages', allowMessagesDesc: 'Receive private messages from other users', secTitle: '🔐 Security Settings', changePassword: '🔑 Change Password', passwordHint: 'Change your password regularly to keep your account safe.', dangerTitle: '⚠️ Danger Zone', deleteAccount: '🗑️ Delete Account', deleteHint: 'Your account will be permanently deleted. Data cannot be recovered.', saveBtn: '✅ Save Settings', pwdPrompt: 'Enter your new password (at least 8 characters):', pwdShort: 'Password must be at least 8 characters', pwdSuccess: '✅ Password changed successfully', confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.', deleteContact: 'Contact support to delete your account' },
  de: { title: '⚙️ Einstellungen', subtitle: 'Konto- und Datenschutzeinstellungen verwalten', saved: '✅ Einstellungen gespeichert', notifTitle: '🔔 Benachrichtigungseinstellungen', email: 'E-Mail-Benachrichtigungen', emailDesc: 'Like-, Kommentar- und wichtige Update-E-Mails', push: 'Push-Benachrichtigungen', pushDesc: 'Browser-Push-Benachrichtigungen', newsletter: 'Newsletter abonnieren', newsletterDesc: 'Wöchentliche News und Tipps', privTitle: '🔒 Datenschutzeinstellungen', publicProfile: 'Öffentliches Profil', publicProfileDesc: 'Andere Benutzer können dich finden', showActivity: 'Aktivität anzeigen', showActivityDesc: 'Zeige deine Beiträge und Aktivitäten jedem', allowMessages: 'Nachrichten empfangen', allowMessagesDesc: 'Private Nachrichten von anderen Benutzern empfangen', secTitle: '🔐 Sicherheitseinstellungen', changePassword: '🔑 Passwort ändern', passwordHint: 'Ändere dein Passwort regelmäßig für mehr Sicherheit.', dangerTitle: '⚠️ Gefahrenzone', deleteAccount: '🗑️ Konto löschen', deleteHint: 'Dein Konto wird dauerhaft gelöscht. Daten können nicht wiederhergestellt werden.', saveBtn: '✅ Einstellungen speichern', pwdPrompt: 'Bitte neues Passwort eingeben (min. 8 Zeichen):', pwdShort: 'Passwort muss mindestens 8 Zeichen lang sein', pwdSuccess: '✅ Passwort erfolgreich geändert', confirmDelete: 'Bist du sicher, dass du dein Konto löschen möchtest?', deleteContact: 'Wende dich an den Support, um dein Konto zu löschen' },
  fr: { title: '⚙️ Paramètres', subtitle: 'Gérez vos paramètres de compte et de confidentialité', saved: '✅ Paramètres enregistrés', notifTitle: '🔔 Paramètres de notification', email: 'Notifications par e-mail', emailDesc: 'E-mails de likes, commentaires et mises à jour', push: 'Notifications push', pushDesc: 'Notifications push du navigateur', newsletter: 'S\'abonner à la newsletter', newsletterDesc: 'Actualités et conseils hebdomadaires', privTitle: '🔒 Paramètres de confidentialité', publicProfile: 'Profil public', publicProfileDesc: 'Les autres utilisateurs peuvent vous trouver', showActivity: 'Afficher l\'activité', showActivityDesc: 'Montrez vos publications à tout le monde', allowMessages: 'Recevoir des messages', allowMessagesDesc: 'Recevez des messages privés d\'autres utilisateurs', secTitle: '🔐 Paramètres de sécurité', changePassword: '🔑 Changer de mot de passe', passwordHint: 'Changez régulièrement votre mot de passe pour la sécurité.', dangerTitle: '⚠️ Zone dangereuse', deleteAccount: '🗑️ Supprimer le compte', deleteHint: 'Votre compte sera définitivement supprimé. Les données ne pourront pas être récupérées.', saveBtn: '✅ Enregistrer les paramètres', pwdPrompt: 'Entrez votre nouveau mot de passe (au moins 8 caractères) :', pwdShort: 'Le mot de passe doit comporter au moins 8 caractères', pwdSuccess: '✅ Mot de passe changé avec succès', confirmDelete: 'Êtes-vous sûr de vouloir supprimer votre compte ?', deleteContact: 'Contactez le support pour supprimer votre compte' },
  es: { title: '⚙️ Configuración', subtitle: 'Administra tu cuenta y configuración de privacidad', saved: '✅ Configuración guardada', notifTitle: '🔔 Configuración de notificaciones', email: 'Notificaciones por correo', emailDesc: 'Correos de likes, comentarios y actualizaciones', push: 'Notificaciones push', pushDesc: 'Notificaciones push del navegador', newsletter: 'Suscribirse al boletín', newsletterDesc: 'Noticias y consejos semanales', privTitle: '🔒 Configuración de privacidad', publicProfile: 'Perfil público', publicProfileDesc: 'Otros usuarios pueden encontrarte', showActivity: 'Mostrar actividad', showActivityDesc: 'Muestra tus publicaciones a todos', allowMessages: 'Recibir mensajes', allowMessagesDesc: 'Recibe mensajes privados de otros usuarios', secTitle: '🔐 Configuración de seguridad', changePassword: '🔑 Cambiar contraseña', passwordHint: 'Cambia tu contraseña regularmente para mayor seguridad.', dangerTitle: '⚠️ Zona de peligro', deleteAccount: '🗑️ Eliminar cuenta', deleteHint: 'Tu cuenta se eliminará permanentemente. Los datos no se pueden recuperar.', saveBtn: '✅ Guardar configuración', pwdPrompt: 'Ingresa tu nueva contraseña (mínimo 8 caracteres):', pwdShort: 'La contraseña debe tener al menos 8 caracteres', pwdSuccess: '✅ Contraseña cambiada exitosamente', confirmDelete: '¿Estás seguro de que quieres eliminar tu cuenta?', deleteContact: 'Contacta al soporte para eliminar tu cuenta' },
  ru: { title: '⚙️ Настройки', subtitle: 'Управляйте настройками аккаунта и конфиденциальности', saved: '✅ Настройки сохранены', notifTitle: '🔔 Настройки уведомлений', email: 'Уведомления по электронной почте', emailDesc: 'Письма о лайках, комментариях и важных обновлениях', push: 'Push-уведомления', pushDesc: 'Браузерные push-уведомления', newsletter: 'Подписаться на рассылку', newsletterDesc: 'Еженедельные новости и советы', privTitle: '🔒 Настройки конфиденциальности', publicProfile: 'Публичный профиль', publicProfileDesc: 'Другие пользователи смогут найти вас', showActivity: 'Показывать активность', showActivityDesc: 'Показывать ваши публикации всем', allowMessages: 'Получать сообщения', allowMessagesDesc: 'Получать личные сообщения от других пользователей', secTitle: '🔐 Настройки безопасности', changePassword: '🔑 Изменить пароль', passwordHint: 'Регулярно меняйте пароль для безопасности.', dangerTitle: '⚠️ Опасная зона', deleteAccount: '🗑️ Удалить аккаунт', deleteHint: 'Ваш аккаунт будет удалён навсегда. Данные не могут быть восстановлены.', saveBtn: '✅ Сохранить настройки', pwdPrompt: 'Введите новый пароль (не менее 8 символов):', pwdShort: 'Пароль должен содержать не менее 8 символов', pwdSuccess: '✅ Пароль успешно изменён', confirmDelete: 'Вы уверены, что хотите удалить аккаунт?', deleteContact: 'Обратитесь в поддержку для удаления аккаунта' },
} as const

interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  publicProfile: boolean
  showActivity: boolean
  allowMessages: boolean
  newsletter: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const locale = useCurrentLocale()
  const t = settingsText[locale as keyof typeof settingsText] ?? settingsText.tr
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showActivity: true,
    allowMessages: true,
    newsletter: true
  })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/')
      return
    }

    setUser(authUser)
    loadSettings(authUser.id)
  }

  const loadSettings = async (userId: string) => {
    try {
      // User metadata'sından ayarları kontrol et
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        setSettings(prev => ({
          ...prev,
          ...user.user_metadata.settings
        }))
      }
    } catch (error) {
      console.error('Ayarlar ylenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const handleSaveSettings = async () => {
    try {
      if (!user) return

      // Ayarları user metadata'sına kaydet
      const { error } = await supabase.auth.updateUser({
        data: {
          settings
        }
      })

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Ayarlar kaydedilemedi:', error)
    }
  }

  const handleChangePassword = async () => {
    const newPassword = prompt(t.pwdPrompt)
    if (!newPassword || newPassword.length < 8) {
      alert(t.pwdShort)
      return
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          newPassword 
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || t.pwdShort)
      }

      alert(t.pwdSuccess)
    } catch (error: any) {
      console.error('Şifre değişikliği hatası:', error)
      alert(`❌ ${error.message}`)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm(t.confirmDelete)) {
      return
    }

    try {
      alert(t.deleteContact)
    } catch (error) {
      console.error('Hesap silme hatası:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 mt-2">{t.subtitle}</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {t.saved}
        </div>
      )}

      {/* Bildirim Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.notifTitle}</h2>

        <div className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.email}</p>
              <p className="text-sm text-gray-600">{t.emailDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.push}</p>
              <p className="text-sm text-gray-600">{t.pushDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Newsletter */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.newsletter}</p>
              <p className="text-sm text-gray-600">{t.newsletterDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newsletter}
                onChange={() => handleToggle('newsletter')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Gizlilik Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.privTitle}</h2>

        <div className="space-y-4">
          {/* Public Profile */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.publicProfile}</p>
              <p className="text-sm text-gray-600">{t.publicProfileDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.publicProfile}
                onChange={() => handleToggle('publicProfile')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Activity */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.showActivity}</p>
              <p className="text-sm text-gray-600">{t.showActivityDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showActivity}
                onChange={() => handleToggle('showActivity')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Allow Messages */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{t.allowMessages}</p>
              <p className="text-sm text-gray-600">{t.allowMessagesDesc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowMessages}
                onChange={() => handleToggle('allowMessages')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Güvenlik Ayarları */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t.secTitle}</h2>

        <div className="space-y-3">
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            {t.changePassword}
          </button>
          <p className="text-sm text-gray-600">
            {t.passwordHint}
          </p>
        </div>
      </div>

      {/* Tehlikeli İşlemler */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-red-900 mb-6">{t.dangerTitle}</h2>

        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          {t.deleteAccount}
        </button>
        <p className="text-sm text-red-700 mt-3">
          {t.deleteHint}
        </p>
      </div>

      {/* Kaydet Butonu */}
      <button
        onClick={handleSaveSettings}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition"
      >
        {t.saveBtn}
      </button>
    </div>
  )
}
