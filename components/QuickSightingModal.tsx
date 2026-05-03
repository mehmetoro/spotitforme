'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const qsText = {
  tr: {
    imgTooLarge: "Resim boyutu 12MB'dan kucuk olmalidir",
    imgError: 'Resim optimize edilirken bir hata olustu',
    noLocation: 'Lütfen konum seçin',
    noLink: 'Sanal nadir seyahat için ürün linki zorunlu',
    titleReqPhysical: 'Fiziksel paylaşım için başlık zorunlu. En az 10 karakterle ürün adı/model yazın.',
    titleReqVirtual: 'Başlık en az 10 karakter olmalı. Ürün adı, seri veya model bilgisi ekleyin.',
    descRequired: 'Lütfen ne gördüğünüzü yazın',
    hashtagRequired: 'En az 1 hashtag ekleyin. Etiketler paylaşımınızın keşfini artırır.',
    priceInvalid: 'Fiyat bilgisi okunamadı. Lütfen 1139.99 veya 1139,99 formatında girin.',
    modalTitle: '👁️ Nadir Gördüm!',
    modalSubtitle: 'Hızlıca bildirim gönder, puan kazan',
    tabPhysical: 'Fiziksel',
    tabVirtual: 'Sanal',
    labelTitle: 'Başlık *',
    phTitleVirtual: 'Boş bırakırsanız ürün adı otomatik kullanılır',
    phTitlePhysical: 'Örn: Vintage Nikon F2 kamera',
    titleHint: 'Başlıkta marka, seri veya model bilgisi kullanın.',
    labelWhat: 'Ne gördünüz? *',
    phDesc: 'Örn: Vintage Nikon F2 kamera, eski Rolex saat, antika Hereke halısı...',
    labelYourDetail: 'Kendi Detayınız',
    yourDetailNote: '(boş bırakırsanız ürün detayı kullanılır)',
    phVirtualDesc: 'Kondisyon, nadirlik sebebi, satıcı yorumu, tavsiye gibi bilgiler... Yazarsanız ürün özetiyle birlikte kullanılır.',
    labelPrice: '💰 Gördüğünüz Fiyat',
    priceOptional: '(opsiyonel)',
    phPrice: 'Örn: 2500',
    priceHint: 'Etikette veya satıcıdan öğrendiğiniz fiyatı yazın',
    labelProductLink: 'Ürün Linki *',
    previewBtn: 'Önizle',
    phMarketplace: 'Pazar yeri',
    phSeller: 'Satıcı (opsiyonel)',
    phBrand: 'Marka (otomatik gelir)',
    phStock: 'Stok durumu (opsiyonel)',
    phProductDesc: 'Ürün özeti (otomatik gelir, düzenlenebilir)',
    onlineMarket: 'Online pazar',
    miniProductPage: 'Mini Ürün Sayfası',
    productFallback: 'Ürün',
    productSummaryFallback: 'Linkten ürün özeti alındı.',
    brandLabel: 'Marka:',
    sellerLabel: 'Satıcı:',
    stockLabel: 'Durum:',
    labelHashtags: "Hashtag'ler *",
    phHashtags: 'Örn: #vintage #nadir #koleksiyon',
    hashtagHint: 'Boşlukla ayırın. En az 1 hashtag ekleyin.',
    suggestedTags: 'Otomatik etiket önerileri',
    labelCategory: 'Kategori',
    catPlaceholder: 'Kategori seçin (opsiyonel)',
    hasPhotoLabel: '📸 Fotoğrafım var (+10 ekstra puan!)',
    clickToUpload: 'Fotoğraf yüklemek için tıkla',
    uploadHint: 'Ürünün net fotoğrafını çek, daha hızlı bulunsun',
    photoInfo1: '✓ Fotoğraflı bildirimler 2x daha hızlı bulunuyor',
    photoInfo2: '✓ Max 5MB • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Nadir müzeme ekle',
    museumDesc: 'Bu paylaşım müze vitrininizde de yayınlanır. Sonradan profilinizden kaldırabilirsiniz.',
    pointsTitle: '🎯 Toplam Kazanacağınız Puan:',
    pointsUnit: 'PUAN',
    basePoints: 'Temel bildirim:',
    basePointsVal: '5 puan',
    photoPoints: 'Fotoğraf:',
    photoPointsVal: '+10 puan',
    locationPoints: 'Detaylı konum:',
    locationPointsVal: '+5 puan',
    categoryPoints: 'Kategori:',
    categoryPointsVal: '+3 puan',
    noktaTitle: '💠 Nokta İlerlemesi',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Nokta durumu yükleniyor...',
    noktaAfter: 'Bu paylaşım sonrası:',
    noktaSpot: '+1 Spot',
    noktaCongrats: 'Tebrikler! Bu paylaşımda 10 Nokta tamamlanacak ve otomatik 1 Spot kazanacaksınız.',
    noktaRemaining: (n: number) => `Bir sonraki Spot için ${n} Nokta kaldı.`,
    btnLoading: 'Gönderiliyor...',
    btnNoLocation: '📍 Konum Seçin',
    btnNoLink: '🔗 Link Ekleyin',
    btnSubmit: (pts: number) => `Bildir, +1 Nokta ve ${pts} Puan Kazan!`,
    footerNote: 'Bildiriminiz profil sayfanızda ve ana sayfada görünecek',
    successMsg: (pts: number, museum: boolean) => `🎉 Bildiriminiz kaydedildi! +1 Nokta kazandınız. Her 10 Nokta otomatik olarak 1 Spot'a dönüşür. Ayrıca ${pts} puan kazandınız.${museum ? ' Paylaşımınız nadir müzenize eklendi.' : ''}`,
    pendingMsg: 'Paylaşımınız alındı. Ürün bağlantısı otomatik doğrulanamadığı için incelendikten sonra yayınlanacaktır.',
  },
  en: {
    imgTooLarge: 'Image must be smaller than 12MB',
    imgError: 'Error optimizing image',
    noLocation: 'Please select a location',
    noLink: 'Product link is required for virtual sighting',
    titleReqPhysical: 'Title is required. Write at least 10 characters with product name/model.',
    titleReqVirtual: 'Title must be at least 10 characters. Add product name, series or model.',
    descRequired: 'Please describe what you saw',
    hashtagRequired: 'Add at least 1 hashtag. Tags help others discover your post.',
    priceInvalid: 'Price format unreadable. Please enter like 1139.99 or 1139,99.',
    modalTitle: '👁️ I Spotted Rare!',
    modalSubtitle: 'Report quickly, earn points',
    tabPhysical: 'Physical',
    tabVirtual: 'Virtual',
    labelTitle: 'Title *',
    phTitleVirtual: 'Leave blank to use product name automatically',
    phTitlePhysical: 'E.g.: Vintage Nikon F2 camera',
    titleHint: 'Include brand, series or model in the title.',
    labelWhat: 'What did you see? *',
    phDesc: 'E.g.: Vintage Nikon F2 camera, old Rolex watch, antique rug...',
    labelYourDetail: 'Your Details',
    yourDetailNote: '(leave blank to use product details)',
    phVirtualDesc: 'Condition, rarity reason, seller note, recommendation... Will be combined with product summary.',
    labelPrice: '💰 Price You Saw',
    priceOptional: '(optional)',
    phPrice: 'E.g.: 2500',
    priceHint: 'Write the price from the tag or seller',
    labelProductLink: 'Product Link *',
    previewBtn: 'Preview',
    phMarketplace: 'Marketplace',
    phSeller: 'Seller (optional)',
    phBrand: 'Brand (auto-filled)',
    phStock: 'Stock status (optional)',
    phProductDesc: 'Product summary (auto-filled, editable)',
    onlineMarket: 'Online marketplace',
    miniProductPage: 'Mini Product Page',
    productFallback: 'Product',
    productSummaryFallback: 'Product summary fetched from link.',
    brandLabel: 'Brand:',
    sellerLabel: 'Seller:',
    stockLabel: 'Status:',
    labelHashtags: 'Hashtags *',
    phHashtags: 'E.g.: #vintage #rare #collection',
    hashtagHint: 'Separate with spaces. Add at least 1 hashtag.',
    suggestedTags: 'Auto tag suggestions',
    labelCategory: 'Category',
    catPlaceholder: 'Select category (optional)',
    hasPhotoLabel: '📸 I have a photo (+10 extra points!)',
    clickToUpload: 'Click to upload photo',
    uploadHint: 'Take a clear photo for faster discovery',
    photoInfo1: '✓ Reports with photos are found 2x faster',
    photoInfo2: '✓ Max 5MB • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Add to my rare museum',
    museumDesc: 'This post will also appear in your museum showcase. You can remove it from your profile later.',
    pointsTitle: '🎯 Total Points You\'ll Earn:',
    pointsUnit: 'POINTS',
    basePoints: 'Base report:',
    basePointsVal: '5 pts',
    photoPoints: 'Photo:',
    photoPointsVal: '+10 pts',
    locationPoints: 'Detailed location:',
    locationPointsVal: '+5 pts',
    categoryPoints: 'Category:',
    categoryPointsVal: '+3 pts',
    noktaTitle: '💠 Nokta Progress',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Loading nokta balance...',
    noktaAfter: 'After this post:',
    noktaSpot: '+1 Spot',
    noktaCongrats: 'Congrats! This post will complete 10 Nokta and you\'ll automatically earn 1 Spot.',
    noktaRemaining: (n: number) => `${n} Nokta remaining for next Spot.`,
    btnLoading: 'Submitting...',
    btnNoLocation: '📍 Select Location',
    btnNoLink: '🔗 Add Link',
    btnSubmit: (pts: number) => `Report, earn +1 Nokta and ${pts} Points!`,
    footerNote: 'Your report will appear on your profile and the home page',
    successMsg: (pts: number, museum: boolean) => `🎉 Report saved! You earned +1 Nokta. Every 10 Nokta automatically becomes 1 Spot. You also earned ${pts} points.${museum ? ' Your post was added to your rare museum.' : ''}`,
    pendingMsg: 'Your post was received. The product link could not be verified automatically and will be published after review.',
  },
  de: {
    imgTooLarge: 'Bild muss kleiner als 12 MB sein',
    imgError: 'Fehler beim Optimieren des Bildes',
    noLocation: 'Bitte Standort auswählen',
    noLink: 'Produktlink ist für virtuelle Sichtung erforderlich',
    titleReqPhysical: 'Titel erforderlich. Mindestens 10 Zeichen mit Produktname/Modell.',
    titleReqVirtual: 'Titel muss mindestens 10 Zeichen haben. Produktname, Serie oder Modell angeben.',
    descRequired: 'Bitte beschreiben Sie, was Sie gesehen haben',
    hashtagRequired: 'Mindestens 1 Hashtag hinzufügen. Tags helfen bei der Entdeckung.',
    priceInvalid: 'Preisformat nicht lesbar. Bitte wie 1139.99 eingeben.',
    modalTitle: '👁️ Seltenheit gesichtet!',
    modalSubtitle: 'Schnell melden, Punkte verdienen',
    tabPhysical: 'Physisch',
    tabVirtual: 'Virtuell',
    labelTitle: 'Titel *',
    phTitleVirtual: 'Leer lassen für automatischen Produktnamen',
    phTitlePhysical: 'Z.B.: Vintage Nikon F2 Kamera',
    titleHint: 'Marke, Serie oder Modell im Titel angeben.',
    labelWhat: 'Was haben Sie gesehen? *',
    phDesc: 'Z.B.: Vintage Nikon F2 Kamera, alte Rolex Uhr...',
    labelYourDetail: 'Ihre Details',
    yourDetailNote: '(leer lassen für Produktdetails)',
    phVirtualDesc: 'Zustand, Seltenheitsgrund, Verkäuferkommentar, Empfehlung...',
    labelPrice: '💰 Gesehener Preis',
    priceOptional: '(optional)',
    phPrice: 'Z.B.: 2500',
    priceHint: 'Preis vom Etikett oder Verkäufer eingeben',
    labelProductLink: 'Produktlink *',
    previewBtn: 'Vorschau',
    phMarketplace: 'Marktplatz',
    phSeller: 'Verkäufer (optional)',
    phBrand: 'Marke (wird automatisch ausgefüllt)',
    phStock: 'Lagerstatus (optional)',
    phProductDesc: 'Produktbeschreibung (automatisch, bearbeitbar)',
    onlineMarket: 'Online-Marktplatz',
    miniProductPage: 'Mini-Produktseite',
    productFallback: 'Produkt',
    productSummaryFallback: 'Produktbeschreibung vom Link abgerufen.',
    brandLabel: 'Marke:',
    sellerLabel: 'Verkäufer:',
    stockLabel: 'Status:',
    labelHashtags: 'Hashtags *',
    phHashtags: 'Z.B.: #vintage #selten #sammlung',
    hashtagHint: 'Mit Leerzeichen trennen. Mindestens 1 Hashtag.',
    suggestedTags: 'Automatische Tag-Vorschläge',
    labelCategory: 'Kategorie',
    catPlaceholder: 'Kategorie auswählen (optional)',
    hasPhotoLabel: '📸 Ich habe ein Foto (+10 Extrapunkte!)',
    clickToUpload: 'Klicken zum Hochladen',
    uploadHint: 'Klares Foto für schnellere Entdeckung',
    photoInfo1: '✓ Berichte mit Fotos werden 2x schneller gefunden',
    photoInfo2: '✓ Max 5MB • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Zu meinem Museum hinzufügen',
    museumDesc: 'Dieser Beitrag wird auch in Ihrer Museumsvitrine veröffentlicht.',
    pointsTitle: '🎯 Gesamtpunkte:',
    pointsUnit: 'PUNKTE',
    basePoints: 'Basismeldung:',
    basePointsVal: '5 Pkt.',
    photoPoints: 'Foto:',
    photoPointsVal: '+10 Pkt.',
    locationPoints: 'Detailstandort:',
    locationPointsVal: '+5 Pkt.',
    categoryPoints: 'Kategorie:',
    categoryPointsVal: '+3 Pkt.',
    noktaTitle: '💠 Nokta-Fortschritt',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Nokta-Guthaben wird geladen...',
    noktaAfter: 'Nach diesem Beitrag:',
    noktaSpot: '+1 Spot',
    noktaCongrats: 'Herzlichen Glückwunsch! 10 Nokta werden erreicht und Sie erhalten automatisch 1 Spot.',
    noktaRemaining: (n: number) => `Noch ${n} Nokta für den nächsten Spot.`,
    btnLoading: 'Wird gesendet...',
    btnNoLocation: '📍 Standort wählen',
    btnNoLink: '🔗 Link hinzufügen',
    btnSubmit: (pts: number) => `Melden, +1 Nokta und ${pts} Punkte verdienen!`,
    footerNote: 'Ihre Meldung erscheint auf Ihrem Profil und der Startseite',
    successMsg: (pts: number, museum: boolean) => `🎉 Meldung gespeichert! +1 Nokta verdient. Alle 10 Nokta werden automatisch 1 Spot. Sie haben auch ${pts} Punkte verdient.${museum ? ' Ihr Beitrag wurde zu Ihrem Museum hinzugefügt.' : ''}`,
    pendingMsg: 'Ihr Beitrag wurde empfangen. Der Produktlink konnte nicht automatisch verifiziert werden und wird nach Prüfung veröffentlicht.',
  },
  fr: {
    imgTooLarge: "L'image doit être inférieure à 12 Mo",
    imgError: "Erreur lors de l'optimisation de l'image",
    noLocation: 'Veuillez sélectionner un emplacement',
    noLink: 'Lien produit requis pour observation virtuelle',
    titleReqPhysical: 'Titre requis. Au moins 10 caractères avec nom/modèle.',
    titleReqVirtual: 'Le titre doit contenir au moins 10 caractères. Ajoutez nom, série ou modèle.',
    descRequired: 'Veuillez décrire ce que vous avez vu',
    hashtagRequired: 'Ajoutez au moins 1 hashtag. Les tags aident à la découverte.',
    priceInvalid: 'Format de prix illisible. Entrez comme 1139.99.',
    modalTitle: "👁️ J'ai repéré quelque chose de rare!",
    modalSubtitle: 'Signalez rapidement, gagnez des points',
    tabPhysical: 'Physique',
    tabVirtual: 'Virtuel',
    labelTitle: 'Titre *',
    phTitleVirtual: 'Laisser vide pour nom automatique',
    phTitlePhysical: 'Ex: Appareil photo Nikon F2 vintage',
    titleHint: 'Inclure marque, série ou modèle dans le titre.',
    labelWhat: 'Qu\'avez-vous vu ? *',
    phDesc: 'Ex: Appareil Nikon F2 vintage, montre Rolex ancienne...',
    labelYourDetail: 'Vos détails',
    yourDetailNote: '(laisser vide pour les détails du produit)',
    phVirtualDesc: 'Condition, raison de rareté, commentaire vendeur, recommandation...',
    labelPrice: '💰 Prix observé',
    priceOptional: '(optionnel)',
    phPrice: 'Ex: 2500',
    priceHint: "Entrez le prix de l'étiquette ou du vendeur",
    labelProductLink: 'Lien produit *',
    previewBtn: 'Aperçu',
    phMarketplace: 'Marketplace',
    phSeller: 'Vendeur (optionnel)',
    phBrand: 'Marque (rempli automatiquement)',
    phStock: 'État du stock (optionnel)',
    phProductDesc: 'Résumé produit (auto, modifiable)',
    onlineMarket: 'Marketplace en ligne',
    miniProductPage: 'Mini page produit',
    productFallback: 'Produit',
    productSummaryFallback: 'Résumé produit récupéré du lien.',
    brandLabel: 'Marque:',
    sellerLabel: 'Vendeur:',
    stockLabel: 'État:',
    labelHashtags: 'Hashtags *',
    phHashtags: 'Ex: #vintage #rare #collection',
    hashtagHint: 'Séparer par des espaces. Au moins 1 hashtag.',
    suggestedTags: 'Suggestions de tags automatiques',
    labelCategory: 'Catégorie',
    catPlaceholder: 'Sélectionner une catégorie (optionnel)',
    hasPhotoLabel: '📸 J\'ai une photo (+10 points bonus!)',
    clickToUpload: 'Cliquez pour télécharger',
    uploadHint: 'Photo claire pour une découverte plus rapide',
    photoInfo1: '✓ Les rapports avec photos sont trouvés 2x plus vite',
    photoInfo2: '✓ Max 5 Mo • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Ajouter à mon musée rare',
    museumDesc: 'Ce post sera aussi publié dans votre vitrine musée.',
    pointsTitle: '🎯 Points totaux à gagner:',
    pointsUnit: 'POINTS',
    basePoints: 'Rapport de base:',
    basePointsVal: '5 pts',
    photoPoints: 'Photo:',
    photoPointsVal: '+10 pts',
    locationPoints: 'Emplacement détaillé:',
    locationPointsVal: '+5 pts',
    categoryPoints: 'Catégorie:',
    categoryPointsVal: '+3 pts',
    noktaTitle: '💠 Progression Nokta',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Chargement du solde Nokta...',
    noktaAfter: 'Après ce post:',
    noktaSpot: '+1 Spot',
    noktaCongrats: 'Félicitations! 10 Nokta seront atteints et vous obtiendrez automatiquement 1 Spot.',
    noktaRemaining: (n: number) => `${n} Nokta restants pour le prochain Spot.`,
    btnLoading: 'Envoi en cours...',
    btnNoLocation: "📍 Sélectionner l'emplacement",
    btnNoLink: '🔗 Ajouter le lien',
    btnSubmit: (pts: number) => `Signaler, gagner +1 Nokta et ${pts} points!`,
    footerNote: "Votre signalement apparaîtra sur votre profil et la page d'accueil",
    successMsg: (pts: number, museum: boolean) => `🎉 Signalement enregistré! +1 Nokta gagné. Tous les 10 Nokta deviennent automatiquement 1 Spot. Vous avez aussi gagné ${pts} points.${museum ? ' Votre post a été ajouté à votre musée rare.' : ''}`,
    pendingMsg: "Votre post a été reçu. Le lien produit n'a pas pu être vérifié automatiquement et sera publié après examen.",
  },
  es: {
    imgTooLarge: 'La imagen debe ser menor de 12 MB',
    imgError: 'Error al optimizar la imagen',
    noLocation: 'Por favor selecciona una ubicación',
    noLink: 'Se requiere enlace de producto para avistamiento virtual',
    titleReqPhysical: 'Título requerido. Al menos 10 caracteres con nombre/modelo.',
    titleReqVirtual: 'El título debe tener al menos 10 caracteres. Agrega nombre, serie o modelo.',
    descRequired: 'Por favor describe lo que viste',
    hashtagRequired: 'Agrega al menos 1 hashtag. Las etiquetas ayudan a descubrir tu publicación.',
    priceInvalid: 'Formato de precio ilegible. Ingresa como 1139.99.',
    modalTitle: '👁️ ¡Vi algo raro!',
    modalSubtitle: 'Reporta rápido, gana puntos',
    tabPhysical: 'Físico',
    tabVirtual: 'Virtual',
    labelTitle: 'Título *',
    phTitleVirtual: 'Dejar en blanco para nombre automático',
    phTitlePhysical: 'Ej: Cámara Nikon F2 vintage',
    titleHint: 'Incluye marca, serie o modelo en el título.',
    labelWhat: '¿Qué viste? *',
    phDesc: 'Ej: Cámara Nikon F2 vintage, reloj Rolex antiguo...',
    labelYourDetail: 'Tus detalles',
    yourDetailNote: '(dejar en blanco para detalles del producto)',
    phVirtualDesc: 'Condición, razón de rareza, comentario del vendedor, recomendación...',
    labelPrice: '💰 Precio que viste',
    priceOptional: '(opcional)',
    phPrice: 'Ej: 2500',
    priceHint: 'Escribe el precio de la etiqueta o vendedor',
    labelProductLink: 'Enlace de producto *',
    previewBtn: 'Vista previa',
    phMarketplace: 'Mercado',
    phSeller: 'Vendedor (opcional)',
    phBrand: 'Marca (se rellena automáticamente)',
    phStock: 'Estado de stock (opcional)',
    phProductDesc: 'Resumen del producto (auto, editable)',
    onlineMarket: 'Mercado en línea',
    miniProductPage: 'Mini página del producto',
    productFallback: 'Producto',
    productSummaryFallback: 'Resumen del producto obtenido del enlace.',
    brandLabel: 'Marca:',
    sellerLabel: 'Vendedor:',
    stockLabel: 'Estado:',
    labelHashtags: 'Hashtags *',
    phHashtags: 'Ej: #vintage #raro #colección',
    hashtagHint: 'Separar con espacios. Al menos 1 hashtag.',
    suggestedTags: 'Sugerencias de etiquetas automáticas',
    labelCategory: 'Categoría',
    catPlaceholder: 'Seleccionar categoría (opcional)',
    hasPhotoLabel: '📸 Tengo una foto (+10 puntos extra!)',
    clickToUpload: 'Haz clic para subir foto',
    uploadHint: 'Foto clara para descubrimiento más rápido',
    photoInfo1: '✓ Los reportes con fotos se encuentran 2x más rápido',
    photoInfo2: '✓ Máx 5 MB • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Agregar a mi museo raro',
    museumDesc: 'Esta publicación también se publicará en tu vitrina del museo.',
    pointsTitle: '🎯 Puntos totales que ganarás:',
    pointsUnit: 'PUNTOS',
    basePoints: 'Reporte base:',
    basePointsVal: '5 pts',
    photoPoints: 'Foto:',
    photoPointsVal: '+10 pts',
    locationPoints: 'Ubicación detallada:',
    locationPointsVal: '+5 pts',
    categoryPoints: 'Categoría:',
    categoryPointsVal: '+3 pts',
    noktaTitle: '💠 Progreso de Nokta',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Cargando saldo Nokta...',
    noktaAfter: 'Después de esta publicación:',
    noktaSpot: '+1 Spot',
    noktaCongrats: '¡Felicitaciones! Se completarán 10 Nokta y recibirás automáticamente 1 Spot.',
    noktaRemaining: (n: number) => `${n} Nokta restantes para el próximo Spot.`,
    btnLoading: 'Enviando...',
    btnNoLocation: '📍 Seleccionar ubicación',
    btnNoLink: '🔗 Agregar enlace',
    btnSubmit: (pts: number) => `¡Reportar, ganar +1 Nokta y ${pts} puntos!`,
    footerNote: 'Tu reporte aparecerá en tu perfil y la página de inicio',
    successMsg: (pts: number, museum: boolean) => `🎉 ¡Reporte guardado! +1 Nokta ganado. Cada 10 Nokta se convierten automáticamente en 1 Spot. También ganaste ${pts} puntos.${museum ? ' Tu publicación fue añadida a tu museo raro.' : ''}`,
    pendingMsg: 'Tu publicación fue recibida. El enlace del producto no pudo verificarse automáticamente y se publicará tras revisión.',
  },
  ru: {
    imgTooLarge: 'Изображение должно быть меньше 12 МБ',
    imgError: 'Ошибка оптимизации изображения',
    noLocation: 'Пожалуйста, выберите местоположение',
    noLink: 'Ссылка на продукт обязательна для виртуальной находки',
    titleReqPhysical: 'Заголовок обязателен. Минимум 10 символов с названием/моделью.',
    titleReqVirtual: 'Заголовок должен быть не менее 10 символов.',
    descRequired: 'Пожалуйста, опишите что вы видели',
    hashtagRequired: 'Добавьте хотя бы 1 хештег.',
    priceInvalid: 'Формат цены не распознан. Введите как 1139.99.',
    modalTitle: '👁️ Я видел редкое!',
    modalSubtitle: 'Быстро сообщи, зарабатывай баллы',
    tabPhysical: 'Физический',
    tabVirtual: 'Виртуальный',
    labelTitle: 'Заголовок *',
    phTitleVirtual: 'Оставьте пустым для автоматического названия',
    phTitlePhysical: 'Напр.: Винтажная камера Nikon F2',
    titleHint: 'Укажи марку, серию или модель в заголовке.',
    labelWhat: 'Что вы видели? *',
    phDesc: 'Напр.: Винтажная камера Nikon F2, старые часы Rolex...',
    labelYourDetail: 'Ваши детали',
    yourDetailNote: '(оставьте пустым для деталей продукта)',
    phVirtualDesc: 'Состояние, причина редкости, комментарий продавца, рекомендация...',
    labelPrice: '💰 Замеченная цена',
    priceOptional: '(необязательно)',
    phPrice: 'Напр.: 2500',
    priceHint: 'Введите цену с ценника или от продавца',
    labelProductLink: 'Ссылка на продукт *',
    previewBtn: 'Просмотр',
    phMarketplace: 'Площадка',
    phSeller: 'Продавец (необязательно)',
    phBrand: 'Марка (заполнится автоматически)',
    phStock: 'Статус запасов (необязательно)',
    phProductDesc: 'Описание продукта (авто, редактируемое)',
    onlineMarket: 'Онлайн-рынок',
    miniProductPage: 'Мини-страница продукта',
    productFallback: 'Продукт',
    productSummaryFallback: 'Описание продукта получено из ссылки.',
    brandLabel: 'Марка:',
    sellerLabel: 'Продавец:',
    stockLabel: 'Статус:',
    labelHashtags: 'Хештеги *',
    phHashtags: 'Напр.: #винтаж #редкость #коллекция',
    hashtagHint: 'Разделяйте пробелами. Минимум 1 хештег.',
    suggestedTags: 'Автоматические предложения тегов',
    labelCategory: 'Категория',
    catPlaceholder: 'Выбрать категорию (необязательно)',
    hasPhotoLabel: '📸 У меня есть фото (+10 бонусных баллов!)',
    clickToUpload: 'Нажмите для загрузки фото',
    uploadHint: 'Чёткое фото для быстрее обнаружения',
    photoInfo1: '✓ Сообщения с фото находятся в 2x быстрее',
    photoInfo2: '✓ Макс 5 МБ • PNG, JPG, JPEG, WebP',
    museumLabel: '🏛️ Добавить в мой музей редкостей',
    museumDesc: 'Этот пост также будет опубликован в витрине вашего музея.',
    pointsTitle: '🎯 Всего баллов заработаете:',
    pointsUnit: 'БАЛЛОВ',
    basePoints: 'Базовое сообщение:',
    basePointsVal: '5 балл.',
    photoPoints: 'Фото:',
    photoPointsVal: '+10 балл.',
    locationPoints: 'Подробное место:',
    locationPointsVal: '+5 балл.',
    categoryPoints: 'Категория:',
    categoryPointsVal: '+3 балл.',
    noktaTitle: '💠 Прогресс Nokta',
    noktaRatio: '10 Nokta = 1 Spot',
    noktaLoading: 'Загрузка баланса Nokta...',
    noktaAfter: 'После этой публикации:',
    noktaSpot: '+1 Spot',
    noktaCongrats: 'Поздравляем! 10 Nokta будут накоплены и вы автоматически получите 1 Spot.',
    noktaRemaining: (n: number) => `${n} Nokta до следующего Спота.`,
    btnLoading: 'Отправка...',
    btnNoLocation: '📍 Выбрать местоположение',
    btnNoLink: '🔗 Добавить ссылку',
    btnSubmit: (pts: number) => `Сообщить, заработать +1 Nokta и ${pts} баллов!`,
    footerNote: 'Ваше сообщение появится в профиле и на главной странице',
    successMsg: (pts: number, museum: boolean) => `🎉 Сообщение сохранено! +1 Nokta заработано. Каждые 10 Nokta автоматически становятся 1 Spot. Вы также заработали ${pts} баллов.${museum ? ' Ваш пост был добавлен в музей редкостей.' : ''}`,
    pendingMsg: 'Ваш пост получен. Ссылка на продукт не могла быть подтверждена автоматически и будет опубликована после проверки.',
  },
} as const
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { getImagePreviewDataUrl, optimizeImageFile } from '@/lib/image-processing'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import LocationSelector from './LocationSelector'
import AuthModal from './AuthModal'

interface QuickSightingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialSourceType?: 'physical' | 'virtual'
  initialProductUrl?: string
  initialDescription?: string
}

export default function QuickSightingModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialSourceType,
  initialProductUrl,
  initialDescription,
}: QuickSightingModalProps) {
  const router = useRouter()
  const locale = useCurrentLocale()
  const t = qsText[locale as keyof typeof qsText] ?? qsText.tr
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoPreviewUrlRef = useRef('')
  
  const [loading, setLoading] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentNoktaBalance, setCurrentNoktaBalance] = useState<number | null>(null)
  const [sourceType, setSourceType] = useState<'physical' | 'virtual'>('physical')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingWarning, setPendingWarning] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    hashtags: '',
    price: '',
    addToMuseum: false,
    hasPhoto: false,
    product_url: '',
    marketplace: '',
    seller_name: '',
    link_preview_title: '',
    link_preview_image: '',
    link_preview_description: '',
    link_preview_brand: '',
    link_preview_availability: '',
    link_preview_currency: 'TRY',
    source_domain: '',
  })
  const hashtagCount = formData.hashtags
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith('#')).length
  const suggestedHashtags = suggestHashtagsFromText([
    formData.title,
    formData.description,
    formData.link_preview_title,
    formData.link_preview_description,
    formData.category,
    formData.marketplace,
  ]).filter((tag) => !formData.hashtags.includes(tag))

  const commonCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED', 'SAR']
  const selectedCurrency = (formData.link_preview_currency || 'TRY').toUpperCase()
  const currencyOptions = commonCurrencies.includes(selectedCurrency)
    ? commonCurrencies
    : [...commonCurrencies, selectedCurrency]

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    if (code === 'JPY') return '¥'
    if (code === 'CNY') return '¥'
    return `${code} `
  }

  const buildCombinedDetail = (manualDetail: string, previewDetail: string) => {
    const normalizedManual = manualDetail.trim()
    const normalizedPreview = previewDetail.trim()

    if (normalizedManual && normalizedPreview) {
      if (normalizedManual.toLowerCase().includes(normalizedPreview.toLowerCase())) {
        return normalizedManual
      }
      return `${normalizedManual}\n\nUrun detayi: ${normalizedPreview}`
    }

    return normalizedManual || normalizedPreview || ''
  }

  const parsePriceNumber = (value: string) => {
    const text = (value || '').trim()
    if (!text) return null
    const match = text.match(/([0-9]+(?:[\s.,][0-9]+)*)/)
    let numeric = (match?.[1] || '').replace(/\s+/g, '')
    if (!numeric) return null

    const hasComma = numeric.includes(',')
    const hasDot = numeric.includes('.')
    const commaThousandsOnly = /^\d{1,3}(,\d{3})+$/.test(numeric)
    const dotThousandsOnly = /^\d{1,3}(\.\d{3})+$/.test(numeric)

    if (hasComma && hasDot) {
      const lastComma = numeric.lastIndexOf(',')
      const lastDot = numeric.lastIndexOf('.')
      if (lastComma > lastDot) {
        numeric = numeric.replace(/\./g, '').replace(',', '.')
      } else {
        numeric = numeric.replace(/,/g, '')
      }
    } else if (hasComma) {
      if (commaThousandsOnly) {
        numeric = numeric.replace(/,/g, '')
      } else if (/,[0-9]{1,2}$/.test(numeric)) {
        numeric = numeric.replace(/\./g, '').replace(',', '.')
      } else {
        numeric = numeric.replace(/,/g, '')
      }
    } else if (hasDot) {
      if (dotThousandsOnly) {
        numeric = numeric.replace(/\./g, '')
      } else if (/\.[0-9]{1,2}$/.test(numeric)) {
        numeric = numeric.replace(/,/g, '')
      } else {
        numeric = numeric.replace(/\./g, '')
      }
    }

    const parsed = Number(numeric)
    if (!Number.isFinite(parsed) || parsed <= 0) return null
    return parsed
  }

  useEffect(() => {
    if (!isOpen) return

    const incomingUrl = (initialProductUrl || '').trim()
    if (incomingUrl) {
      // Share akışında URL geldiyse form her zaman sanal sekmede açılsın.
      setSourceType('virtual')
    } else if (initialSourceType) {
      setSourceType(initialSourceType)
    }

    if (initialProductUrl || initialDescription) {
      setFormData((prev) => ({
        ...prev,
        product_url: initialProductUrl || prev.product_url,
        title: initialDescription || prev.title,
      }))
    }
  }, [isOpen, initialSourceType, initialProductUrl, initialDescription])

  const fetchLinkPreview = async () => {
    if (!formData.product_url.trim()) return
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(formData.product_url.trim())}`)
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Link okunamadi')

      setFormData((prev) => ({
        ...prev,
        title: prev.title ? prev.title : (payload.title || prev.title),
        description: prev.description ? prev.description : (payload.description || prev.description),
        price: prev.price ? prev.price : (payload.price || prev.price),
        link_preview_title: payload.title || prev.link_preview_title,
        link_preview_image: payload.image || prev.link_preview_image,
        link_preview_description: payload.description || prev.link_preview_description,
        link_preview_brand: payload.brand || prev.link_preview_brand,
        link_preview_availability: payload.availability || prev.link_preview_availability,
        link_preview_currency: payload.currency || prev.link_preview_currency,
        marketplace: payload.marketplace || prev.marketplace,
        seller_name: payload.seller || prev.seller_name,
        product_url: payload.url || prev.product_url,
        source_domain: payload.domain || prev.source_domain,
      }))
    } catch (error: any) {
      alert(error?.message || 'Link onizlemesi alinamadi')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleLocationSelect = (location: any) => {
    setLocationData(location)
  }

  const handlePhotoToggle = (checked: boolean) => {
    setFormData({...formData, hasPhoto: checked})
    if (!checked) {
      setPhotoFile(null)
      setPhotoPreview(null)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 12 * 1024 * 1024) {
        alert(t.imgTooLarge)
        return
      }

      try {
        const optimizedFile = await optimizeImageFile(file)
        const preview = await getImagePreviewDataUrl(optimizedFile)
        setPhotoFile(optimizedFile)
        setPhotoPreview(preview)
      } catch {
        alert(t.imgError)
      }

      e.target.value = ''
    }
  }

  const addSuggestedHashtag = (tag: string) => {
    const currentTags = formData.hashtags.trim()
    if (currentTags.includes(tag)) return
    setFormData({
      ...formData,
      hashtags: currentTags ? `${currentTags} ${tag}` : tag,
    })
  }

  const calculatePoints = () => {
    let points = 5 // Temel puan
    
    if (formData.hasPhoto) points += 10
    if (locationData || sourceType === 'virtual') points += 5
    if (formData.category) points += 3
    
    return points
  }

  // Browser Share API ya da ürünün paylaş özelliğinden URL gelirse, otomatik bilgileri çek
  useEffect(() => {
    if (!isOpen || sourceType !== 'virtual') return
    const incomingUrl = (initialProductUrl || '').trim()
    if (!incomingUrl) return
    if (autoPreviewUrlRef.current === incomingUrl) return

    let isMounted = true
    const autoFetchLinkPreview = async () => {
      if (!isMounted) return
      setPreviewLoading(true)
      try {
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(incomingUrl)}`)
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || 'Bilgi çekilemedi')
        if (!isMounted) return

        setFormData((prev) => ({
          ...prev,
          title: prev.title ? prev.title : (payload.title || prev.title),
          description: prev.description ? prev.description : (payload.description || prev.description),
          price: prev.price ? prev.price : (payload.price || prev.price),
          link_preview_title: payload.title || prev.link_preview_title,
          link_preview_image: payload.image || prev.link_preview_image,
          link_preview_description: payload.description || prev.link_preview_description,
          link_preview_brand: payload.brand || prev.link_preview_brand,
          link_preview_availability: payload.availability || prev.link_preview_availability,
          link_preview_currency: payload.currency || prev.link_preview_currency,
          marketplace: payload.marketplace || prev.marketplace,
          seller_name: payload.seller || prev.seller_name,
          product_url: payload.url || prev.product_url,
          source_domain: payload.domain || prev.source_domain,
        }))
        autoPreviewUrlRef.current = incomingUrl
      } catch (error) {
        console.error('Auto-fetch link preview hatası:', error)
      } finally {
        if (isMounted) setPreviewLoading(false)
      }
    }

    const timeoutId = setTimeout(autoFetchLinkPreview, 200)
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [isOpen, initialProductUrl, sourceType])

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true

    const fetchNoktaBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!isMounted) return

        if (!user) {
          setCurrentNoktaBalance(0)
          return
        }

        const { data: walletData } = await supabase
          .from('spot_wallets')
          .select('nokta_balance')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!isMounted) return
        setCurrentNoktaBalance(walletData?.nokta_balance || 0)
      } catch {
        if (isMounted) setCurrentNoktaBalance(0)
      }
    }

    fetchNoktaBalance()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  const noktaBefore = currentNoktaBalance ?? 0
  const noktaProgressBefore = noktaBefore % 10
  const willConvertToSpot = noktaProgressBefore === 9
  const noktaProgressAfter = willConvertToSpot ? 0 : noktaProgressBefore + 1
  const progressFillPercent = willConvertToSpot ? 100 : (noktaProgressAfter / 10) * 100
  const previewPriceNumber = parsePriceNumber(formData.price)

  const handleSubmit = async () => {
    if (sourceType === 'physical' && !locationData) {
      alert(t.noLocation)
      return
    }

    if (sourceType === 'virtual' && !formData.product_url.trim()) {
      alert(t.noLink)
      return
    }

    const normalizedTitle = (formData.title || '').trim()
    if (sourceType === 'physical' && normalizedTitle.length < 10) {
      alert(t.titleReqPhysical)
      return
    }

    if (sourceType === 'virtual' && normalizedTitle.length < 10 && !formData.link_preview_title.trim()) {
      alert(t.titleReqVirtual)
      return
    }

    if (sourceType === 'physical' && !formData.description.trim()) {
      alert(t.descRequired)
      return
    }

    if (hashtagCount === 0) {
      alert(t.hashtagRequired)
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setShowAuthModal(true)
        return
      }

      let photoUrl = null
      
      // 1. Fotoğraf yükle
      if (photoFile) {
        const fileName = buildSeoImageFileName({
          folder: 'sightings',
          userId: user.id,
          title: formData.title || formData.link_preview_title || formData.description,
          originalName: photoFile.name,
        })
        
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, photoFile)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)
        
        photoUrl = publicUrl
      }
      if (!photoUrl && sourceType === 'virtual' && formData.link_preview_image.trim()) {
        photoUrl = formData.link_preview_image.trim()
      }

      const hasAnyPhoto = Boolean(photoUrl)

      // 2. Quick sighting oluştur
      const basePayload: Record<string, any> = {
        user_id: user.id,
        title: sourceType === 'virtual'
          ? formData.link_preview_title || formData.title || null
          : formData.title || null,
        description: buildCombinedDetail(formData.description, formData.link_preview_description),
        category: formData.category,
        hashtags: formData.hashtags.trim() || null,
        has_photo: hasAnyPhoto || formData.hasPhoto,
        is_in_museum: formData.addToMuseum,
        helper_commission_rate: 15,
        photo_url: photoUrl,
        location_name: sourceType === 'physical' ? locationData.name : (formData.marketplace || formData.source_domain || 'Sanal ortam'),
        address: sourceType === 'physical' ? locationData.address : formData.product_url,
        latitude: sourceType === 'physical' ? locationData.latitude : null,
        longitude: sourceType === 'physical' ? locationData.longitude : null,
        city: sourceType === 'physical' ? locationData.city : null,
        district: sourceType === 'physical' ? locationData.district : null,
        points_earned: calculatePoints(),
        status: 'active',
        source_channel: sourceType,
        product_url: formData.product_url || null,
        marketplace: formData.marketplace || null,
        seller_name: formData.seller_name || null,
        link_preview_title: formData.link_preview_title || null,
        link_preview_image: formData.link_preview_image || null,
        link_preview_description: formData.link_preview_description || null,
        link_preview_brand: formData.link_preview_brand || null,
        link_preview_availability: formData.link_preview_availability || null,
        source_domain: formData.source_domain || null,
      }

      // Pre-publish URL kontrolü (sadece sanal paylaşımlar)
      let isPendingReview = false
      if (sourceType === 'virtual' && formData.product_url.trim()) {
        try {
          const checkRes = await fetch('/api/product-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.product_url.trim() }),
          })
          const checkData = await checkRes.json()
          if (checkData.status === 'active') {
            // Satın alınabilir: direkt yayına al
            basePayload.is_hidden = false
            basePayload.product_check_status = 'active'
          } else {
            // Stokta yok, kaldırılmış, bot engeli vb: manuel onaya at
            basePayload.is_hidden = true
            basePayload.product_check_status = 'pending_review'
            isPendingReview = true
          }
        } catch {
          // Kontrol hatası: manuel onaya at
          basePayload.is_hidden = true
          basePayload.product_check_status = 'pending_review'
          isPendingReview = true
        }
      }

      // Fiyat varsa normalize et; geçersizse kullanıcıyı uyar
      if (formData.price) {
        const parsedPrice = parsePriceNumber(formData.price)
        if (parsedPrice == null) {
          alert(t.priceInvalid)
          setLoading(false)
          return
        }
        basePayload.price = parsedPrice
      }

      basePayload.link_preview_currency = formData.link_preview_currency || null

      let { data: sighting, error: sightingError } = await supabase
        .from('quick_sightings')
        .insert(basePayload)
        .select()
        .single()

      // bazı kolonlar henüz migration almamış olabilir; sadece hata veren alanları kaldırıp tekrar dene
      if (sightingError && (
        sightingError.message?.includes('price') ||
        sightingError.message?.includes('is_in_museum') ||
        sightingError.message?.includes('helper_commission_rate') ||
        sightingError.message?.includes('hashtags')
      )) {
        if (sightingError.message?.includes('price')) delete basePayload.price
        if (sightingError.message?.includes('is_in_museum')) delete basePayload.is_in_museum
        if (sightingError.message?.includes('helper_commission_rate')) delete basePayload.helper_commission_rate
        if (sightingError.message?.includes('hashtags')) delete basePayload.hashtags
        const retry = await supabase
          .from('quick_sightings')
          .insert(basePayload)
          .select()
          .single()
        sighting = retry.data
        sightingError = retry.error
      }

      // Yeni sanal yardım kolonları henüz yoksa sadece ilgili alanları kaldırıp tekrar dene
      if (sightingError && (
        sightingError.message?.includes('product_url') ||
        sightingError.message?.includes('marketplace') ||
        sightingError.message?.includes('seller_name') ||
        sightingError.message?.includes('link_preview_title') ||
        sightingError.message?.includes('link_preview_image') ||
        sightingError.message?.includes('link_preview_description') ||
        sightingError.message?.includes('link_preview_brand') ||
        sightingError.message?.includes('link_preview_availability') ||
        sightingError.message?.includes('link_preview_currency') ||
        sightingError.message?.includes('title') ||
        sightingError.message?.includes('source_domain')
      )) {
        // source_channel KALDIRILMAMALI — hangi sayfada görüneceğini belirler
        if (sightingError.message?.includes('product_url')) delete basePayload.product_url
        if (sightingError.message?.includes('marketplace')) delete basePayload.marketplace
        if (sightingError.message?.includes('seller_name')) delete basePayload.seller_name
        if (sightingError.message?.includes('link_preview_title')) delete basePayload.link_preview_title
        if (sightingError.message?.includes('link_preview_image')) delete basePayload.link_preview_image
        if (sightingError.message?.includes('link_preview_description')) delete basePayload.link_preview_description
        if (sightingError.message?.includes('link_preview_brand')) delete basePayload.link_preview_brand
        if (sightingError.message?.includes('link_preview_availability')) delete basePayload.link_preview_availability
        if (sightingError.message?.includes('link_preview_currency')) delete basePayload.link_preview_currency
        if (sightingError.message?.includes('title')) delete basePayload.title
        if (sightingError.message?.includes('source_domain')) delete basePayload.source_domain

        const retryWithoutVirtualFields = await supabase
          .from('quick_sightings')
          .insert(basePayload)
          .select()
          .single()

        sighting = retryWithoutVirtualFields.data
        sightingError = retryWithoutVirtualFields.error
      }

      if (sightingError) throw sightingError

      const translatedTitle = String(sighting?.title || basePayload.title || formData.title || '').trim()
      const translatedDescription = String(sighting?.description || basePayload.description || '').trim()

      if (sighting?.id && (translatedTitle || translatedDescription)) {
        try {
          await fetch('/api/save-translations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity: 'quick_sighting',
              recordId: sighting.id,
              sourceLanguage: locale,
              title: translatedTitle,
              description: translatedDescription,
            }),
          })
        } catch {
          // Ana kayit basariliysa ceviri hatasi submit akisini bozmaz.
        }
      }

      // 3. Puan ekle (gamification)
      await supabase.rpc('add_user_points', {
        user_id: user.id,
        points_to_add: calculatePoints(),
        activity_type: 'quick_sighting'
      })

      // 4. Badge kontrolü (ilk sighting)
      const { data: reputation } = await supabase
        .from('user_reputation')
        .select('total_sightings')
        .eq('user_id', user.id)
        .single()

      if (reputation?.total_sightings === 1) {
        await supabase.rpc('award_badge', {
          user_id: user.id,
          badge_id: 'first_sighting'
        })
      }

      // 5. Ana sayfada gösterilmek üzere global state'e ekle
      // (Real-time için Supabase Realtime kullanılabilir)
      
      // 6. Social feed'e ekle (opsiyonel)
      if (process.env.NEXT_PUBLIC_ENABLE_SOCIAL === 'true') {
        const socialContent = `"${formData.title || formData.description}" gordum!`
        const { data: socialPost } = await supabase.from('social_posts').insert({
          user_id: user.id,
          post_type: 'rare_sight',
          content: socialContent,
          location: sourceType === 'physical' ? locationData.name : (formData.marketplace || 'Sanal ortam'),
          city: sourceType === 'physical' ? (locationData.city || null) : null,
          district: sourceType === 'physical' ? (locationData.district || null) : null,
          image_urls: photoUrl ? [photoUrl] : [],
          hashtags: ['#nadirgördüm', '#spotitforme']
        }).select('id').maybeSingle()

        if (socialPost?.id) {
          try {
            await fetch('/api/save-translations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                entity: 'social_post',
                recordId: socialPost.id,
                sourceLanguage: locale,
                title: String(formData.title || formData.description || 'Nadir seyahat').trim(),
                description: socialContent,
              }),
            })
          } catch {
            // Ana akis basariliysa ceviri hatasi akisi bozmasin.
          }
        }
      }

      // Başarı mesajı
      alert(t.successMsg(calculatePoints(), formData.addToMuseum))
      
      // Formu sıfırla
      setFormData({
        title: '', description: '', category: '', hashtags: '', price: '', addToMuseum: false, hasPhoto: false,
        product_url: '', marketplace: '', seller_name: '', link_preview_title: '', link_preview_image: '',
        link_preview_description: '', link_preview_brand: '', link_preview_availability: '', link_preview_currency: 'TRY', source_domain: ''
      })
      setLocationData(null)
      setPhotoFile(null)
      setPhotoPreview(null)
      
      // Sanal yardım ise sanal yardımlar sayfasına yönlendir
      if (sourceType === 'virtual') {
        if (isPendingReview) {
          setPendingWarning(t.pendingMsg)
          setLoading(false)
          setTimeout(() => {
            onClose()
            router.push('/virtual-sightings?tab=virtual-helps')
          }, 3000)
          return
        }
        onClose()
        router.push('/virtual-sightings?tab=virtual-helps')
      } else {
        onClose()
        if (onSuccess) onSuccess()
        router.refresh()
      }

    } catch (error: any) {
      console.error('Bildirim hatası:', error)
      alert(`Hata: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          {pendingWarning && (
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⏳ {pendingWarning}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.modalTitle}</h2>
              <p className="text-gray-600">{t.modalSubtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-gray-200 p-1 grid grid-cols-2 gap-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setSourceType('physical')}
              className={`px-3 py-2 text-sm rounded-lg font-semibold ${sourceType === 'physical' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
            >
              {t.tabPhysical}
            </button>
            <button
              type="button"
              onClick={() => setSourceType('virtual')}
              className={`px-3 py-2 text-sm rounded-lg font-semibold ${sourceType === 'virtual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}`}
            >
              {t.tabVirtual}
            </button>
          </div>

          {/* Başlık / Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.labelTitle}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder={sourceType === 'virtual' ? t.phTitleVirtual : t.phTitlePhysical}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {formData.title.length > 0 && formData.title.trim().length < 10 && (
              <p className="text-xs text-amber-600 mt-1">{t.titleHint}</p>
            )}
          </div>

          {sourceType === 'physical' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.labelWhat}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t.phDesc}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
          )}

          {sourceType === 'virtual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.labelYourDetail} <span className="text-gray-400 font-normal">{t.yourDetailNote}</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t.phVirtualDesc}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          )}

          {/* FİYAT ALANI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.labelPrice} <span className="text-gray-400 font-normal">{t.priceOptional}</span>
            </label>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <select
                value={selectedCurrency}
                onChange={(e) => setFormData({ ...formData, link_preview_currency: e.target.value })}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              >
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder={t.phPrice}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.priceHint}</p>
          </div>

          {/* KONUM SEÇİCİ */}
          {sourceType === 'physical' ? (
            <LocationSelector 
              onLocationSelect={handleLocationSelect}
              initialLocation=""
            />
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {t.labelProductLink}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.product_url}
                  onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={fetchLinkPreview}
                  className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={previewLoading || !formData.product_url.trim()}
                >
                  {previewLoading ? '...' : t.previewBtn}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.marketplace}
                  onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                  placeholder={t.phMarketplace}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  placeholder={t.phSeller}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.link_preview_brand}
                  onChange={(e) => setFormData({ ...formData, link_preview_brand: e.target.value })}
                  placeholder={t.phBrand}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.link_preview_availability}
                  onChange={(e) => setFormData({ ...formData, link_preview_availability: e.target.value })}
                  placeholder={t.phStock}
                  className="px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <textarea
                value={formData.link_preview_description}
                onChange={(e) => setFormData({ ...formData, link_preview_description: e.target.value })}
                placeholder={t.phProductDesc}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
              />

              {formData.link_preview_image && (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {formData.marketplace || formData.source_domain || t.onlineMarket}
                    </span>
                    <span className="text-[11px] text-gray-500">{t.miniProductPage}</span>
                  </div>
                  <div className="flex">
                    <div className="w-28 h-28 bg-gray-100 shrink-0">
                      <img src={formData.link_preview_image} alt="Link onizleme" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {formData.title || formData.link_preview_title || t.productFallback}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {formData.link_preview_description || t.productSummaryFallback}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {formData.link_preview_brand && <span>{t.brandLabel} {formData.link_preview_brand}</span>}
                        {formData.seller_name && <span>{t.sellerLabel} {formData.seller_name}</span>}
                        {formData.link_preview_availability && <span>{t.stockLabel} {formData.link_preview_availability}</span>}
                      </div>
                      {previewPriceNumber != null && (
                        <p className="mt-2 text-sm font-bold text-green-700">
                          {getCurrencyPrefix(formData.link_preview_currency)}
                          {previewPriceNumber.toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">
                    {formData.product_url}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.labelHashtags}
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder={t.phHashtags}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">{t.hashtagHint}</p>
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">{t.suggestedTags}</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSuggestedHashtag(tag)}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.labelCategory}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <option value="">{t.catPlaceholder}</option>
              <option value="Antika ve Koleksiyon">Antika ve Koleksiyon</option>
              <option value="Vintage ve Retro">Vintage ve Retro</option>
              <option value="Kitap ve Plak">Kitap ve Plak</option>
              <option value="Oyuncak ve Figür">Oyuncak ve Figür</option>
              <option value="Saat ve Takı">Saat ve Takı</option>
              <option value="Dekorasyon ve Ev">Dekorasyon ve Ev</option>
              <option value="Mutfak ve Zanaat">Mutfak ve Zanaat</option>
              <option value="Giyim ve Aksesuar">Giyim ve Aksesuar</option>
              <option value="Pazar ve Bit Pazarı">Pazar ve Bit Pazarı</option>
              <option value="Sahaf ve Plakçı">Sahaf ve Plakçı</option>
              <option value="Müzayede ve Mezat">Müzayede ve Mezat</option>
              <option value="Müze ve Sergi">Müze ve Sergi</option>
              <option value="Tarihi Çarşı ve Han">Tarihi Çarşı ve Han</option>
              <option value="Yerel Dükkan ve Atölye">Yerel Dükkan ve Atölye</option>
              <option value="Rota Üstü Durak">Rota Üstü Durak</option>
              <option value="Gizli Mekan">Gizli Mekan</option>
              <option value="Fotoğraflık Nokta">Fotoğraflık Nokta</option>
              <option value="Etkinlik ve Festival">Etkinlik ve Festival</option>
              <option value="Kafe ve Mola Noktası">Kafe ve Mola Noktası</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          {/* FOTOĞRAF BÖLÜMÜ */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.hasPhoto}
                onChange={(e) => handlePhotoToggle(e.target.checked)}
                className="w-4 h-4 text-green-600"
                id="hasPhoto"
              />
              <label htmlFor="hasPhoto" className="text-sm font-medium text-gray-700">
                {t.hasPhotoLabel}
              </label>
            </div>

            {formData.hasPhoto && (
              <div className="mt-3">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-green-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition"
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <p className="font-medium">{t.clickToUpload}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t.uploadHint}
                    </p>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  capture="environment"
                />

                <p className="text-xs text-gray-500 mt-2">
                  {t.photoInfo1}<br />
                  {t.photoInfo2}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.addToMuseum}
                onChange={(e) => setFormData({ ...formData, addToMuseum: e.target.checked })}
                className="mt-1 w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-purple-900">
                <span className="font-semibold">{t.museumLabel}</span>
                <span className="block text-purple-700 mt-1">
                  {t.museumDesc}
                </span>
              </span>
            </label>
          </div>

          {/* PUAN HESAPLA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">{t.pointsTitle}</p>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {calculatePoints()} {t.pointsUnit}
                </div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
            <div className="text-sm text-green-700 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>{t.basePoints}</span>
                <span className="font-medium">{t.basePointsVal}</span>
              </div>
              {formData.hasPhoto && (
                <div className="flex justify-between">
                  <span>{t.photoPoints}</span>
                  <span className="font-medium">{t.photoPointsVal}</span>
                </div>
              )}
              {locationData && (
                <div className="flex justify-between">
                  <span>{t.locationPoints}</span>
                  <span className="font-medium">{t.locationPointsVal}</span>
                </div>
              )}
              {formData.category && (
                <div className="flex justify-between">
                  <span>{t.categoryPoints}</span>
                  <span className="font-medium">{t.categoryPointsVal}</span>
                </div>
              )}
            </div>
          </div>

          {/* NOKTA İLERLEME */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-blue-900">{t.noktaTitle}</p>
              <span className="text-sm font-semibold text-blue-700">{t.noktaRatio}</span>
            </div>

            {currentNoktaBalance === null ? (
              <p className="text-sm text-blue-700">{t.noktaLoading}</p>
            ) : (
              <>
                <div className="text-sm text-blue-800 mb-2">
                  {t.noktaAfter} <span className="font-semibold">{noktaProgressAfter}/10 Nokta</span>
                  {willConvertToSpot && <span className="font-semibold"> {t.noktaSpot}</span>}
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressFillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  {willConvertToSpot
                    ? t.noktaCongrats
                    : t.noktaRemaining(10 - noktaProgressAfter)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={handleSubmit}
            disabled={loading || (sourceType === 'physical' ? !locationData : !formData.product_url.trim()) || (sourceType === 'physical' && !formData.description.trim())}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t.btnLoading}
              </span>
            ) : sourceType === 'physical' && !locationData ? (
              t.btnNoLocation
            ) : sourceType === 'virtual' && !formData.product_url.trim() ? (
              t.btnNoLink
            ) : (
              t.btnSubmit(calculatePoints())
            )}
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-3">
            {t.footerNote}
          </p>
        </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
          }}
        />
      )}
    </>
  )
}