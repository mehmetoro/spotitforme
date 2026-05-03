
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const howData = {
  tr: {
    title: 'Nasıl Çalışır?',
    footer: 'Tüm paylaşımlar hem yardım hem de ticaret amaçlı yapılabilir. Topluluk kurallarına uygun hareket etmeyi unutmayın!',
    sections: [
      {
        title: 'A. Spot Yayınlamanın Amacı ve İşleyişi',
        desc: 'Aradığınız ürün, kişi veya nesneyi topluluğa duyurmak için spot oluşturursunuz. Spotlar, topluluğun dikkatine sunulur ve aradığınız şeyin bulunma şansını artırır.',
        items: ['Detaylı açıklama ve görsel ekleyin', 'Kategori ve konum belirtin', 'Topluluk üyeleri spotunuzu görür ve yardımcı olur'],
      },
      {
        title: 'B. Sosyal Paylaşımın Amacı ve İşleyişi',
        desc: 'Gördüğünüz ilginç, faydalı veya ilham verici şeyleri toplulukla paylaşmak için sosyal paylaşım yaparsınız.',
        items: ['Fotoğraf, hikaye veya öneri paylaşın', 'Beğeni ve yorum alın', 'Müze seçeneğiyle kalıcı paylaşımlar oluşturun'],
      },
      {
        title: 'C. Spota Cevaben Yardım Paylaşımı',
        desc: 'Bir spota doğrudan "Ben gördüm" veya "Bende var" diyerek yardım paylaşımı yapabilirsiniz.',
        items: ['Konum, fiyat, detay ve not ekleyin', 'Spot sahibine bildirim gider', 'Yardım amaçlı veya ticaret amaçlı olabilir'],
      },
      {
        title: 'D. Spota Cevap Olmayan Yardım Paylaşımı',
        desc: 'Genel yardım paylaşımı ile topluluğa faydalı bilgiler sunabilirsiniz.',
        items: ['Genel bilgi, ipucu veya öneri paylaşın', 'Topluluğun tamamı faydalanır', 'Yardım veya ticaret amaçlı olabilir'],
      },
      {
        title: 'E. Koleksiyon Paylaşımı',
        desc: 'Koleksiyonunuza ait nadir veya özel parçaları paylaşarak diğer koleksiyoncularla iletişim kurabilirsiniz.',
        items: ['Parça detaylarını ve hikayesini anlatın', 'İlgilenenlerle iletişime geçin', 'Takas, satış veya yardım amaçlı paylaşım yapın'],
      },
      {
        title: 'F. Müze Seçenekli Sosyal Paylaşım',
        desc: 'Sosyal paylaşımlarınızı müze seçeneğiyle kalıcı hale getirebilirsiniz.',
        items: ['Paylaşımınızı müze olarak işaretleyin', 'Topluluk arşivinde kalıcı olarak yer alın', 'İlham verici içerikler oluşturun'],
      },
    ],
  },
  en: {
    title: 'How It Works',
    footer: 'All shares can be made for both help and trade purposes. Remember to comply with community rules!',
    sections: [
      {
        title: 'A. Purpose and Process of Publishing a Spot',
        desc: 'You create a spot to announce the product, person, or item you are looking for to the community.',
        items: ['Add a detailed description and image', 'Specify category and location', 'Community members see your spot and help out'],
      },
      {
        title: 'B. Purpose and Process of Social Sharing',
        desc: 'You share interesting, useful, or inspiring things you have seen with the community.',
        items: ['Share photos, stories, or recommendations', 'Receive likes and comments', 'Create permanent shares with the Museum option'],
      },
      {
        title: 'C. Sharing a Help in Response to a Spot',
        desc: 'You can share a help response to a spot by saying "I saw it" or "I have it".',
        items: ['Add location, price, details and notes', 'The spot owner gets notified', 'Can be for help or trade purposes'],
      },
      {
        title: 'D. General Help Sharing (Not in Response to a Spot)',
        desc: 'You can share useful information with the community without linking it to a specific spot.',
        items: ['Share general info, tips, or suggestions', 'The whole community benefits', 'Can be for help or trade purposes'],
      },
      {
        title: 'E. Collection Sharing',
        desc: 'Share rare or special pieces from your collection to connect with other collectors.',
        items: ['Tell the story and details of the piece', 'Connect with interested parties', 'Share for trade, sale, or help purposes'],
      },
      {
        title: 'F. Museum-Option Social Sharing',
        desc: 'Make your social shares permanent with the Museum option and contribute to the community archive.',
        items: ['Mark your share as a museum entry', 'Be permanently featured in the community archive', 'Create inspiring content'],
      },
    ],
  },
  de: {
    title: 'Wie es funktioniert',
    footer: 'Alle Beiträge können sowohl für Hilfs- als auch für Handelszwecke gemacht werden. Denken Sie daran, die Community-Regeln einzuhalten!',
    sections: [
      {
        title: 'A. Zweck und Ablauf der Veröffentlichung eines Spots',
        desc: 'Sie erstellen einen Spot, um der Community mitzuteilen, wonach Sie suchen.',
        items: ['Fügen Sie eine detaillierte Beschreibung und ein Bild hinzu', 'Geben Sie Kategorie und Standort an', 'Community-Mitglieder sehen Ihren Spot und helfen'],
      },
      {
        title: 'B. Zweck und Ablauf des sozialen Teilens',
        desc: 'Sie teilen interessante, nützliche oder inspirierende Dinge mit der Community.',
        items: ['Fotos, Geschichten oder Empfehlungen teilen', 'Likes und Kommentare erhalten', 'Permanente Beiträge mit der Museum-Option erstellen'],
      },
      {
        title: 'C. Hilfe als Antwort auf einen Spot',
        desc: 'Sie können eine Hilfe als Antwort auf einen Spot teilen.',
        items: ['Ort, Preis, Details und Notizen hinzufügen', 'Der Spot-Besitzer wird benachrichtigt', 'Für Hilfe oder Handelszwecke möglich'],
      },
      {
        title: 'D. Allgemeines Teilen von Hilfe',
        desc: 'Sie können nützliche Informationen mit der Community teilen, ohne sie an einen Spot zu knüpfen.',
        items: ['Allgemeine Infos, Tipps oder Vorschläge teilen', 'Die gesamte Community profitiert', 'Für Hilfe oder Handelszwecke möglich'],
      },
      {
        title: 'E. Sammlung teilen',
        desc: 'Teilen Sie seltene oder besondere Stücke aus Ihrer Sammlung.',
        items: ['Geschichte und Details des Stücks erzählen', 'Kontakt mit Interessenten aufnehmen', 'Für Tausch, Verkauf oder Hilfe teilen'],
      },
      {
        title: 'F. Soziales Teilen mit Museum-Option',
        desc: 'Machen Sie Ihre Beiträge mit der Museum-Option dauerhaft.',
        items: ['Beitrag als Museum-Eintrag markieren', 'Dauerhaft im Community-Archiv erscheinen', 'Inspirierende Inhalte erstellen'],
      },
    ],
  },
  fr: {
    title: 'Comment ça marche',
    footer: 'Tous les partages peuvent être effectués à des fins d\'aide ou de commerce. N\'oubliez pas de respecter les règles de la communauté !',
    sections: [
      {
        title: 'A. But et processus de publication d\'un Spot',
        desc: 'Vous créez un Spot pour annoncer à la communauté ce que vous recherchez.',
        items: ['Ajoutez une description détaillée et une image', 'Précisez la catégorie et l\'emplacement', 'Les membres de la communauté voient votre Spot et aident'],
      },
      {
        title: 'B. But et processus du partage social',
        desc: 'Vous partagez avec la communauté des choses intéressantes, utiles ou inspirantes.',
        items: ['Partagez des photos, des histoires ou des recommandations', 'Recevez des likes et des commentaires', 'Créez des partages permanents avec l\'option Musée'],
      },
      {
        title: 'C. Partage d\'aide en réponse à un Spot',
        desc: 'Vous pouvez partager une aide en réponse à un Spot.',
        items: ['Ajoutez lieu, prix, détails et notes', 'Le propriétaire du Spot est notifié', 'Peut être à des fins d\'aide ou de commerce'],
      },
      {
        title: 'D. Partage d\'aide général',
        desc: 'Vous pouvez partager des informations utiles sans les lier à un Spot spécifique.',
        items: ['Partagez des infos générales, conseils ou suggestions', 'Toute la communauté en bénéficie', 'Peut être à des fins d\'aide ou de commerce'],
      },
      {
        title: 'E. Partage de Collection',
        desc: 'Partagez des pièces rares ou spéciales de votre collection.',
        items: ['Racontez l\'histoire et les détails de la pièce', 'Contactez les personnes intéressées', 'Partagez pour échange, vente ou aide'],
      },
      {
        title: 'F. Partage social avec option Musée',
        desc: 'Rendez vos partages permanents avec l\'option Musée.',
        items: ['Marquez votre partage comme entrée de musée', 'Apparaissez définitivement dans les archives', 'Créez du contenu inspirant'],
      },
    ],
  },
  es: {
    title: 'Cómo Funciona',
    footer: 'Todos los compartidos pueden hacerse con fines de ayuda o comerciales. ¡Recuerda cumplir las normas de la comunidad!',
    sections: [
      {
        title: 'A. Propósito y proceso de publicar un Spot',
        desc: 'Creas un Spot para anunciar a la comunidad lo que estás buscando.',
        items: ['Añade una descripción detallada e imagen', 'Especifica la categoría y ubicación', 'Los miembros de la comunidad ven tu Spot y ayudan'],
      },
      {
        title: 'B. Propósito y proceso del contenido social',
        desc: 'Compartes cosas interesantes, útiles o inspiradoras con la comunidad.',
        items: ['Comparte fotos, historias o recomendaciones', 'Recibe me gusta y comentarios', 'Crea compartidos permanentes con la opción Museo'],
      },
      {
        title: 'C. Compartir ayuda en respuesta a un Spot',
        desc: 'Puedes compartir una respuesta de ayuda a un Spot.',
        items: ['Añade ubicación, precio, detalles y notas', 'El dueño del Spot recibe una notificación', 'Puede ser para ayuda o fines comerciales'],
      },
      {
        title: 'D. Compartir ayuda general',
        desc: 'Puedes compartir información útil sin vincularla a un Spot.',
        items: ['Comparte información general, consejos o sugerencias', 'Toda la comunidad se beneficia', 'Puede ser para ayuda o fines comerciales'],
      },
      {
        title: 'E. Compartir Colección',
        desc: 'Comparte piezas raras o especiales de tu colección.',
        items: ['Cuenta la historia y detalles de la pieza', 'Contacta con personas interesadas', 'Comparte para intercambio, venta o ayuda'],
      },
      {
        title: 'F. Contenido social con opción Museo',
        desc: 'Haz tus compartidos permanentes con la opción Museo.',
        items: ['Marca tu compartido como entrada de museo', 'Aparece permanentemente en el archivo', 'Crea contenido inspirador'],
      },
    ],
  },
  ru: {
    title: 'Как это работает',
    footer: 'Все публикации могут быть сделаны как в целях помощи, так и в коммерческих целях. Не забывайте соблюдать правила сообщества!',
    sections: [
      {
        title: 'A. Цель и процесс публикации Спота',
        desc: 'Вы создаёте Спот, чтобы сообщить сообществу о том, что ищете.',
        items: ['Добавьте подробное описание и фото', 'Укажите категорию и местоположение', 'Члены сообщества видят ваш Спот и помогают'],
      },
      {
        title: 'B. Цель и процесс социального контента',
        desc: 'Вы делитесь с сообществом интересными, полезными или вдохновляющими вещами.',
        items: ['Делитесь фото, историями или рекомендациями', 'Получайте лайки и комментарии', 'Создавайте постоянные публикации с опцией Музей'],
      },
      {
        title: 'C. Публикация помощи в ответ на Спот',
        desc: 'Вы можете поделиться помощью в ответ на Спот.',
        items: ['Добавьте место, цену, детали и заметки', 'Владелец Спота получит уведомление', 'Может быть для помощи или торговли'],
      },
      {
        title: 'D. Общая публикация помощи',
        desc: 'Вы можете делиться полезной информацией без привязки к конкретному Споту.',
        items: ['Делитесь общей информацией, советами или предложениями', 'Всё сообщество выигрывает', 'Может быть для помощи или торговли'],
      },
      {
        title: 'E. Публикация Коллекции',
        desc: 'Делитесь редкими или особыми экспонатами своей коллекции.',
        items: ['Расскажите историю и детали экспоната', 'Свяжитесь с заинтересованными', 'Делитесь для обмена, продажи или помощи'],
      },
      {
        title: 'F. Социальный контент с опцией Музей',
        desc: 'Сделайте свои публикации постоянными с опцией Музей.',
        items: ['Отметьте публикацию как музейный экспонат', 'Навсегда попадите в архив сообщества', 'Создавайте вдохновляющий контент'],
      },
    ],
  },
} as const
type HowLocale = keyof typeof howData

export default function HowItWorksPage() {
  const locale = useCurrentLocale()
  const t = howData[(locale as HowLocale) in howData ? (locale as HowLocale) : 'tr']

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">{t.title}</h1>
          <div className="space-y-8">
            {t.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-2xl font-bold text-blue-800 mb-2">{section.title}</h2>
                <p className="text-gray-700 mb-2">{section.desc}</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl text-blue-900 text-center mt-10">
            <p className="font-semibold">{t.footer}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
