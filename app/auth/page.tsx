'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const authPageText = {
  tr: { title: 'Hesap İşlemleri', desc: 'Spot paylaşımı, yardım verme ve mağaza yönetimi için giriş yapabilir veya yeni hesap oluşturabilirsiniz.' },
  en: { title: 'Account', desc: 'Sign in or create a new account to share spots, help others, and manage your shop.' },
  de: { title: 'Konto', desc: 'Melden Sie sich an oder erstellen Sie ein neues Konto, um Spots zu teilen und Ihren Shop zu verwalten.' },
  fr: { title: 'Compte', desc: 'Connectez-vous ou créez un nouveau compte pour partager des spots et gérer votre boutique.' },
  es: { title: 'Cuenta', desc: 'Inicia sesión o crea una cuenta nueva para compartir spots y gestionar tu tienda.' },
  ru: { title: 'Аккаунт', desc: 'Войдите или создайте новый аккаунт для обмена спотами и управления магазином.' },
} as const

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modeParam = searchParams.get('mode')
  const redirectParam = searchParams.get('redirect')
  const locale = useCurrentLocale()
  const t = authPageText[locale as keyof typeof authPageText] ?? authPageText.tr

  const mode = useMemo(() => (modeParam === 'register' ? 'register' : 'login'), [modeParam])
  const redirectTarget = useMemo(() => {
    if (!redirectParam || !redirectParam.startsWith('/')) return '/'
    return redirectParam
  }, [redirectParam])

  return (
    <main className="container-custom py-10 md:py-14">
      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center text-blue-900">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm md:text-base">{t.desc}</p>
      </div>

      <AuthModal
        isOpen={true}
        initialMode={mode}
        onClose={() => router.push(redirectTarget)}
        onSuccess={() => router.push(redirectTarget)}
      />
    </main>
  )
}
