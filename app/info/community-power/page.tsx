'use client'

import Link from 'next/link'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const communityText = {
  tr: {
    hero_title: 'Topluluk Gücü',
    hero_subtitle: 'Sen ararken yoruldun mu? Endişelenme! 50.000+ göz şu anda senin için bakıyor.',
    stats_title: 'Şu Anda Aktif',
    stat_users: { val: '52.847', label: 'Aktif Kullanıcı' },
    stat_spots: { val: '1.234', label: 'Aktif Spot' },
    stat_found: { val: '892', label: 'Bugün Bulundu' },
    stat_time: { val: '3.2 dk', label: 'Ort. Bulma Süresi' },
    stats_desc: 'Şu anda binlerce kişi aynı platformda! Senin spotunu görecek ve bulacak birisi mutlaka var.',
    how_works: 'Topluluk Nasıl Çalışır?',
    step1_title: '1. Spotunu Oluştur',
    step1_desc: 'Aradığın şeyi anlat: "1980 model Arçelik buzdolabı cam rafı arıyorum" gibi. Ne kadar detaylı anlatırsan, bulma şansı o kadar artar!',
    step1_example_title: 'İyi Spot Örneği:',
    step1_example: '1985 model Grundig radyo için hoparlör arıyorum. Modeli: 4090. Eski evde vardı ama kayboldu. Kim biliyorsa yardımcı olabilir mi?',
    step2_title: '2. Topluluk Bildirim Alır',
    step2_desc: 'Spotun oluşturulduğu anda, ilgili kategorileri takip eden binlerce kişiye bildirim gider. "Hey! Biri Arçelik buzdolabı rafı arıyor, sen biliyor musun?"',
    step2_feature1: 'Akıllı eşleştirme: İlgilenebilecek kişilere öncelikli bildirim',
    step2_feature2: 'Konum bazlı: Yakın bölgedeki kullanıcılar önce haberdar olur',
    step2_feature3: 'Kategori takibi: İlgi alanına göre özelleştirilmiş bildirimler',
    step3_title: '3. Herkes Aramaya Başlar',
    step3_desc: 'Topluluk üyeleri kendi bilgi birikimlerini, bağlantılarını, yerel bilgilerini kullanarak arar:',
    step3_person1: { name: 'Mehmet', msg: 'Babamın dükkânında vardı sanki, yarın sorayım' },
    step3_person2: { name: 'Ayşe', msg: 'Bit pazarında böyle bir şey gördüm geçen hafta' },
    step3_person3: { name: 'Can', msg: 'Sahaf arkadaşım var, ona sorayım bulur belki' },
    step3_person4: { name: 'Zeynep', msg: 'Annem koleksiyoncu, hemen sordum!' },
    step4_title: '4. Birisi Bulur!',
    step4_desc: 'Ortalama 3.2 dakika içinde birisi "Ben buldum!" der. Fotoğraf paylaşır, konum bilgisi verir. Sen de gider ve aradığını bulursun!',
    step4_success_title: '🏆 Başarı Hikayesi:',
    step4_success_quote: '30 yıllık vintage fotoğraf makinesi lensi arıyordum. 7 dakikada bulundu! İstanbul\'un öbür ucundaki bir hobi dükkânında varmış. Topluluk sayesinde hayalim gerçek oldu!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: '7 dakikada bulundu • 23 kişi aramaya katıldı',
    why_powerful: 'Neden Bu Kadar Güçlü?',
    why1_title: 'Geniş Coğrafya',
    why1_desc: 'Türkiye\'nin her yerinden kullanıcılar. Hangi şehirde olursa olsun, orada birisi var.',
    why2_title: 'Çeşitli Bilgi',
    why2_desc: 'Koleksiyoncular, antikacılar, hobi sahipleri, esnaflar... Herkes farklı bir şey bilir.',
    why3_title: 'Hızlı Yanıt',
    why3_desc: 'Gerçek zamanlı bildirimler sayesinde dakikalar içinde yardım gelir.',
    stats_title_box: 'Topluluk Gücü İstatistikleri',
    stat_fastest: { title: 'En Hızlı Bulma:', value: '42 saniye! "1990 model Walkman kulaklığı"' },
    stat_most_participants: { title: 'En Çok Katılım:', value: '340 kişi aynı spotu aramış' },
    stat_farthest: { title: 'En Uzak Bulma:', value: 'Ankara\'dan soran, Trabzon\'da bulunmuş' },
    stat_success_rate: { title: 'Başarı Oranı:', value: '%87 - Spotların çoğu bulunuyor!' },
    cta_title: 'Sen de Topluluk Gücünü Kullan!',
    cta_desc: 'Aradığın şeyi bulamadın mı? 50.000 kişi sana yardım etmeye hazır!',
    cta_create: 'Spot Oluştur',
    cta_help: 'Başkalarına Yardım Et',
  },
  en: {
    hero_title: 'Community Power',
    hero_subtitle: 'Tired of searching alone? Don\'t worry! 50,000+ eyes are looking for you right now.',
    stats_title: 'Currently Active',
    stat_users: { val: '52,847', label: 'Active Users' },
    stat_spots: { val: '1,234', label: 'Active Spots' },
    stat_found: { val: '892', label: 'Found Today' },
    stat_time: { val: '3.2 min', label: 'Avg Find Time' },
    stats_desc: 'Thousands of people on the same platform right now! Someone will see your spot and find it.',
    how_works: 'How Community Works?',
    step1_title: '1. Create Your Spot',
    step1_desc: 'Describe what you\'re looking for: "Looking for 1980 Arçelik fridge glass shelf" like this. The more detailed, the better your chances!',
    step1_example_title: 'Good Spot Example:',
    step1_example: 'Looking for speaker for 1985 Grundig radio. Model: 4090. Had it at home but lost it. Can anyone help?',
    step2_title: '2. Community Gets Notification',
    step2_desc: 'When spot is created, thousands following relevant categories get notified. "Hey! Someone is looking for a fridge shelf, do you know?"',
    step2_feature1: 'Smart matching: Priority notification to interested people',
    step2_feature2: 'Location based: Users in nearby areas get notified first',
    step2_feature3: 'Category following: Personalized notifications based on interests',
    step3_title: '3. Everyone Starts Searching',
    step3_desc: 'Community members use their knowledge, connections, local info to search:',
    step3_person1: { name: 'Mehmet', msg: 'Think I saw it at my dad\'s shop, will ask tomorrow' },
    step3_person2: { name: 'Ayşe', msg: 'Saw something like this at the flea market last week' },
    step3_person3: { name: 'Can', msg: 'I have a bookstore friend, let me ask him' },
    step3_person4: { name: 'Zeynep', msg: 'My mom is a collector, I just asked her!' },
    step4_title: '4. Someone Finds It!',
    step4_desc: 'Within average 3.2 minutes someone says "I found it!" Shares photo, location info. You go and find what you\'re looking for!',
    step4_success_title: '🏆 Success Story:',
    step4_success_quote: 'I was looking for a 30-year-old vintage camera lens. Found in 7 minutes! At a hobby shop across Istanbul. My dream came true thanks to the community!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: 'Found in 7 minutes • 23 people participated in search',
    why_powerful: 'Why So Powerful?',
    why1_title: 'Wide Geography',
    why1_desc: 'Users from all over Turkey. Wherever you are, someone is there.',
    why2_title: 'Diverse Knowledge',
    why2_desc: 'Collectors, antique dealers, hobbyists, merchants... Everyone knows something different.',
    why3_title: 'Quick Response',
    why3_desc: 'Real-time notifications mean help arrives within minutes.',
    stats_title_box: 'Community Power Statistics',
    stat_fastest: { title: 'Fastest Find:', value: '42 seconds! "1990 model Walkman headphones"' },
    stat_most_participants: { title: 'Most Participants:', value: '340 people searched for same spot' },
    stat_farthest: { title: 'Farthest Find:', value: 'Asked in Ankara, Found in Trabzon' },
    stat_success_rate: { title: 'Success Rate:', value: '87% - Most spots get found!' },
    cta_title: 'Use Community Power Too!',
    cta_desc: 'Can\'t find what you\'re looking for? 50,000 people are ready to help!',
    cta_create: 'Create Spot',
    cta_help: 'Help Others',
  },
  de: {
    hero_title: 'Gemeinschaftskraft',
    hero_subtitle: 'Müde vom Suchen? Keine Sorge! 50.000+ Augen suchen gerade für dich.',
    stats_title: 'Aktuell Aktiv',
    stat_users: { val: '52.847', label: 'Aktive Benutzer' },
    stat_spots: { val: '1.234', label: 'Aktive Flecken' },
    stat_found: { val: '892', label: 'Heute Gefunden' },
    stat_time: { val: '3,2 min', label: 'Durchschn. Suchzeit' },
    stats_desc: 'Tausende Menschen auf der gleichen Plattform! Jemand wird dein Angebot sehen und es finden.',
    how_works: 'Wie funktioniert die Gemeinschaft?',
    step1_title: '1. Erstelle deinen Fleck',
    step1_desc: 'Beschreibe, was du suchst: "Suche Glashälter von 1980er Arçelik Kühlschrank". Je detaillierter, desto besser!',
    step1_example_title: 'Gutes Beispielspot:',
    step1_example: 'Suche Lautsprecher für 1985er Grundig Radio. Modell: 4090. Hatte es zu Hause, aber verloren. Kann jemand helfen?',
    step2_title: '2. Gemeinschaft erhält Benachrichtigung',
    step2_desc: 'Wenn der Fleck erstellt wird, benachrichtigen Tausende folgende Kategorien. "Hey! Jemand sucht einen Kühlschrank-Halter, weißt du was?"',
    step2_feature1: 'Intelligente Zuordnung: Prioritätsbenachrichtigung für interessierte Personen',
    step2_feature2: 'Standortbasiert: Benutzer in Nähe erhalten Benachrichtigung zuerst',
    step2_feature3: 'Kategorie-Abonnement: Personalisierte Benachrichtigungen',
    step3_title: '3. Alle beginnen zu suchen',
    step3_desc: 'Gemeinschaftsmitglieder nutzen ihr Wissen, Kontakte, lokale Infos:',
    step3_person1: { name: 'Mehmet', msg: 'Glaube, das war im Laden meines Vaters, frag morgen' },
    step3_person2: { name: 'Ayşe', msg: 'Sah etwas Ähnliches letzte Woche am Flohmarkt' },
    step3_person3: { name: 'Can', msg: 'Habe Buchhandlung-Freund, lass mich ihn fragen' },
    step3_person4: { name: 'Zeynep', msg: 'Meine Mutter ist Sammlerin, habe sie sofort gefragt!' },
    step4_title: '4. Jemand findet es!',
    step4_desc: 'Durchschnittlich innerhalb 3,2 Minuten sagt jemand "Ich habe es gefunden!" Teilt Foto, Standort. Du gehst und findest, was du suchst!',
    step4_success_title: '🏆 Erfolgreiches Beispiel:',
    step4_success_quote: 'Ich suchte 30 Jahre altes Vintage-Kameraobjektiv. Gefunden in 7 Minuten! In einem Hobbyladen auf der anderen Seite Istanbuls. Dank der Gemeinschaft wurde mein Traum wahr!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: 'In 7 Minuten gefunden • 23 Personen halfen bei der Suche',
    why_powerful: 'Warum so mächtig?',
    why1_title: 'Breite Geographie',
    why1_desc: 'Benutzer aus ganz der Türkei. Überall gibt es jemanden.',
    why2_title: 'Vielfältiges Wissen',
    why2_desc: 'Sammler, Antiquitätenhändler, Hobbyisten, Händler... Jeder weiß etwas anderes.',
    why3_title: 'Schnelle Reaktion',
    why3_desc: 'Echtzeit-Benachrichtigungen bedeuten Hilfe in Minuten.',
    stats_title_box: 'Gemeinschaftskraft Statistiken',
    stat_fastest: { title: 'Schnellste Suche:', value: '42 Sekunden! "1990er Walkman Kopfhörer"' },
    stat_most_participants: { title: 'Meiste Teilnehmer:', value: '340 Personen suchten für denselben Fleck' },
    stat_farthest: { title: 'Weiteste Suche:', value: 'In Ankara gefragt, in Trabzon gefunden' },
    stat_success_rate: { title: 'Erfolgsquote:', value: '87% - Meiste Flecken gefunden!' },
    cta_title: 'Nutze auch die Gemeinschaftskraft!',
    cta_desc: 'Kannst nicht finden, was du suchst? 50.000 Menschen helfen gerne!',
    cta_create: 'Fleck Erstellen',
    cta_help: 'Anderen Helfen',
  },
  fr: {
    hero_title: 'Puissance Communautaire',
    hero_subtitle: 'Fatigué de chercher seul? T\'inquiète pas! 50.000+ yeux cherchent pour toi.',
    stats_title: 'Actuellement Actif',
    stat_users: { val: '52 847', label: 'Utilisateurs actifs' },
    stat_spots: { val: '1 234', label: 'Spots actifs' },
    stat_found: { val: '892', label: 'Trouvés aujourd\'hui' },
    stat_time: { val: '3,2 min', label: 'Temps moyen' },
    stats_desc: 'Des milliers de personnes sur la même plateforme! Quelqu\'un verra ton spot et le trouvera.',
    how_works: 'Comment fonctionne la communauté?',
    step1_title: '1. Crée ton Spot',
    step1_desc: 'Décris ce que tu cherches: "Cherche étagère en verre frigo 1980 Arçelik". Plus détaillé, mieux!',
    step1_example_title: 'Bon exemple Spot:',
    step1_example: 'Cherche haut-parleur pour radio Grundig 1985. Modèle: 4090. L\'avais à la maison, perdu. Quelqu\'un peut aider?',
    step2_title: '2. Communauté Reçoit Notification',
    step2_desc: 'Quand spot créé, des milliers de followers catégories reçoivent notif. "Hé! Quelqu\'un cherche étagère frigo, tu sais?"',
    step2_feature1: 'Appariement intelligent: Notification prioritaire personnes intéressées',
    step2_feature2: 'Basé localisation: Utilisateurs zone proche notifiés en premier',
    step2_feature3: 'Suivi catégories: Notifications personnalisées intérêts',
    step3_title: '3. Tout le monde Commence Chercher',
    step3_desc: 'Membres utilisent leurs connaissances, connections, infos locales:',
    step3_person1: { name: 'Mehmet', msg: 'Pense que c\'était à la boutique de mon père, demande demain' },
    step3_person2: { name: 'Ayşe', msg: 'Vu quelque chose semblable marché puces semaine dernière' },
    step3_person3: { name: 'Can', msg: 'Ai ami libraire, vais lui demander' },
    step3_person4: { name: 'Zeynep', msg: 'Mère collectionneuse, juste lui demandé!' },
    step4_title: '4. Quelqu\'un Trouve!',
    step4_desc: 'En moyenne 3,2 minutes quelqu\'un dit "Je trouvé!" Partage photo, location. Tu vas chercher!',
    step4_success_title: '🏆 Histoire Succès:',
    step4_success_quote: 'Cherchais objectif caméra vintage 30 ans. Trouvé 7 minutes! Boutique loisirs autre côté Istanbul. Grâce communauté rêve réalisé!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: 'Trouvé 7 minutes • 23 personnes ont participé',
    why_powerful: 'Pourquoi si puissant?',
    why1_title: 'Géographie Large',
    why1_desc: 'Utilisateurs partout Turquie. Quelqu\'un quelque part.',
    why2_title: 'Savoirs Divers',
    why2_desc: 'Collectionneurs, antiquaires, hobbyistes, commerçants... Chacun sait quelque chose.',
    why3_title: 'Réponse Rapide',
    why3_desc: 'Notifications temps réel = aide en minutes.',
    stats_title_box: 'Statistiques Puissance Communautaire',
    stat_fastest: { title: 'Trouvé Plus Rapide:', value: '42 secondes! "Casque Walkman 1990"' },
    stat_most_participants: { title: 'Plus Participants:', value: '340 personnes cherché même spot' },
    stat_farthest: { title: 'Trouvé Plus Loin:', value: 'Demandé Ankara, Trouvé Trabzon' },
    stat_success_rate: { title: 'Taux Succès:', value: '87% - Plupart spots trouvés!' },
    cta_title: 'Utilise Aussi Puissance Communautaire!',
    cta_desc: 'Peux pas trouver ce tu cherches? 50.000 aident!',
    cta_create: 'Crée Spot',
    cta_help: 'Aide Autres',
  },
  es: {
    hero_title: 'Poder Comunitario',
    hero_subtitle: '¿Cansado de buscar solo? ¡No te preocupes! 50.000+ ojos buscan para ti.',
    stats_title: 'Actualmente Activo',
    stat_users: { val: '52.847', label: 'Usuarios activos' },
    stat_spots: { val: '1.234', label: 'Spots activos' },
    stat_found: { val: '892', label: 'Encontrados hoy' },
    stat_time: { val: '3,2 min', label: 'Tiempo promedio' },
    stats_desc: '¡Miles de personas en la misma plataforma! Alguien verá tu spot y lo encontrará.',
    how_works: '¿Cómo funciona la comunidad?',
    step1_title: '1. Crea tu Spot',
    step1_desc: 'Describe qué buscas: "Busco repisa vidrio refrigerador Arçelik 1980". ¡Cuanto más detallado, mejor!',
    step1_example_title: 'Buen ejemplo Spot:',
    step1_example: 'Busco parlante radio Grundig 1985. Modelo: 4090. Lo tenía pero perdí. ¿Alguien puede ayudar?',
    step2_title: '2. Comunidad Recibe Notificación',
    step2_desc: 'Cuando creas spot, miles siguen categorías reciben notificación. "¡Oye! Alguien busca repisa, ¿sabes?"',
    step2_feature1: 'Coincidencia inteligente: Notificación prioritaria personas interesadas',
    step2_feature2: 'Basado ubicación: Usuarios zona cercana notificados primero',
    step2_feature3: 'Seguimiento categorías: Notificaciones personalizadas intereses',
    step3_title: '3. Todos Comienzan Buscar',
    step3_desc: 'Miembros usan conocimiento, conexiones, info local:',
    step3_person1: { name: 'Mehmet', msg: 'Creo que estaba tienda mi padre, pregunto mañana' },
    step3_person2: { name: 'Ayşe', msg: 'Vi algo similar mercadillo semana pasada' },
    step3_person3: { name: 'Can', msg: 'Tengo amigo librero, le pregunto' },
    step3_person4: { name: 'Zeynep', msg: '¡Mi mamá coleccionista, acabo preguntar!' },
    step4_title: '4. ¡Alguien Encuentra!',
    step4_desc: 'En promedio 3,2 minutos alguien dice "¡Lo encontré!" Comparte foto, ubicación. ¡Tú encuentras!',
    step4_success_title: '🏆 Historia Éxito:',
    step4_success_quote: 'Buscaba lente cámara vintage 30 años. ¡Encontrado 7 minutos! Tienda hobbies otro lado Estambul. ¡Gracias comunidad sueño cumplido!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: '¡Encontrado 7 minutos! • 23 personas participaron',
    why_powerful: '¿Por qué tan poderoso?',
    why1_title: 'Geografía Amplia',
    why1_desc: 'Usuarios toda Turquía. Alguien en cualquier lugar.',
    why2_title: 'Conocimiento Diverso',
    why2_desc: 'Coleccionistas, anticuarios, hobbyistas, comerciantes... Cada quien sabe algo.',
    why3_title: 'Respuesta Rápida',
    why3_desc: 'Notificaciones tiempo real = ayuda minutos.',
    stats_title_box: 'Estadísticas Poder Comunitario',
    stat_fastest: { title: 'Encontrado Más Rápido:', value: '42 segundos! "Audífonos Walkman 1990"' },
    stat_most_participants: { title: 'Más Participantes:', value: '340 personas mismo spot' },
    stat_farthest: { title: 'Encontrado Más Lejos:', value: 'Preguntado Ankara, Encontrado Trabzon' },
    stat_success_rate: { title: 'Tasa Éxito:', value: '87% - ¡Mayoría spots encontrados!' },
    cta_title: '¡Usa Poder Comunitario También!',
    cta_desc: '¿No encuentras? ¡50.000 ayudan!',
    cta_create: 'Crear Spot',
    cta_help: 'Ayuda Otros',
  },
  ru: {
    hero_title: 'Сила Сообщества',
    hero_subtitle: 'Устал искать в одиночку? Не волнуйся! 50.000+ глаз ищут для тебя.',
    stats_title: 'Активно сейчас',
    stat_users: { val: '52 847', label: 'Активные пользователи' },
    stat_spots: { val: '1 234', label: 'Активные объявления' },
    stat_found: { val: '892', label: 'Найдено сегодня' },
    stat_time: { val: '3,2 мин', label: 'Среднее время' },
    stats_desc: 'Тысячи людей на одной платформе! Кто-то увидит твой объект и найдет.',
    how_works: 'Как работает сообщество?',
    step1_title: '1. Создай свой Объект',
    step1_desc: 'Опиши, что ищешь: "Ищу полку из стекла холодильника Arçelik 1980". Чем подробнее, тем лучше!',
    step1_example_title: 'Хороший пример Объекта:',
    step1_example: 'Ищу динамик для радио Grundig 1985. Модель: 4090. Был дома, потерял. Может кто помочь?',
    step2_title: '2. Сообщество Получает Уведомление',
    step2_desc: 'Когда создан объект, тысячи следящих категории получают уведомление. "Эй! Кто-то ищет полку, знаешь?"',
    step2_feature1: 'Умное совпадение: Приоритетное уведомление заинтересованным',
    step2_feature2: 'По локации: Пользователи рядом уведомлены первыми',
    step2_feature3: 'Следование категориям: Персонализированные уведомления',
    step3_title: '3. Все Начинают Искать',
    step3_desc: 'Члены используют знания, связи, местную информацию:',
    step3_person1: { name: 'Mehmet', msg: 'Думаю, было в лавке отца, спрошу завтра' },
    step3_person2: { name: 'Ayşe', msg: 'Видел подобное на барахолке неделю назад' },
    step3_person3: { name: 'Can', msg: 'У меня есть друг букинист, спрошу' },
    step3_person4: { name: 'Zeynep', msg: 'Мама коллекционер, спросил сразу!' },
    step4_title: '4. Кто-то Находит!',
    step4_desc: 'В среднем за 3,2 минуты кто-то говорит "Нашел!" Делится фото, локацией. Ты идешь и находишь!',
    step4_success_title: '🏆 История Успеха:',
    step4_success_quote: 'Искал объектив винтажной камеры 30 лет. Найден за 7 минут! В хобби-лавке на другом конце Стамбула. Благодаря сообществу мечта сбылась!',
    step4_success_author: 'Kerem Y.',
    step4_success_stats: 'Найдено за 7 минут • 23 человека участвовали',
    why_powerful: 'Почему так мощно?',
    why1_title: 'Широкая География',
    why1_desc: 'Пользователи со всей Турции. Везде кто-то есть.',
    why2_title: 'Разнообразные Знания',
    why2_desc: 'Коллекционеры, антикварии, hobbyists, торговцы... Каждый знает что-то.',
    why3_title: 'Быстрый Ответ',
    why3_desc: 'Уведомления в реальном времени = помощь в минуты.',
    stats_title_box: 'Статистика Силы Сообщества',
    stat_fastest: { title: 'Найдено Быстрее:', value: '42 секунды! "Наушники Walkman 1990"' },
    stat_most_participants: { title: 'Больше Участников:', value: '340 человек искали один объект' },
    stat_farthest: { title: 'Найдено Дальше:', value: 'Спросил в Анкаре, Найдено в Трабзоне' },
    stat_success_rate: { title: 'Уровень Успеха:', value: '87% - Большинство найдено!' },
    cta_title: 'Используй Силу Сообщества!',
    cta_desc: 'Не можешь найти? 50.000 помогут!',
    cta_create: 'Создать Объект',
    cta_help: 'Помощь Другим',
  },
} as const

export default function CommunityPowerPage() {
  const locale = useCurrentLocale()
  const t = communityText[locale as keyof typeof communityText] ?? communityText.tr

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.hero_title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.hero_subtitle}</p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">{t.stats_title}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{t.stat_users.val}</div>
                <div className="text-sm opacity-90">{t.stat_users.label}</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{t.stat_spots.val}</div>
                <div className="text-sm opacity-90">{t.stat_spots.label}</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{t.stat_found.val}</div>
                <div className="text-sm opacity-90">{t.stat_found.label}</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold">{t.stat_time.val}</div>
                <div className="text-sm opacity-90">{t.stat_time.label}</div>
              </div>
            </div>
          </div>
          <p className="text-center text-lg opacity-90">{t.stats_desc}</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.how_works}</h2>

          <div className="space-y-6 mb-8">
            {/* Step 1 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">📢</span> {t.step1_title}
              </h3>
              <p className="text-gray-700 mb-3">{t.step1_desc}</p>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-2">{t.step1_example_title}</p>
                <p className="text-gray-600 italic">{t.step1_example}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-l-4 border-indigo-500">
              <h3 className="font-bold text-indigo-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🔔</span> {t.step2_title}
              </h3>
              <p className="text-gray-700 mb-3">{t.step2_desc}</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span>{t.step2_feature1}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span>{t.step2_feature2}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-indigo-600 mt-1">✓</span>
                  <span>{t.step2_feature3}</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🔍</span> {t.step3_title}
              </h3>
              <p className="text-gray-700 mb-3">{t.step3_desc}</p>
              <div className="grid md:grid-cols-2 gap-4">
                {[t.step3_person1, t.step3_person2, t.step3_person3, t.step3_person4].map((person, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="font-semibold text-purple-700 mb-1">{person.name}:</p>
                    <p className="text-sm text-gray-600">"{person.msg}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">🎉</span> {t.step4_title}
              </h3>
              <p className="text-gray-700 mb-3">{t.step4_desc}</p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="font-semibold text-green-700 mb-2">{t.step4_success_title}</p>
                <p className="text-gray-600 italic mb-2">"{t.step4_success_quote}" - {t.step4_success_author}</p>
                <p className="text-sm text-gray-500">✓ {t.step4_success_stats}</p>
              </div>
            </div>
          </div>

          {/* Why Powerful */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.why_powerful}</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="text-4xl mb-3">🌍</div>
              <h4 className="font-bold text-gray-900 mb-2">{t.why1_title}</h4>
              <p className="text-gray-600 text-sm">{t.why1_desc}</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
              <div className="text-4xl mb-3">🧠</div>
              <h4 className="font-bold text-gray-900 mb-2">{t.why2_title}</h4>
              <p className="text-gray-600 text-sm">{t.why2_desc}</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">{t.why3_title}</h4>
              <p className="text-gray-600 text-sm">{t.why3_desc}</p>
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h3 className="font-bold text-yellow-800 text-lg mb-4 flex items-center gap-2">
              <span>💡</span> {t.stats_title_box}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t.stat_fastest.title}</p>
                <p className="text-gray-700 text-sm">{t.stat_fastest.value}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t.stat_most_participants.title}</p>
                <p className="text-gray-700 text-sm">{t.stat_most_participants.value}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t.stat_farthest.title}</p>
                <p className="text-gray-700 text-sm">{t.stat_farthest.value}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{t.stat_success_rate.title}</p>
                <p className="text-gray-700 text-sm">{t.stat_success_rate.value}</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t.cta_title}</h2>
          <p className="text-blue-100 mb-6 text-lg">{t.cta_desc}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/create-spot" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50">
              {t.cta_create}
            </Link>
            <Link href="/spots" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 border-2 border-white">
              {t.cta_help}
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
