// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const fpText = {
  tr: { title: 'Şifremi Unuttum', desc: 'Email adresinizi girerek şifre sıfırlama linki alabilirsiniz', successTitle: 'Şifre sıfırlama linki gönderildi!', successDesc: (e: string) => `${e} adresine şifre sıfırlama linkini gönderdik. Email'inizi kontrol edin.`, spamNote: '📧 Email gelmedi mi? Spam klasörünüzü kontrol edin.', emailLabel: 'Email Adresiniz *', emailHint: 'Kayıtlı olduğunuz email adresini girin', sending: 'Gönderiliyor...', submitBtn: 'Şifre Sıfırlama Linki Gönder', infoNote: '💡 Şifre sıfırlama linki 24 saat geçerlidir.', backToLogin: '← Giriş sayfasına dön', noAccount: 'Hesabınız yok mu?', register: 'Yeni hesap oluşturun', securityTitle: '🔒 Güvenlik İpuçları', tips: ['Güçlü şifreler kullanın (en az 8 karakter)', 'Farklı platformlarda aynı şifreyi kullanmayın', 'Şifre sıfırlama linkini kimseyle paylaşmayın', 'Şüpheli aktivitelerde hemen bizimle iletişime geçin'], errRateLimit: 'Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin.', errEmail: 'Geçersiz email adresi', errNotFound: 'Bu email adresiyle kayıtlı kullanıcı bulunamadı', errGeneric: 'Bir hata oluştu' },
  en: { title: 'Forgot Password', desc: 'Enter your email to receive a password reset link', successTitle: 'Password reset link sent!', successDesc: (e: string) => `We sent a password reset link to ${e}. Check your email and click the link.`, spamNote: '📧 Didn\'t receive it? Check your spam folder.', emailLabel: 'Your Email *', emailHint: 'Enter the email you registered with', sending: 'Sending...', submitBtn: 'Send Password Reset Link', infoNote: '💡 The password reset link is valid for 24 hours.', backToLogin: '← Back to login', noAccount: 'Don\'t have an account?', register: 'Create a new account', securityTitle: '🔒 Security Tips', tips: ['Use strong passwords (at least 8 characters)', 'Don\'t use the same password on different platforms', 'Don\'t share your password reset link with anyone', 'Contact us immediately for suspicious activity'], errRateLimit: 'Too many attempts. Please try again later.', errEmail: 'Invalid email address', errNotFound: 'No user found with this email address', errGeneric: 'An error occurred' },
  de: { title: 'Passwort vergessen', desc: 'Geben Sie Ihre E-Mail ein, um einen Passwort-Reset-Link zu erhalten', successTitle: 'Passwort-Reset-Link gesendet!', successDesc: (e: string) => `Wir haben einen Link an ${e} gesendet. Überprüfen Sie Ihre E-Mails.`, spamNote: '📧 Nicht erhalten? Überprüfen Sie Ihren Spam-Ordner.', emailLabel: 'Ihre E-Mail *', emailHint: 'Geben Sie Ihre registrierte E-Mail ein', sending: 'Wird gesendet...', submitBtn: 'Passwort-Reset-Link senden', infoNote: '💡 Der Passwort-Reset-Link ist 24 Stunden gültig.', backToLogin: '← Zurück zur Anmeldung', noAccount: 'Kein Konto?', register: 'Neues Konto erstellen', securityTitle: '🔒 Sicherheitstipps', tips: ['Verwenden Sie starke Passwörter', 'Verwenden Sie auf verschiedenen Plattformen nicht dasselbe Passwort', 'Teilen Sie Ihren Reset-Link mit niemandem', 'Kontaktieren Sie uns sofort bei verdächtigen Aktivitäten'], errRateLimit: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.', errEmail: 'Ungültige E-Mail-Adresse', errNotFound: 'Kein Benutzer mit dieser E-Mail-Adresse gefunden', errGeneric: 'Ein Fehler ist aufgetreten' },
  fr: { title: 'Mot de passe oublié', desc: 'Entrez votre e-mail pour recevoir un lien de réinitialisation', successTitle: 'Lien de réinitialisation envoyé !', successDesc: (e: string) => `Nous avons envoyé un lien à ${e}. Vérifiez vos e-mails.`, spamNote: '📧 Pas reçu ? Vérifiez votre dossier spam.', emailLabel: 'Votre e-mail *', emailHint: 'Entrez l\'e-mail avec lequel vous vous êtes inscrit', sending: 'Envoi en cours...', submitBtn: 'Envoyer le lien de réinitialisation', infoNote: '💡 Le lien est valable 24 heures.', backToLogin: '← Retour à la connexion', noAccount: 'Pas de compte ?', register: 'Créer un nouveau compte', securityTitle: '🔒 Conseils de sécurité', tips: ['Utilisez des mots de passe forts', 'N\'utilisez pas le même mot de passe sur différentes plateformes', 'Ne partagez pas votre lien de réinitialisation', 'Contactez-nous immédiatement pour toute activité suspecte'], errRateLimit: 'Trop de tentatives. Réessayez plus tard.', errEmail: 'Adresse e-mail invalide', errNotFound: 'Aucun utilisateur trouvé avec cet e-mail', errGeneric: 'Une erreur s\'est produite' },
  es: { title: 'Contraseña olvidada', desc: 'Ingresa tu correo para recibir un enlace de restablecimiento', successTitle: '¡Enlace de restablecimiento enviado!', successDesc: (e: string) => `Enviamos un enlace a ${e}. Revisa tu correo.`, spamNote: '📧 ¿No lo recibiste? Revisa tu carpeta de spam.', emailLabel: 'Tu correo electrónico *', emailHint: 'Ingresa el correo con el que te registraste', sending: 'Enviando...', submitBtn: 'Enviar enlace de restablecimiento', infoNote: '💡 El enlace es válido por 24 horas.', backToLogin: '← Volver al inicio de sesión', noAccount: '¿No tienes cuenta?', register: 'Crear nueva cuenta', securityTitle: '🔒 Consejos de seguridad', tips: ['Usa contraseñas fuertes', 'No uses la misma contraseña en diferentes plataformas', 'No compartas tu enlace de restablecimiento', 'Contáctanos inmediatamente ante actividad sospechosa'], errRateLimit: 'Demasiados intentos. Inténtalo más tarde.', errEmail: 'Dirección de correo inválida', errNotFound: 'No se encontró usuario con este correo', errGeneric: 'Ocurrió un error' },
  ru: { title: 'Забыли пароль', desc: 'Введите ваш email для получения ссылки сброса пароля', successTitle: 'Ссылка для сброса пароля отправлена!', successDesc: (e: string) => `Мы отправили ссылку на ${e}. Проверьте вашу почту.`, spamNote: '📧 Не получили? Проверьте папку со спамом.', emailLabel: 'Ваш email *', emailHint: 'Введите email, с которым вы зарегистрировались', sending: 'Отправка...', submitBtn: 'Отправить ссылку для сброса', infoNote: '💡 Ссылка действительна 24 часа.', backToLogin: '← Вернуться к входу', noAccount: 'Нет аккаунта?', register: 'Создать новый аккаунт', securityTitle: '🔒 Советы по безопасности', tips: ['Используйте надёжные пароли', 'Не используйте один пароль на разных платформах', 'Не делитесь ссылкой для сброса пароля', 'Немедленно свяжитесь с нами при подозрительной активности'], errRateLimit: 'Слишком много попыток. Повторите позже.', errEmail: 'Неверный адрес email', errNotFound: 'Пользователь с этим email не найден', errGeneric: 'Произошла ошибка' },
} as const

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const locale = useCurrentLocale()
  const t = fpText[locale as keyof typeof fpText] ?? fpText.tr

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // API'ye şifre sıfırlama isteği gönder (Supabase emailini bypass ediyoruz)
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Bir hata oluştu')
      }

      setSuccess(true)
      
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err)
      
      let errorMessage = err.message || t.errGeneric
      
      if (errorMessage.includes('rate limit')) {
        errorMessage = t.errRateLimit
      } else if (errorMessage.includes('email')) {
        errorMessage = t.errEmail
      } else if (errorMessage.includes('User not found')) {
        errorMessage = t.errNotFound
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Başlık */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.title}
              </h1>
              <p className="text-gray-600">
                {t.desc}
              </p>
            </div>

            {/* Başarı Mesajı */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3">✅</span>
                  <div>
                    <p className="font-medium">{t.successTitle}</p>
                    <p className="text-sm mt-1">{t.successDesc(email)}</p>
                    <p className="text-xs mt-2 text-green-600">{t.spamNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-3">❌</span>
                  <div>
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ornek@email.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-gray-500 text-xs mt-2">{t.emailHint}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t.sending}
                    </>
                  ) : (
                    t.submitBtn
                  )}
                </button>
              </form>
            )}

            {/* Ek Bilgiler */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">{t.infoNote}</span>
                  </p>
                </div>

                <div className="text-center">
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    {t.backToLogin}
                  </Link>
                </div>

                <div className="text-center text-sm text-gray-500">
                  {t.noAccount}{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                    {t.register}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Güvenlik İpuçları */}
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-2">{t.securityTitle}</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              {t.tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}