// components/AuthModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialMode?: 'login' | 'register'
}

const t = {
  tr: {
    login: 'Giriş Yap', register: 'Hesap Oluştur',
    loginDesc: 'Spot oluşturmak ve yardım etmek için giriş yapın',
    registerDesc: 'Topluluğumuza katılın, kayıp ürünleri birlikte bulalım',
    name: 'Ad Soyad', namePlaceholder: 'Ahmet Yılmaz',
    email: 'E-posta', emailPlaceholder: 'ornek@email.com',
    password: 'Şifre', passwordHint: 'En az 8 karakter',
    passwordConfirm: 'Şifre Tekrar',
    passwordMismatch: 'Şifreler eşleşmiyor',
    passwordTooShort: 'Şifre en az 8 karakter olmalıdır',
    forgotPassword: 'Şifremi Unuttum?',
    processing: 'İşleniyor...',
    hasAccount: 'Zaten hesabınız var mı?', noAccount: 'Hesabınız yok mu?',
    doLogin: 'Giriş Yapın', doRegister: 'Kayıt Olun',
    emailSentTitle: 'E-postanızı Onaylayın',
    emailSentDesc: (email: string) => `${email} adresine bir onay e-postası gönderdik. Hesabınızı aktifleştirmek için e-postadaki bağlantıya tıklayın.`,
    emailSentSpam: 'Spam/gereksiz klasörünüzü de kontrol edin.',
    loginSuccess: 'Başarıyla giriş yapıldı!',
    errors: {
      invalidCredentials: 'Geçersiz e-posta veya şifre',
      emailNotConfirmed: 'E-posta adresiniz henüz onaylanmamış. Gelen kutunuzu kontrol edin.',
      alreadyRegistered: 'Bu e-posta zaten kayıtlı. Giriş yapın veya şifrenizi sıfırlayın.',
      invalidEmail: 'Geçersiz e-posta adresi',
      rateLimit: 'Çok fazla deneme yapıldı. Lütfen bir süre bekleyin.',
      generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    },
  },
  en: {
    login: 'Sign In', register: 'Create Account',
    loginDesc: 'Sign in to create spots and help others',
    registerDesc: 'Join our community and help find lost items together',
    name: 'Full Name', namePlaceholder: 'John Smith',
    email: 'Email', emailPlaceholder: 'example@email.com',
    password: 'Password', passwordHint: 'At least 8 characters',
    passwordConfirm: 'Confirm Password',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    forgotPassword: 'Forgot Password?',
    processing: 'Processing...',
    hasAccount: 'Already have an account?', noAccount: "Don't have an account?",
    doLogin: 'Sign In', doRegister: 'Register',
    emailSentTitle: 'Check Your Email',
    emailSentDesc: (email: string) => `We sent a confirmation link to ${email}. Click the link to activate your account.`,
    emailSentSpam: 'Also check your spam/junk folder.',
    loginSuccess: 'Signed in successfully!',
    errors: {
      invalidCredentials: 'Invalid email or password',
      emailNotConfirmed: 'Email not confirmed yet. Check your inbox.',
      alreadyRegistered: 'This email is already registered. Sign in or reset your password.',
      invalidEmail: 'Invalid email address',
      rateLimit: 'Too many attempts. Please wait a moment.',
      generic: 'An error occurred. Please try again.',
    },
  },
  de: {
    login: 'Anmelden', register: 'Konto erstellen',
    loginDesc: 'Melden Sie sich an, um Spots zu erstellen und zu helfen',
    registerDesc: 'Treten Sie unserer Gemeinschaft bei',
    name: 'Vollständiger Name', namePlaceholder: 'Max Mustermann',
    email: 'E-Mail', emailPlaceholder: 'beispiel@email.com',
    password: 'Passwort', passwordHint: 'Mindestens 8 Zeichen',
    passwordConfirm: 'Passwort bestätigen',
    passwordMismatch: 'Passwörter stimmen nicht überein',
    passwordTooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
    forgotPassword: 'Passwort vergessen?',
    processing: 'Verarbeitung...',
    hasAccount: 'Bereits ein Konto?', noAccount: 'Noch kein Konto?',
    doLogin: 'Anmelden', doRegister: 'Registrieren',
    emailSentTitle: 'E-Mail bestätigen',
    emailSentDesc: (email: string) => `Wir haben einen Bestätigungslink an ${email} gesendet.`,
    emailSentSpam: 'Überprüfen Sie auch Ihren Spam-Ordner.',
    loginSuccess: 'Erfolgreich angemeldet!',
    errors: {
      invalidCredentials: 'Ungültige E-Mail oder Passwort',
      emailNotConfirmed: 'E-Mail noch nicht bestätigt. Prüfen Sie Ihren Posteingang.',
      alreadyRegistered: 'Diese E-Mail ist bereits registriert.',
      invalidEmail: 'Ungültige E-Mail-Adresse',
      rateLimit: 'Zu viele Versuche. Bitte warten Sie.',
      generic: 'Ein Fehler ist aufgetreten.',
    },
  },
  fr: {
    login: 'Se connecter', register: 'Créer un compte',
    loginDesc: 'Connectez-vous pour créer des spots et aider',
    registerDesc: 'Rejoignez notre communauté',
    name: 'Nom complet', namePlaceholder: 'Jean Dupont',
    email: 'E-mail', emailPlaceholder: 'exemple@email.com',
    password: 'Mot de passe', passwordHint: 'Au moins 8 caractères',
    passwordConfirm: 'Confirmer le mot de passe',
    passwordMismatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    forgotPassword: 'Mot de passe oublié ?',
    processing: 'Traitement...',
    hasAccount: 'Déjà un compte ?', noAccount: 'Pas encore de compte ?',
    doLogin: 'Se connecter', doRegister: "S'inscrire",
    emailSentTitle: 'Vérifiez votre e-mail',
    emailSentDesc: (email: string) => `Nous avons envoyé un lien de confirmation à ${email}.`,
    emailSentSpam: 'Vérifiez également votre dossier spam.',
    loginSuccess: 'Connexion réussie !',
    errors: {
      invalidCredentials: 'E-mail ou mot de passe invalide',
      emailNotConfirmed: 'E-mail non confirmé. Vérifiez votre boîte de réception.',
      alreadyRegistered: 'Cet e-mail est déjà enregistré.',
      invalidEmail: 'Adresse e-mail invalide',
      rateLimit: 'Trop de tentatives. Veuillez patienter.',
      generic: 'Une erreur est survenue.',
    },
  },
  es: {
    login: 'Iniciar sesión', register: 'Crear cuenta',
    loginDesc: 'Inicia sesión para crear spots y ayudar',
    registerDesc: 'Únete a nuestra comunidad',
    name: 'Nombre completo', namePlaceholder: 'Juan García',
    email: 'Correo electrónico', emailPlaceholder: 'ejemplo@email.com',
    password: 'Contraseña', passwordHint: 'Mínimo 8 caracteres',
    passwordConfirm: 'Confirmar contraseña',
    passwordMismatch: 'Las contraseñas no coinciden',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
    forgotPassword: '¿Olvidé mi contraseña?',
    processing: 'Procesando...',
    hasAccount: '¿Ya tienes cuenta?', noAccount: '¿No tienes cuenta?',
    doLogin: 'Iniciar sesión', doRegister: 'Registrarse',
    emailSentTitle: 'Revisa tu correo',
    emailSentDesc: (email: string) => `Enviamos un enlace de confirmación a ${email}.`,
    emailSentSpam: 'Revisa también tu carpeta de spam.',
    loginSuccess: '¡Sesión iniciada con éxito!',
    errors: {
      invalidCredentials: 'Correo o contraseña inválidos',
      emailNotConfirmed: 'Correo no confirmado. Revisa tu bandeja.',
      alreadyRegistered: 'Este correo ya está registrado.',
      invalidEmail: 'Dirección de correo inválida',
      rateLimit: 'Demasiados intentos. Espera un momento.',
      generic: 'Ocurrió un error. Inténtalo de nuevo.',
    },
  },
  ru: {
    login: 'Войти', register: 'Создать аккаунт',
    loginDesc: 'Войдите, чтобы создавать споты и помогать другим',
    registerDesc: 'Присоединяйтесь к нашему сообществу',
    name: 'Полное имя', namePlaceholder: 'Иван Иванов',
    email: 'Эл. почта', emailPlaceholder: 'primer@email.com',
    password: 'Пароль', passwordHint: 'Не менее 8 символов',
    passwordConfirm: 'Подтвердите пароль',
    passwordMismatch: 'Пароли не совпадают',
    passwordTooShort: 'Пароль должен содержать не менее 8 символов',
    forgotPassword: 'Забыли пароль?',
    processing: 'Обработка...',
    hasAccount: 'Уже есть аккаунт?', noAccount: 'Нет аккаунта?',
    doLogin: 'Войти', doRegister: 'Зарегистрироваться',
    emailSentTitle: 'Проверьте почту',
    emailSentDesc: (email: string) => `Мы отправили ссылку подтверждения на ${email}.`,
    emailSentSpam: 'Также проверьте папку «Спам».',
    loginSuccess: 'Вы успешно вошли!',
    errors: {
      invalidCredentials: 'Неверный адрес почты или пароль',
      emailNotConfirmed: 'Почта не подтверждена. Проверьте входящие.',
      alreadyRegistered: 'Этот адрес уже зарегистрирован.',
      invalidEmail: 'Неверный адрес электронной почты',
      rateLimit: 'Слишком много попыток. Подождите немного.',
      generic: 'Произошла ошибка. Попробуйте ещё раз.',
    },
  },
} as const

type LocaleKey = keyof typeof t

function mapError(msg: string, loc: LocaleKey): string {
  const e = t[loc].errors
  if (msg.includes('Invalid login credentials')) return e.invalidCredentials
  if (msg.includes('Email not confirmed')) return e.emailNotConfirmed
  if (msg.includes('User already registered') || msg.includes('already registered')) return e.alreadyRegistered
  if (msg.includes('Invalid email')) return e.invalidEmail
  if (msg.includes('rate limit') || msg.includes('too many')) return e.rateLimit
  return e.generic
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const locale = (useCurrentLocale() as LocaleKey) in t ? (useCurrentLocale() as LocaleKey) : 'tr'
  const tx = t[locale]

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [step, setStep] = useState<'form' | 'email-sent'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setMode(initialMode)
    setStep('form')
    setError('')
  }, [initialMode, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'register') {
      if (password.length < 8) { setError(tx.passwordTooShort); return }
      if (password !== passwordConfirm) { setError(tx.passwordMismatch); return }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        setTimeout(() => {
          handleClose()
          if (onSuccess) onSuccess()
          else window.location.reload()
        }, 300)
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (signUpError) throw signUpError
        setStep('email-sent')
      }
    } catch (err: any) {
      const msg: string = err?.message || ''
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setMode('login')
        setPassword('')
        setPasswordConfirm('')
        setName('')
      }
      setError(mapError(msg, locale))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
    setName('')
    setError('')
    setStep('form')
    onClose()
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
    setPassword('')
    setPasswordConfirm('')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'email-sent' ? tx.emailSentTitle : mode === 'login' ? tx.login : tx.register}
            </h2>
            {step === 'form' && (
              <p className="text-sm text-gray-500 mt-0.5">
                {mode === 'login' ? tx.loginDesc : tx.registerDesc}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-4 flex-shrink-0"
            disabled={loading}
            aria-label="Kapat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email Sent Step */}
        {step === 'email-sent' ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{tx.emailSentDesc(email)}</p>
            <p className="text-xs text-gray-400">{tx.emailSentSpam}</p>
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              OK
            </button>
          </div>
        ) : (

        /* Form Step */
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder={tx.namePlaceholder}
                required
                disabled={loading}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tx.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              placeholder={tx.emailPlaceholder}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{tx.password}</label>
              {mode === 'login' && (
                <a
                  href="/forgot-password"
                  onClick={(e) => { e.preventDefault(); handleClose(); window.location.href = '/forgot-password' }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {tx.forgotPassword}
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="••••••••"
                minLength={mode === 'register' ? 8 : 6}
                required
                disabled={loading}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-xs text-gray-400 mt-1">{tx.passwordHint}</p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tx.passwordConfirm}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tx.processing}
              </>
            ) : (
              mode === 'login' ? tx.login : tx.register
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? tx.noAccount : tx.hasAccount}
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium ml-1.5 disabled:opacity-50"
            >
              {mode === 'login' ? tx.doRegister : tx.doLogin}
            </button>
          </p>
        </form>
        )}
      </div>
    </div>
  )
}


