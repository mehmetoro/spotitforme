'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallCard, setShowInstallCard] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      let hasReloadedForNewWorker = false

      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope)

          const activateWaitingWorker = () => {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          }

          reg.update().catch((err) => {
            console.warn('[PWA] Service worker update check failed:', err)
          })

          if (reg.waiting) {
            activateWaitingWorker()
          }

          reg.addEventListener('updatefound', () => {
            const installingWorker = reg.installing
            if (!installingWorker) return

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                activateWaitingWorker()
              }
            })
          })

          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (hasReloadedForNewWorker) return
            hasReloadedForNewWorker = true
            window.location.reload()
          })
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration failed:', err)
        })
    }
  }, [])

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    const dismissed = localStorage.getItem('pwa-install-dismissed') === '1'
    if (dismissed) return

    const userAgent = navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|android|crios|fxios/.test(userAgent)

    if (isIos && isSafari) {
      setShowIosHint(true)
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setShowInstallCard(true)
      setShowIosHint(false)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setShowInstallCard(false)
      setShowIosHint(false)
      localStorage.removeItem('pwa-install-dismissed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setShowInstallCard(false)
      setShowIosHint(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowInstallCard(false)
    setShowIosHint(false)
  }

  if (!showInstallCard && !showIosHint) return null

  return (
    <div className="fixed bottom-3 left-2 right-2 z-[60] sm:left-auto sm:right-4 sm:w-[360px] sm:max-w-[calc(100vw-1rem)]">
      {showInstallCard && (
        <div className="rounded-2xl border border-blue-200 bg-white/95 backdrop-blur px-4 py-3 shadow-lg overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">Uygulama Gibi Kullan</p>
              <p className="text-xs text-gray-600 mt-1">SpotItForMe'yi telefonuna kur, daha hızlı aç.</p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 text-sm leading-none"
              aria-label="Yükleme kartını kapat"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 transition-colors"
            >
              Uygulamayı Yükle
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Sonra
            </button>
          </div>
        </div>
      )}

      {showIosHint && !showInstallCard && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-amber-900">iPhone'da Yükleme</p>
              <p className="text-xs text-amber-800 mt-1">Safari'de Paylas butonu ile Ana Ekrana Ekle secenegini kullan.</p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-amber-700 hover:text-amber-900 text-sm leading-none"
              aria-label="Bilgilendirme kartını kapat"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
