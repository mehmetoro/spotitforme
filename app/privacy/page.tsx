'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const privacyText = {
  tr: {
    title: 'SpotItForMe Gizlilik Politikası',
    updated: (d: string) => `Son güncellenme: ${d}`,
    s1h: '1. Giriş',
    s1p: 'SpotItForMe ("Platform") olarak, gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, korunduğunu ve paylaşıldığını açıklar.',
    s2h: '2. Toplanan Veriler',
    s2p: 'Platformu kullanırken şu verileri topluyoruz:',
    s2h1: '2.1. Doğrudan Sağladığınız Veriler:',
    s2l1: ['Ad, soyad (isteğe bağlı)', 'Email adresi', 'Telefon numarası (mağaza hesapları için)', 'İşletme bilgileri (mağaza hesapları için)', 'Profil fotoğrafı (isteğe bağlı)'],
    s2h2: '2.2. Otomatik Toplanan Veriler:',
    s2l2: ['IP adresi ve konum bilgisi', 'Cihaz bilgileri (tarayıcı türü, işletim sistemi)', 'Kullanım verileri (ziyaret edilen sayfalar, tıklamalar)', 'Çerezler (Cookies)'],
    s2h3: '2.3. Kullanıcı İçeriği:',
    s2l3: ["Oluşturduğunuz spot'lar", 'Yüklediğiniz fotoğraflar', 'Yaptığınız yorumlar ve yardımlar', 'Mağaza açıklamaları'],
    s3h: '3. Veri Kullanım Amaçları',
    s3p: 'Topladığımız verileri şu amaçlarla kullanıyoruz:',
    s3l: ['Platform hizmetlerini sağlamak ve iyileştirmek', 'Hesap güvenliğini sağlamak', 'Kullanıcı deneyimini kişiselleştirmek', 'Spot ve yardım bildirimleri göndermek', 'Teknik sorunları çözmek', 'Yasal yükümlülükleri yerine getirmek', 'Platform istatistikleri oluşturmak (anonim)'],
    s4h: '4. Veri Paylaşımı',
    s4p: 'Verilerinizi aşağıdaki durumlarda paylaşabiliriz:',
    s4h1: '4.1. Diğer Kullanıcılarla:',
    s4l1: ['Spot oluşturduğunuzda: Kullanıcı adınız ve spot içeriğiniz', 'Mağaza hesabınızda: İşletme bilgileriniz ve iletişim detayları', 'Yardım ettiğinizde: Kullanıcı adınız ve yardım içeriğiniz'],
    s4h2: '4.2. Üçüncü Taraflarla:',
    s4l2: ['Yasal zorunluluklar gereği', 'Hizmet sağlayıcılarımız (hosting, email, analiz)', 'Platform satışı veya devri durumunda'],
    s5h: '5. Çerezler (Cookies)',
    s5p: 'Platform, kullanıcı deneyimini iyileştirmek için çerezler kullanır.',
    s5l: ['Zorunlu Çerezler: Platformun çalışması için gerekli', 'Performans Çerezleri: Kullanım istatistikleri için', 'İşlevsellik Çerezleri: Tercihlerinizi hatırlamak için'],
    s5note: 'Tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz, ancak bu Platform deneyiminizi etkileyebilir.',
    s6h: '6. Veri Güvenliği',
    s6p: 'Verilerinizi korumak için uygun teknik ve organizasyonel önlemler alıyoruz:',
    s6l: ['Veri şifreleme (SSL/TLS)', 'Güvenli sunucular', 'Erişim kontrolleri', 'Düzenli güvenlik denetimleri'],
    s7h: '7. Veri Saklama Süresi',
    s7p: 'Verilerinizi, hizmet sağlamak için gerekli olduğu sürece saklıyoruz. Hesabınızı sildiğinizde:',
    s7l: ['Kişisel bilgileriniz silinir', "Oluşturduğunuz spot'lar anonim hale getirilir", 'Yasal saklama yükümlülüğü olan veriler saklanmaya devam eder'],
    s8h: '8. KVKK Haklarınız',
    s8p: '6698 sayılı KVKK kapsamında haklarınız:',
    s8l: ['Verilerinizin işlenip işlenmediğini öğrenme', 'Eksik veya yanlış verilerin düzeltilmesini isteme', 'Verilerinizin silinmesini veya yok edilmesini isteme', 'İşlenen verilerin aktarılabileceği kişileri bildirme', 'İtiraz etme'],
    s8contact: 'Haklarınızı kullanmak için:',
    s9h: '9. Çocukların Gizliliği',
    s9p: 'Platform 18 yaşından küçüklerin kullanımına yönelik değildir. Bilmeden çocuklardan veri topladığımızı fark edersek, bu verileri derhal sileriz.',
    s10h: '10. Değişiklikler ve İletişim',
    s10p: 'Bu Gizlilik Politikasını güncelleyebiliriz. Değişiklikler Platform üzerinden duyurulacaktır.',
    s10contact: 'Gizlilik ile ilgili sorularınız için:',
    locale: 'tr-TR',
  },
  en: {
    title: 'SpotItForMe Privacy Policy',
    updated: (d: string) => `Last updated: ${d}`,
    s1h: '1. Introduction',
    s1p: 'At SpotItForMe ("Platform"), we value your privacy. This Privacy Policy explains how your personal data is collected, used, protected, and shared.',
    s2h: '2. Data Collected',
    s2p: 'We collect the following data when you use the Platform:',
    s2h1: '2.1. Data You Provide Directly:',
    s2l1: ['Name (optional)', 'Email address', 'Phone number (for shop accounts)', 'Business information (for shop accounts)', 'Profile photo (optional)'],
    s2h2: '2.2. Automatically Collected Data:',
    s2l2: ['IP address and location information', 'Device information (browser type, OS)', 'Usage data (pages visited, clicks)', 'Cookies'],
    s2h3: '2.3. User Content:',
    s2l3: ['Spots you create', 'Photos you upload', 'Comments and help you provide', 'Store descriptions'],
    s3h: '3. Purposes of Data Use',
    s3p: 'We use the data we collect for the following purposes:',
    s3l: ['Provide and improve Platform services', 'Ensure account security', 'Personalize user experience', 'Send spot and help notifications', 'Resolve technical issues', 'Fulfill legal obligations', 'Generate platform statistics (anonymous)'],
    s4h: '4. Data Sharing',
    s4p: 'We may share your data in the following cases:',
    s4h1: '4.1. With Other Users:',
    s4l1: ['When you create a spot: your username and spot content', 'In your shop account: business info and contact details', 'When you help: your username and help content'],
    s4h2: '4.2. With Third Parties:',
    s4l2: ['As required by law', 'Our service providers (hosting, email, analytics)', 'In case of Platform sale or transfer'],
    s5h: '5. Cookies',
    s5p: 'The Platform uses cookies to improve user experience.',
    s5l: ['Essential Cookies: Required for the Platform to function', 'Performance Cookies: For usage statistics', 'Functionality Cookies: To remember your preferences'],
    s5note: 'You can control cookies through your browser settings, but this may affect your Platform experience.',
    s6h: '6. Data Security',
    s6p: 'We take appropriate technical and organizational measures to protect your data:',
    s6l: ['Data encryption (SSL/TLS)', 'Secure servers', 'Access controls', 'Regular security audits'],
    s7h: '7. Data Retention',
    s7p: 'We retain your data for as long as necessary to provide services. When you delete your account:',
    s7l: ['Your personal information is deleted', 'Spots you created are anonymized', 'Data subject to legal retention obligations continues to be stored'],
    s8h: '8. Your Rights',
    s8p: 'Your rights under applicable data protection law:',
    s8l: ['Learning whether your data is being processed', 'Requesting correction of incomplete or incorrect data', 'Requesting deletion or destruction of your data', 'Being informed of persons data may be transferred to', 'Objecting to processing'],
    s8contact: 'To exercise your rights:',
    s9h: "9. Children's Privacy",
    s9p: 'The Platform is not intended for persons under 18. If we become aware we have inadvertently collected data from children, we will immediately delete it.',
    s10h: '10. Changes and Contact',
    s10p: 'We may update this Privacy Policy. Changes will be announced via the Platform.',
    s10contact: 'For privacy-related questions:',
    locale: 'en-US',
  },
  de: {
    title: 'SpotItForMe Datenschutzrichtlinie',
    updated: (d: string) => `Zuletzt aktualisiert: ${d}`,
    s1h: '1. Einleitung',
    s1p: 'Bei SpotItForMe ("Plattform") schätzen wir Ihre Privatsphäre. Diese Datenschutzrichtlinie erläutert, wie Ihre personenbezogenen Daten erfasst, verwendet, geschützt und weitergegeben werden.',
    s2h: '2. Erhobene Daten',
    s2p: 'Wir erheben folgende Daten bei Nutzung der Plattform:',
    s2h1: '2.1. Von Ihnen bereitgestellte Daten:',
    s2l1: ['Name (optional)', 'E-Mail-Adresse', 'Telefonnummer (für Shop-Konten)', 'Geschäftsinformationen (für Shop-Konten)', 'Profilfoto (optional)'],
    s2h2: '2.2. Automatisch erhobene Daten:',
    s2l2: ['IP-Adresse und Standortinformationen', 'Geräteinformationen (Browsertyp, OS)', 'Nutzungsdaten (besuchte Seiten, Klicks)', 'Cookies'],
    s2h3: '2.3. Nutzerinhalte:',
    s2l3: ['Von Ihnen erstellte Spots', 'Hochgeladene Fotos', 'Kommentare und Hilfe', 'Shop-Beschreibungen'],
    s3h: '3. Zwecke der Datennutzung',
    s3p: 'Wir verwenden die erhobenen Daten für folgende Zwecke:',
    s3l: ['Plattformdienste bereitstellen und verbessern', 'Kontosicherheit gewährleisten', 'Benutzererfahrung personalisieren', 'Benachrichtigungen senden', 'Technische Probleme beheben', 'Gesetzliche Verpflichtungen erfüllen', 'Plattformstatistiken erstellen (anonym)'],
    s4h: '4. Datenweitergabe',
    s4p: 'Wir können Ihre Daten in folgenden Fällen weitergeben:',
    s4h1: '4.1. An andere Nutzer:',
    s4l1: ['Bei Spot-Erstellung: Ihr Benutzername und Spot-Inhalt', 'Im Shop-Konto: Geschäftsinformationen und Kontaktdaten', 'Bei Hilfe: Ihr Benutzername und Hilfe-Inhalt'],
    s4h2: '4.2. An Dritte:',
    s4l2: ['Wie gesetzlich vorgeschrieben', 'Unsere Dienstleister (Hosting, E-Mail, Analyse)', 'Bei Plattformverkauf oder -übertragung'],
    s5h: '5. Cookies',
    s5p: 'Die Plattform verwendet Cookies zur Verbesserung der Nutzererfahrung.',
    s5l: ['Notwendige Cookies: Für die Funktionsfähigkeit der Plattform erforderlich', 'Leistungs-Cookies: Für Nutzungsstatistiken', 'Funktionalitäts-Cookies: Um Ihre Präferenzen zu speichern'],
    s5note: 'Sie können Cookies über Ihre Browsereinstellungen steuern, was jedoch Ihre Plattformerfahrung beeinflussen kann.',
    s6h: '6. Datensicherheit',
    s6p: 'Wir treffen angemessene technische und organisatorische Maßnahmen zum Schutz Ihrer Daten:',
    s6l: ['Datenverschlüsselung (SSL/TLS)', 'Sichere Server', 'Zugriffskontrollen', 'Regelmäßige Sicherheitsprüfungen'],
    s7h: '7. Datenspeicherung',
    s7p: 'Wir speichern Ihre Daten so lange, wie es zur Erbringung der Dienste erforderlich ist. Wenn Sie Ihr Konto löschen:',
    s7l: ['Ihre persönlichen Daten werden gelöscht', 'Von Ihnen erstellte Spots werden anonymisiert', 'Daten mit gesetzlicher Aufbewahrungspflicht werden weiterhin gespeichert'],
    s8h: '8. Ihre Rechte',
    s8p: 'Ihre Rechte gemäß geltendem Datenschutzrecht:',
    s8l: ['Erfahren, ob Ihre Daten verarbeitet werden', 'Berichtigung unvollständiger oder falscher Daten verlangen', 'Löschung oder Vernichtung Ihrer Daten verlangen', 'Über Empfänger der verarbeiteten Daten informiert werden', 'Widerspruch einlegen'],
    s8contact: 'Zur Ausübung Ihrer Rechte:',
    s9h: '9. Datenschutz für Kinder',
    s9p: 'Die Plattform ist nicht für Personen unter 18 Jahren bestimmt. Wenn wir feststellen, dass wir versehentlich Daten von Kindern erhoben haben, löschen wir diese unverzüglich.',
    s10h: '10. Änderungen und Kontakt',
    s10p: 'Wir können diese Datenschutzrichtlinie aktualisieren. Änderungen werden über die Plattform bekannt gegeben.',
    s10contact: 'Bei datenschutzbezogenen Fragen:',
    locale: 'de-DE',
  },
  fr: {
    title: 'Politique de confidentialité de SpotItForMe',
    updated: (d: string) => `Dernière mise à jour : ${d}`,
    s1h: '1. Introduction',
    s1p: 'Chez SpotItForMe (« Plateforme »), nous respectons votre vie privée. Cette politique de confidentialité explique comment vos données personnelles sont collectées, utilisées, protégées et partagées.',
    s2h: '2. Données collectées',
    s2p: 'Nous collectons les données suivantes lorsque vous utilisez la Plateforme :',
    s2h1: '2.1. Données que vous fournissez directement :',
    s2l1: ['Nom (facultatif)', 'Adresse e-mail', 'Numéro de téléphone (pour les comptes boutique)', 'Informations sur l\'entreprise (pour les comptes boutique)', 'Photo de profil (facultatif)'],
    s2h2: '2.2. Données collectées automatiquement :',
    s2l2: ['Adresse IP et informations de localisation', 'Informations sur l\'appareil (navigateur, OS)', 'Données d\'utilisation (pages visitées, clics)', 'Cookies'],
    s2h3: '2.3. Contenu utilisateur :',
    s2l3: ['Spots que vous créez', 'Photos que vous téléchargez', 'Commentaires et aide que vous fournissez', 'Descriptions de boutique'],
    s3h: '3. Finalités de l\'utilisation des données',
    s3p: 'Nous utilisons les données collectées aux fins suivantes :',
    s3l: ['Fournir et améliorer les services de la Plateforme', 'Assurer la sécurité du compte', 'Personnaliser l\'expérience utilisateur', 'Envoyer des notifications de spots et d\'aide', 'Résoudre les problèmes techniques', 'Remplir les obligations légales', 'Générer des statistiques (anonymes)'],
    s4h: '4. Partage des données',
    s4p: 'Nous pouvons partager vos données dans les cas suivants :',
    s4h1: '4.1. Avec d\'autres utilisateurs :',
    s4l1: ['Lors de la création d\'un spot : votre nom d\'utilisateur et contenu', 'Dans votre compte boutique : informations professionnelles et coordonnées', 'Lorsque vous aidez : votre nom d\'utilisateur et contenu'],
    s4h2: '4.2. Avec des tiers :',
    s4l2: ['Comme requis par la loi', 'Nos prestataires de services (hébergement, e-mail, analyse)', 'En cas de vente ou de transfert de la Plateforme'],
    s5h: '5. Cookies',
    s5p: 'La Plateforme utilise des cookies pour améliorer l\'expérience utilisateur.',
    s5l: ['Cookies essentiels : nécessaires au fonctionnement de la Plateforme', 'Cookies de performance : pour les statistiques', 'Cookies de fonctionnalité : pour mémoriser vos préférences'],
    s5note: 'Vous pouvez contrôler les cookies via les paramètres de votre navigateur, ce qui peut affecter votre expérience.',
    s6h: '6. Sécurité des données',
    s6p: 'Nous prenons des mesures appropriées pour protéger vos données :',
    s6l: ['Chiffrement des données (SSL/TLS)', 'Serveurs sécurisés', 'Contrôles d\'accès', 'Audits de sécurité réguliers'],
    s7h: '7. Conservation des données',
    s7p: 'Nous conservons vos données aussi longtemps que nécessaire. Lorsque vous supprimez votre compte :',
    s7l: ['Vos informations personnelles sont supprimées', 'Les spots que vous avez créés sont anonymisés', 'Les données soumises à des obligations légales de conservation continuent d\'être stockées'],
    s8h: '8. Vos droits',
    s8p: 'Vos droits en vertu du droit applicable à la protection des données :',
    s8l: ['Savoir si vos données sont traitées', 'Demander la correction de données incorrectes', 'Demander la suppression de vos données', 'Être informé des destinataires de vos données', 'S\'opposer au traitement'],
    s8contact: 'Pour exercer vos droits :',
    s9h: '9. Confidentialité des enfants',
    s9p: 'La Plateforme n\'est pas destinée aux personnes de moins de 18 ans. Si nous prenons conscience que nous avons collecté des données d\'enfants, nous les supprimerons immédiatement.',
    s10h: '10. Modifications et contact',
    s10p: 'Nous pouvons mettre à jour cette politique. Les modifications seront annoncées via la Plateforme.',
    s10contact: 'Pour les questions relatives à la confidentialité :',
    locale: 'fr-FR',
  },
  es: {
    title: 'Política de privacidad de SpotItForMe',
    updated: (d: string) => `Última actualización: ${d}`,
    s1h: '1. Introducción',
    s1p: 'En SpotItForMe ("Plataforma"), valoramos su privacidad. Esta Política de privacidad explica cómo se recopilan, utilizan, protegen y comparten sus datos personales.',
    s2h: '2. Datos recopilados',
    s2p: 'Recopilamos los siguientes datos cuando usa la Plataforma:',
    s2h1: '2.1. Datos que usted proporciona directamente:',
    s2l1: ['Nombre (opcional)', 'Dirección de correo electrónico', 'Número de teléfono (para cuentas de tienda)', 'Información empresarial (para cuentas de tienda)', 'Foto de perfil (opcional)'],
    s2h2: '2.2. Datos recopilados automáticamente:',
    s2l2: ['Dirección IP e información de ubicación', 'Información del dispositivo (navegador, OS)', 'Datos de uso (páginas visitadas, clics)', 'Cookies'],
    s2h3: '2.3. Contenido del usuario:',
    s2l3: ['Spots que crea', 'Fotos que sube', 'Comentarios y ayuda que proporciona', 'Descripciones de tienda'],
    s3h: '3. Finalidades del uso de datos',
    s3p: 'Usamos los datos recopilados para los siguientes fines:',
    s3l: ['Proporcionar y mejorar los servicios de la Plataforma', 'Garantizar la seguridad de la cuenta', 'Personalizar la experiencia del usuario', 'Enviar notificaciones de spots y ayuda', 'Resolver problemas técnicos', 'Cumplir obligaciones legales', 'Generar estadísticas (anónimas)'],
    s4h: '4. Compartición de datos',
    s4p: 'Podemos compartir sus datos en los siguientes casos:',
    s4h1: '4.1. Con otros usuarios:',
    s4l1: ['Al crear un spot: su nombre de usuario y contenido', 'En su cuenta de tienda: información empresarial y contacto', 'Al ayudar: su nombre de usuario y contenido de ayuda'],
    s4h2: '4.2. Con terceros:',
    s4l2: ['Según lo requiera la ley', 'Nuestros proveedores de servicios (hosting, correo, análisis)', 'En caso de venta o transferencia de la Plataforma'],
    s5h: '5. Cookies',
    s5p: 'La Plataforma utiliza cookies para mejorar la experiencia del usuario.',
    s5l: ['Cookies esenciales: necesarias para el funcionamiento de la Plataforma', 'Cookies de rendimiento: para estadísticas de uso', 'Cookies de funcionalidad: para recordar sus preferencias'],
    s5note: 'Puede controlar las cookies a través de la configuración de su navegador, lo que puede afectar su experiencia.',
    s6h: '6. Seguridad de datos',
    s6p: 'Tomamos las medidas técnicas y organizativas adecuadas para proteger sus datos:',
    s6l: ['Cifrado de datos (SSL/TLS)', 'Servidores seguros', 'Controles de acceso', 'Auditorías de seguridad periódicas'],
    s7h: '7. Retención de datos',
    s7p: 'Conservamos sus datos durante el tiempo necesario. Cuando elimina su cuenta:',
    s7l: ['Su información personal se elimina', 'Los spots que creó se anonimizan', 'Los datos sujetos a obligaciones legales se siguen almacenando'],
    s8h: '8. Sus derechos',
    s8p: 'Sus derechos según la ley de protección de datos aplicable:',
    s8l: ['Saber si se están procesando sus datos', 'Solicitar la corrección de datos incorrectos', 'Solicitar la eliminación de sus datos', 'Ser informado sobre los destinatarios de sus datos', 'Objetar el procesamiento'],
    s8contact: 'Para ejercer sus derechos:',
    s9h: '9. Privacidad de los niños',
    s9p: 'La Plataforma no está destinada a personas menores de 18 años. Si nos damos cuenta de que hemos recopilado datos de niños, los eliminaremos de inmediato.',
    s10h: '10. Cambios y contacto',
    s10p: 'Podemos actualizar esta Política de privacidad. Los cambios se anunciarán a través de la Plataforma.',
    s10contact: 'Para preguntas relacionadas con la privacidad:',
    locale: 'es-ES',
  },
  ru: {
    title: 'Политика конфиденциальности SpotItForMe',
    updated: (d: string) => `Последнее обновление: ${d}`,
    s1h: '1. Введение',
    s1p: 'В SpotItForMe («Платформа») мы ценим вашу конфиденциальность. Настоящая Политика конфиденциальности объясняет, как ваши персональные данные собираются, используются, защищаются и передаются.',
    s2h: '2. Собираемые данные',
    s2p: 'Мы собираем следующие данные при использовании Платформы:',
    s2h1: '2.1. Данные, предоставляемые вами напрямую:',
    s2l1: ['Имя, фамилия (необязательно)', 'Адрес электронной почты', 'Номер телефона (для магазинных аккаунтов)', 'Бизнес-информация (для магазинных аккаунтов)', 'Фото профиля (необязательно)'],
    s2h2: '2.2. Автоматически собираемые данные:',
    s2l2: ['IP-адрес и информация о местоположении', 'Информация об устройстве (браузер, ОС)', 'Данные об использовании (страницы, клики)', 'Файлы cookie'],
    s2h3: '2.3. Пользовательский контент:',
    s2l3: ['Созданные вами споты', 'Загруженные фотографии', 'Комментарии и помощь', 'Описания магазинов'],
    s3h: '3. Цели использования данных',
    s3p: 'Мы используем собранные данные в следующих целях:',
    s3l: ['Предоставление и улучшение услуг Платформы', 'Обеспечение безопасности аккаунта', 'Персонализация пользовательского опыта', 'Отправка уведомлений о спотах и помощи', 'Решение технических проблем', 'Выполнение правовых обязательств', 'Создание статистики (анонимно)'],
    s4h: '4. Передача данных',
    s4p: 'Мы можем передавать ваши данные в следующих случаях:',
    s4h1: '4.1. Другим пользователям:',
    s4l1: ['При создании спота: ваше имя и содержимое спота', 'В аккаунте магазина: бизнес-информация и контактные данные', 'При помощи: ваше имя и содержимое помощи'],
    s4h2: '4.2. Третьим лицам:',
    s4l2: ['По требованию закона', 'Нашим поставщикам услуг (хостинг, почта, аналитика)', 'В случае продажи или передачи Платформы'],
    s5h: '5. Файлы cookie',
    s5p: 'Платформа использует файлы cookie для улучшения пользовательского опыта.',
    s5l: ['Обязательные файлы cookie: необходимы для работы Платформы', 'Файлы cookie производительности: для статистики использования', 'Функциональные файлы cookie: для запоминания ваших предпочтений'],
    s5note: 'Вы можете управлять файлами cookie через настройки браузера, однако это может повлиять на ваш опыт.',
    s6h: '6. Безопасность данных',
    s6p: 'Мы принимаем соответствующие меры для защиты ваших данных:',
    s6l: ['Шифрование данных (SSL/TLS)', 'Защищённые серверы', 'Контроль доступа', 'Регулярные проверки безопасности'],
    s7h: '7. Хранение данных',
    s7p: 'Мы храним ваши данные столько, сколько необходимо. При удалении аккаунта:',
    s7l: ['Ваши личные данные удаляются', 'Созданные вами споты анонимизируются', 'Данные с требованиями о хранении продолжают храниться'],
    s8h: '8. Ваши права',
    s8p: 'Ваши права в соответствии с применимым законодательством о защите данных:',
    s8l: ['Узнать, обрабатываются ли ваши данные', 'Запросить исправление неточных данных', 'Запросить удаление ваших данных', 'Получать уведомления о получателях данных', 'Возражать против обработки'],
    s8contact: 'Для осуществления ваших прав:',
    s9h: '9. Конфиденциальность детей',
    s9p: 'Платформа не предназначена для лиц младше 18 лет. Если мы обнаружим, что случайно собрали данные детей, мы немедленно их удалим.',
    s10h: '10. Изменения и контакт',
    s10p: 'Мы можем обновлять настоящую Политику конфиденциальности. Изменения будут объявлены через Платформу.',
    s10contact: 'По вопросам конфиденциальности:',
    locale: 'ru-RU',
  },
} as const

export default function PrivacyPage() {
  const locale = useCurrentLocale()
  const t = privacyText[locale as keyof typeof privacyText] ?? privacyText.tr
  const dateStr = new Date().toLocaleDateString(t.locale, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-gray-600">{t.updated(dateStr)}</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s1h}</h2>
              <p className="text-gray-700">{t.s1p}</p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s2h}</h2>
              <p className="text-gray-700 mb-4">{t.s2p}</p>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.s2h1}</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s2l1.map((item, i) => <li key={i}>{item}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.s2h2}</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s2l2.map((item, i) => <li key={i}>{item}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.s2h3}</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s2l3.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s3h}</h2>
              <p className="text-gray-700 mb-4">{t.s3p}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s3l.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s4h}</h2>
              <p className="text-gray-700 mb-4">{t.s4p}</p>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.s4h1}</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s4l1.map((item, i) => <li key={i}>{item}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t.s4h2}</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s4l2.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s5h}</h2>
              <p className="text-gray-700 mb-4">{t.s5p}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s5l.map((item, i) => <li key={i}>{item}</li>)}</ul>
              <p className="text-gray-700">{t.s5note}</p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s6h}</h2>
              <p className="text-gray-700 mb-4">{t.s6p}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s6l.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s7h}</h2>
              <p className="text-gray-700 mb-4">{t.s7p}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s7l.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s8h}</h2>
              <p className="text-gray-700 mb-4">{t.s8p}</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">{t.s8l.map((item, i) => <li key={i}>{item}</li>)}</ul>
              <p className="text-gray-700">{t.s8contact} <a href="mailto:spotitformeweb@gmail.com" className="text-blue-600 hover:text-blue-800">spotitformeweb@gmail.com</a></p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s9h}</h2>
              <p className="text-gray-700">{t.s9p}</p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.s10h}</h2>
              <p className="text-gray-700 mb-4">{t.s10p}</p>
              <p className="text-gray-700">{t.s10contact} <a href="mailto:spotitformeweb@gmail.com" className="text-blue-600 hover:text-blue-800">spotitformeweb@gmail.com</a></p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
