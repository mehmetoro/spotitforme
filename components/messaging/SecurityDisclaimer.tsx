// components/messaging/SecurityDisclaimer.tsx
'use client'

import { useState } from 'react'
import { MESSAGING_DISCLAIMERS } from '@/lib/messaging/disclaimer'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

interface SecurityDisclaimerProps {
  variant?: 'full' | 'mini' | 'inline'
  onAccept?: () => void
  showAcceptButton?: boolean
}

export default function SecurityDisclaimer({ 
  variant = 'full', 
  onAccept,
  showAcceptButton = false 
}: SecurityDisclaimerProps) {
  const locale = useCurrentLocale()
  const [accepted, setAccepted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const t = {
    securityWarning: { tr: 'Guvenlik Uyarisi', en: 'Security Warning', de: 'Sicherheitswarnung', fr: 'Alerte de securite', es: 'Aviso de seguridad', ru: 'Preduprezhdenie bezopasnosti' },
    externalPayments: { tr: 'Platform disi odemelerden sorumlu degiliz.', en: 'We are not responsible for payments made outside the platform.', de: 'Wir sind fur Zahlungen ausserhalb der Plattform nicht verantwortlich.', fr: 'Nous ne sommes pas responsables des paiements hors plateforme.', es: 'No somos responsables de pagos fuera de la plataforma.', ru: 'My ne otvechaem za platezhi vne platformy.' },
    details: { tr: 'Detaylar', en: 'Details', de: 'Details', fr: 'Details', es: 'Detalles', ru: 'Podrobnee' },
    inlineWarning: { tr: 'Odemeler platform disinda yapilir. Guvenli alisveris icin dikkatli olun.', en: 'Payments happen outside the platform. Please trade carefully.', de: 'Zahlungen erfolgen ausserhalb der Plattform. Bitte handeln Sie vorsichtig.', fr: 'Les paiements se font hors plateforme. Restez prudent.', es: 'Los pagos se hacen fuera de la plataforma. Opera con cuidado.', ru: 'Platezhi prokhodyat vne platformy. Budte ostorozhny.' },
    safetyTipsTitle: { tr: 'Guvenli Alisveris Ipuclari', en: 'Safe Trading Tips', de: 'Tipps fur sicheres Handeln', fr: 'Conseils pour un echange securise', es: 'Consejos para comercio seguro', ru: 'Sovety po bezopasnoy sdelke' },
    acceptLabel: { tr: 'Yukaridaki guvenlik uyarilarini okudum ve kabul ediyorum', en: 'I read and accept the safety warnings above', de: 'Ich habe die obigen Sicherheitshinweise gelesen und akzeptiere sie', fr: 'J ai lu et j accepte les avertissements de securite ci-dessus', es: 'He leido y acepto las advertencias de seguridad anteriores', ru: 'Ya prochital i prinimayu predosterezheniya vyshe' },
    continue: { tr: 'Devam Et', en: 'Continue', de: 'Weiter', fr: 'Continuer', es: 'Continuar', ru: 'Prodolzhit' },
    suspiciousPrompt: { tr: 'Supheli bir mesaj veya kullanici gordunuz mu?', en: 'Did you see a suspicious message or user?', de: 'Haben Sie eine verdaechtige Nachricht oder einen Nutzer gesehen?', fr: 'Avez-vous vu un message ou utilisateur suspect ?', es: 'Viste un mensaje o usuario sospechoso?', ru: 'Zametili podozritelnoe soobshchenie ili polzovatelya?' },
    reportNow: { tr: 'Hemen Bildir', en: 'Report Now', de: 'Jetzt melden', fr: 'Signaler maintenant', es: 'Reportar ahora', ru: 'Soobshchit seychas' },
    fullTitle: { tr: 'Onemli Guvenlik Uyarisi', en: 'Important Security Notice', de: 'Wichtiger Sicherheitshinweis', fr: 'Avertissement de securite important', es: 'Aviso importante de seguridad', ru: 'Vazhnoe preduprezhdenie bezopasnosti' },
    fullBody: { tr: 'SpotItForMe bir mesajlasma platformu saglar. Platform disi odemelerden sorumlu degiliz. Kisisel bilgilerinizi paylasmayin ve supheli durumlari bildiriniz.', en: 'SpotItForMe provides messaging only. We are not responsible for off-platform payments. Do not share personal data and report suspicious behavior.', de: 'SpotItForMe bietet nur Messaging. Fur Zahlungen ausserhalb der Plattform ubernehmen wir keine Verantwortung. Teilen Sie keine personlichen Daten und melden Sie verdachtiges Verhalten.', fr: 'SpotItForMe fournit uniquement la messagerie. Nous ne sommes pas responsables des paiements hors plateforme. Ne partagez pas vos donnees personnelles et signalez les comportements suspects.', es: 'SpotItForMe solo ofrece mensajeria. No somos responsables de pagos fuera de la plataforma. No compartas datos personales y reporta comportamientos sospechosos.', ru: 'SpotItForMe predostavlyaet tolko perepisku. My ne otvechaem za platezhi vne platformy. Ne delites lichnymi dannymi i soobshchayte o podozritelnoy aktivnosti.' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr

  const localizedSafetyTips: Record<string, string[]> = {
    tr: [
      'Halka acik ve guvenli yerlerde bulusun.',
      'On odeme taleplerine dikkat edin.',
      'Urunu gormeden odeme yapmayin.',
      'Fatura veya garanti belgesi isteyin.',
      'Supheli durumlari platform@spotitforme.com adresine bildirin.',
    ],
    en: [
      'Meet in public and safe places.',
      'Be careful with upfront payment requests.',
      'Do not pay before seeing the item.',
      'Ask for invoice or warranty documents.',
      'Report suspicious cases to platform@spotitforme.com.',
    ],
    de: [
      'Treffen Sie sich an offentlichen und sicheren Orten.',
      'Seien Sie vorsichtig bei Vorauszahlungsforderungen.',
      'Nicht bezahlen, bevor Sie den Artikel gesehen haben.',
      'Fragen Sie nach Rechnung oder Garantie.',
      'Melden Sie verdachtige Falle an platform@spotitforme.com.',
    ],
    fr: [
      'Rencontrez-vous dans des lieux publics et surs.',
      'Soyez prudent avec les demandes de paiement anticipe.',
      'Ne payez pas avant d avoir vu l article.',
      'Demandez une facture ou une garantie.',
      'Signalez les cas suspects a platform@spotitforme.com.',
    ],
    es: [
      'Reunete en lugares publicos y seguros.',
      'Ten cuidado con pagos por adelantado.',
      'No pagues antes de ver el articulo.',
      'Pide factura o garantia.',
      'Reporta casos sospechosos a platform@spotitforme.com.',
    ],
    ru: [
      'Vstrechaytes v obshchestvennykh i bezopasnykh mestakh.',
      'Ostorozhno s predoplatoy.',
      'Ne platite do osmotra tovara.',
      'Zaprashivayte chek ili garantiyu.',
      'Soobshchayte o podozritelnykh sluchayakh na platform@spotitforme.com.',
    ],
  }

  const tips = localizedSafetyTips[locale] ?? localizedSafetyTips.tr

  const handleAccept = () => {
    setAccepted(true)
    if (onAccept) onAccept()
  }

  if (variant === 'mini') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start">
          <span className="text-yellow-600 mr-2">⚠️</span>
          <p className="text-sm text-yellow-800">
            <strong>{trText('securityWarning')}:</strong> {trText('externalPayments')}
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-yellow-700 underline text-xs"
            >
              {trText('details')}
            </button>
          </p>
        </div>
        
        {showDetails && (
          <div className="mt-2 pl-6 border-l-2 border-yellow-300">
            <ul className="text-xs text-yellow-700 space-y-1">
              {tips.slice(0, 3).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="text-sm text-gray-600 italic">
        ⚠️ {trText('inlineWarning')}
      </div>
    )
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
      <div className="flex items-start mb-4">
        <div className="bg-yellow-100 p-3 rounded-lg mr-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {trText('fullTitle')}
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {trText('fullBody').split('\n').map((line, i) => (
              <p key={i} className={i === 0 ? 'font-medium' : ''}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Güvenlik ipuçları */}
      <div className="mt-6">
        <h4 className="font-bold text-gray-900 mb-3">🔒 {trText('safetyTipsTitle')}:</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start bg-white bg-opacity-50 p-3 rounded-lg">
              <span className="text-green-600 mr-2 mt-1">✓</span>
              <span className="text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kabul butonu (isteğe bağlı) */}
      {showAcceptButton && !accepted && (
        <div className="mt-6 pt-6 border-t border-yellow-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptDisclaimer"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 mr-3"
              />
              <label htmlFor="acceptDisclaimer" className="text-sm font-medium text-gray-900">
                {trText('acceptLabel')}
              </label>
            </div>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg"
            >
              {trText('continue')}
            </button>
          </div>
        </div>
      )}

      {/* Şüpheli durum bildirimi */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {trText('suspiciousPrompt')}
        </p>
        <button className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
          🚨 {trText('reportNow')}
        </button>
      </div>
    </div>
  )
}