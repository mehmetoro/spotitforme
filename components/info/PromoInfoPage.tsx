'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'
import { getPromoCategories, withPromoLocale } from '@/lib/promo-content'

interface PromoInfoPageProps {
  promoId: string
  accent: 'pink' | 'cyan' | 'emerald' | 'rose' | 'yellow' | 'purple' | 'blue' | 'teal' | 'amber' | 'green'
}

const accentClasses: Record<PromoInfoPageProps['accent'], { bg: string; button: string; buttonText: string; secondary: string }> = {
  pink: { bg: 'from-pink-50 to-white', button: 'from-pink-600 to-rose-600', buttonText: 'text-pink-700', secondary: 'bg-pink-100' },
  cyan: { bg: 'from-cyan-50 to-white', button: 'from-cyan-600 to-blue-600', buttonText: 'text-cyan-700', secondary: 'bg-cyan-100' },
  emerald: { bg: 'from-emerald-50 to-white', button: 'from-emerald-600 to-teal-600', buttonText: 'text-emerald-700', secondary: 'bg-emerald-100' },
  rose: { bg: 'from-rose-50 to-white', button: 'from-rose-600 to-pink-600', buttonText: 'text-rose-700', secondary: 'bg-rose-100' },
  yellow: { bg: 'from-amber-50 to-white', button: 'from-amber-600 to-orange-600', buttonText: 'text-amber-700', secondary: 'bg-amber-100' },
  purple: { bg: 'from-purple-50 to-white', button: 'from-purple-600 to-indigo-600', buttonText: 'text-purple-700', secondary: 'bg-purple-100' },
  blue: { bg: 'from-blue-50 to-white', button: 'from-blue-600 to-indigo-600', buttonText: 'text-blue-700', secondary: 'bg-blue-100' },
  teal: { bg: 'from-teal-50 to-white', button: 'from-teal-600 to-cyan-600', buttonText: 'text-teal-700', secondary: 'bg-teal-100' },
  amber: { bg: 'from-amber-50 to-white', button: 'from-amber-600 to-orange-600', buttonText: 'text-amber-700', secondary: 'bg-amber-100' },
  green: { bg: 'from-green-50 to-white', button: 'from-green-600 to-emerald-600', buttonText: 'text-green-700', secondary: 'bg-green-100' },
}

export default function PromoInfoPage({ promoId, accent }: PromoInfoPageProps) {
  const locale = useCurrentLocale()
  const promos = useMemo(() => getPromoCategories(locale), [locale])
  const promo = promos.find((p) => p.id === promoId) || promos[0]
  const styles = accentClasses[accent]

  const t = {
    headline: {
      tr: 'Bu Ozellik Neden Ozel?',
      en: 'Why This Feature Matters',
      de: 'Warum Diese Funktion Wichtig Ist',
      fr: 'Pourquoi Cette Fonctionnalite Est Importante',
      es: 'Por Que Importa Esta Funcion',
      ru: 'Pochemu Eta Funktsiya Vazhna',
    },
    headlineBody: {
      tr: 'SpotItForMe toplulugu ile kesiflerinizi paylasabilir, benzer ilgi alanlarina sahip kisilerle bulusabilir ve yeni firsatlar yakalayabilirsiniz.',
      en: 'With the SpotItForMe community, you can share discoveries, meet like-minded people, and unlock new opportunities.',
      de: 'Mit der SpotItForMe-Community konnen Sie Entdeckungen teilen, Gleichgesinnte treffen und neue Chancen entdecken.',
      fr: 'Avec la communaute SpotItForMe, vous pouvez partager vos decouvertes, rencontrer des personnes similaires et creer de nouvelles opportunites.',
      es: 'Con la comunidad SpotItForMe, puedes compartir descubrimientos, conocer personas afines y abrir nuevas oportunidades.',
      ru: 'S soobshchestvom SpotItForMe vy mozhete delitsya otkrytiyami, znakomitsya s lyudmi po interesam i otkryvat novye vozmozhnosti.',
    },
    whatYouCanDo: {
      tr: 'Neler Yapabilirsiniz?',
      en: 'What Can You Do?',
      de: 'Was Konnen Sie Tun?',
      fr: 'Que Pouvez-Vous Faire ?',
      es: 'Que Puedes Hacer?',
      ru: 'Chto Mozhno Delat?',
    },
    feature1: {
      tr: 'Topluluktan geri bildirim alin ve etkilelim olusturun.',
      en: 'Get feedback from the community and build engagement.',
      de: 'Erhalten Sie Feedback aus der Community und schaffen Sie Interaktion.',
      fr: 'Recevez des retours de la communaute et creez de l engagement.',
      es: 'Recibe comentarios de la comunidad y genera interaccion.',
      ru: 'Poluchayte obratnuyu svyaz ot soobshchestva i povyshayte vovlechennost.',
    },
    feature2: {
      tr: 'Harita ve akislarda yeni kesifleri hizla bulun.',
      en: 'Discover new highlights quickly on maps and feeds.',
      de: 'Entdecken Sie neue Highlights schnell auf Karten und in Feeds.',
      fr: 'Decouvrez rapidement de nouveaux points forts sur les cartes et flux.',
      es: 'Descubre rapidamente nuevos hallazgos en mapas y feeds.',
      ru: 'Bystro nahodite novye naydennye mesta na karte i v lentiale.',
    },
    feature3: {
      tr: 'Kendi paylasimlarinizla baskalarina ilham verin.',
      en: 'Inspire others with your own posts and stories.',
      de: 'Inspirieren Sie andere mit eigenen Beitragen und Geschichten.',
      fr: 'Inspirez les autres avec vos propres publications et histoires.',
      es: 'Inspira a otros con tus propias publicaciones e historias.',
      ru: 'Vdokhnovlyayte drugikh svoimi publikatsiyami i istoriyami.',
    },
    howToStart: {
      tr: 'Nasil Baslanir?',
      en: 'How to Start',
      de: 'So Starten Sie',
      fr: 'Comment Commencer',
      es: 'Como Empezar',
      ru: 'Kak Nachat',
    },
    step1: { tr: 'Ilgili sayfayi acin ve ihtiyacinizi belirleyin.', en: 'Open the related page and define your goal.', de: 'Offnen Sie die entsprechende Seite und definieren Sie Ihr Ziel.', fr: 'Ouvrez la page concernee et definissez votre objectif.', es: 'Abre la pagina relacionada y define tu objetivo.', ru: 'Otkroyte nuzhnuyu stranitsu i opredelite tsel.' },
    step2: { tr: 'Kisa aciklama ile paylasim veya talep olusturun.', en: 'Create a post or request with a short description.', de: 'Erstellen Sie einen Beitrag oder eine Anfrage mit kurzer Beschreibung.', fr: 'Creez une publication ou une demande avec une courte description.', es: 'Crea una publicacion o solicitud con una descripcion breve.', ru: 'Sozdayte post ili zapros s kratkim opisaniem.' },
    step3: { tr: 'Gelen bildirimleri takip edip toplulukla etkilesime gecin.', en: 'Follow notifications and interact with the community.', de: 'Verfolgen Sie Benachrichtigungen und interagieren Sie mit der Community.', fr: 'Suivez les notifications et interagissez avec la communaute.', es: 'Sigue notificaciones e interactua con la comunidad.', ru: 'Sledite za uvedomleniyami i obshchaytes s soobshchestvom.' },
    ctaTitle: {
      tr: 'Hemen Baslayin',
      en: 'Start Now',
      de: 'Jetzt Starten',
      fr: 'Commencez Maintenant',
      es: 'Empieza Ahora',
      ru: 'Nachnite Pryamo Seychas',
    },
    ctaBody: {
      tr: 'Secili dilinizde deneyime devam edin ve topluluga katilin.',
      en: 'Continue in your selected language and join the community.',
      de: 'Machen Sie in Ihrer Sprache weiter und treten Sie der Community bei.',
      fr: 'Continuez dans votre langue et rejoignez la communaute.',
      es: 'Continua en tu idioma y unete a la comunidad.',
      ru: 'Prodolzhayte na vybrannom yazyke i prisoyedinyaytes k soobshchestvu.',
    },
    ctaPrimary: { tr: 'Paylasim Olustur', en: 'Create a Post', de: 'Beitrag Erstellen', fr: 'Creer une Publication', es: 'Crear Publicacion', ru: 'Sozdat Post' },
    ctaSecondary: { tr: 'Paylasimlari Incele', en: 'Browse Posts', de: 'Beitrage Ansehen', fr: 'Voir les Publications', es: 'Ver Publicaciones', ru: 'Smotret Posty' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr
  const createSpotHref = withPromoLocale('/create-spot', locale)
  const sightingsHref = withPromoLocale('/sightings', locale)

  return (
    <div className={`min-h-screen bg-gradient-to-b ${styles.bg} py-12`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{promo.icon}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{promo.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{promo.description}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{trText('headline')}</h2>
          <p className="text-gray-700 mb-8">{trText('headlineBody')}</p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">{trText('whatYouCanDo')}</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className={`${styles.secondary} rounded-lg p-4 text-gray-700`}>{trText('feature1')}</div>
            <div className={`${styles.secondary} rounded-lg p-4 text-gray-700`}>{trText('feature2')}</div>
            <div className={`${styles.secondary} rounded-lg p-4 text-gray-700`}>{trText('feature3')}</div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">{trText('howToStart')}</h3>
          <div className="space-y-3 text-gray-700">
            <p>1. {trText('step1')}</p>
            <p>2. {trText('step2')}</p>
            <p>3. {trText('step3')}</p>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${styles.button} rounded-xl shadow-xl p-8 text-center text-white`}>
          <h2 className="text-3xl font-bold mb-4">{trText('ctaTitle')}</h2>
          <p className="text-white/90 mb-6 text-lg">{trText('ctaBody')}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href={createSpotHref} className={`bg-white ${styles.buttonText} px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors`}>
              {trText('ctaPrimary')}
            </Link>
            <Link href={sightingsHref} className="bg-black/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-black/30 transition-colors border border-white/40">
              {trText('ctaSecondary')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
