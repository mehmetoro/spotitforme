// components/social/CreatePostModal.tsx - SON VERSİYON
'use client'

import { useState, useRef, useEffect } from 'react'
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { getImagePreviewDataUrl, optimizeImageFile } from '@/lib/image-processing'
import { SOCIAL_CATEGORIES } from '@/lib/social-categories'
import { supabase } from '@/lib/supabase'
import LocationSelector from '../LocationSelector'
import { useCurrentLocale, type SupportedLocale } from '@/hooks/useCurrentLocale'

const FORM_TEXT: Record<SupportedLocale, Record<string, string>> = {
  tr: {
    headerSocial: 'Nadir Seyahat',
    headerTrip: 'Seyahat Duragi Ekle',
    photo: 'Fotograf',
    photoAdd: 'Fotograf Ekle',
    title: 'Baslik *',
    titlePlaceholder: "Orn: 1980'ler Sony Walkman kutulu bulundu",
    titleHint: 'Baslikta urun adi, marka veya seri bilgisi gecsin.',
    description: 'Aciklama *',
    descriptionPlaceholder: 'Ne gordun? Anlat...',
    descriptionHint: 'Yer, kondisyon, fiyat ipucu veya neden onemli oldugunu yazmaniz kesfi guclendirir.',
    hashtags: "Hashtag'ler",
    hashtagPlaceholder: '#vintage #kamera',
    add: 'Ekle',
    hashtagRequired: 'En az bir etiket ekleyin: orn. vintage, saat, koleksiyon, walkman.',
    hashtagSuggestions: 'Otomatik etiket onerileri',
    city: 'Sehir',
    category: 'Kategori',
    publicShare: 'Herkese acik paylas',
    rewardTitle: 'Kazanacagin Puan',
    rewardPost: 'Paylasim',
    rewardPhoto: 'Fotograf',
    rewardHashtag: 'Hashtag',
    points: 'puan',
    cancel: 'Iptal',
    adding: 'Ekleniyor...',
    posting: 'Paylasiliyor...',
    submitTrip: 'Duraga Ekle',
    submitSocial: 'Paylas',
    alertTitleSocial: 'Baslik en az 12 karakter olmali. Urun adi, seri veya ayirt edici ifade ekleyin.',
    alertTitleTrip: 'Baslik en az 3 karakter olmali.',
    alertDesc: 'Aciklama en az 40 karakter olmali. Neyi, nerede ve neden paylastiginizi daha detayli yazin.',
    alertHashtag: 'En az 1 etiket ekleyin. Etiketler paylasiminizin kesfedilmesini kolaylastirir.',
    alertLogin: 'Giris yapmalisiniz',
    alertLocation: 'Konum dogrulanamadi. Lutfen adresi daha net yazin veya mevcut konumu kullanin.',
    alertTripAdded: 'Durak paylasimi eklendi!',
    alertPublished: 'Paylasiminiz yayinlandi!',
    alertError: 'Hata',
    defaultFoundContent: 'Bu spotu buldum!',
    defaultContent: 'Paylasim',
  },
  en: {
    headerSocial: 'Rare Travel',
    headerTrip: 'Add Travel Stop',
    photo: 'Photo',
    photoAdd: 'Add Photo',
    title: 'Title *',
    titlePlaceholder: 'Ex: Boxed 1980s Sony Walkman found',
    titleHint: 'Include product name, brand, or series in the title.',
    description: 'Description *',
    descriptionPlaceholder: 'What did you see? Tell us...',
    descriptionHint: 'Adding place, condition, price clue, or why it matters improves discovery.',
    hashtags: 'Hashtags',
    hashtagPlaceholder: '#vintage #camera',
    add: 'Add',
    hashtagRequired: 'Add at least one tag: e.g. vintage, watch, collection, walkman.',
    hashtagSuggestions: 'Suggested tags',
    city: 'City',
    category: 'Category',
    publicShare: 'Public share',
    rewardTitle: 'Points You Will Earn',
    rewardPost: 'Post',
    rewardPhoto: 'Photo',
    rewardHashtag: 'Hashtag',
    points: 'points',
    cancel: 'Cancel',
    adding: 'Adding...',
    posting: 'Posting...',
    submitTrip: 'Add to Stop',
    submitSocial: 'Share',
    alertTitleSocial: 'Title must be at least 12 characters. Include product name, series, or a distinctive phrase.',
    alertTitleTrip: 'Title must be at least 3 characters.',
    alertDesc: 'Description must be at least 40 characters. Explain what, where, and why in more detail.',
    alertHashtag: 'Add at least 1 tag. Tags help your post get discovered.',
    alertLogin: 'You must be logged in',
    alertLocation: 'Location could not be verified. Please provide a clearer address or use current location.',
    alertTripAdded: 'Stop post added!',
    alertPublished: 'Your post has been published!',
    alertError: 'Error',
    defaultFoundContent: 'I found this spot!',
    defaultContent: 'Post',
  },
  de: {
    headerSocial: 'Seltene Reise',
    headerTrip: 'Reisestopp hinzufugen',
    photo: 'Foto',
    photoAdd: 'Foto hinzufugen',
    title: 'Titel *',
    titlePlaceholder: 'Bsp: Sony Walkman aus den 1980ern in OVP gefunden',
    titleHint: 'Titel sollte Produktname, Marke oder Serie enthalten.',
    description: 'Beschreibung *',
    descriptionPlaceholder: 'Was hast du gesehen? Erzahl es...',
    descriptionHint: 'Ort, Zustand, Preis-Hinweis oder Relevanz verbessern die Auffindbarkeit.',
    hashtags: 'Hashtags',
    hashtagPlaceholder: '#vintage #kamera',
    add: 'Hinzufugen',
    hashtagRequired: 'Fuge mindestens ein Tag hinzu: z. B. vintage, uhr, sammlung, walkman.',
    hashtagSuggestions: 'Tag-Vorschlage',
    city: 'Stadt',
    category: 'Kategorie',
    publicShare: 'Offentlich teilen',
    rewardTitle: 'Punkte, die du erhaltst',
    rewardPost: 'Beitrag',
    rewardPhoto: 'Foto',
    rewardHashtag: 'Hashtag',
    points: 'Punkte',
    cancel: 'Abbrechen',
    adding: 'Wird hinzugefugt...',
    posting: 'Wird geteilt...',
    submitTrip: 'Zum Stopp hinzufugen',
    submitSocial: 'Teilen',
    alertTitleSocial: 'Der Titel muss mindestens 12 Zeichen haben.',
    alertTitleTrip: 'Der Titel muss mindestens 3 Zeichen haben.',
    alertDesc: 'Die Beschreibung muss mindestens 40 Zeichen haben.',
    alertHashtag: 'Fuge mindestens 1 Tag hinzu.',
    alertLogin: 'Sie mussen angemeldet sein',
    alertLocation: 'Standort konnte nicht verifiziert werden.',
    alertTripAdded: 'Stopp-Beitrag hinzugefugt!',
    alertPublished: 'Dein Beitrag wurde veroffentlicht!',
    alertError: 'Fehler',
    defaultFoundContent: 'Ich habe diesen Spot gefunden!',
    defaultContent: 'Beitrag',
  },
  fr: {
    headerSocial: 'Voyage Rare',
    headerTrip: 'Ajouter un arret',
    photo: 'Photo',
    photoAdd: 'Ajouter une photo',
    title: 'Titre *',
    titlePlaceholder: 'Ex: Sony Walkman des annees 1980 trouve en boite',
    titleHint: 'Le titre doit inclure le nom du produit, la marque ou la serie.',
    description: 'Description *',
    descriptionPlaceholder: 'Qu avez-vous vu ? Racontez...',
    descriptionHint: 'Lieu, etat, indice de prix ou importance renforcent la decouverte.',
    hashtags: 'Hashtags',
    hashtagPlaceholder: '#vintage #camera',
    add: 'Ajouter',
    hashtagRequired: 'Ajoutez au moins un tag.',
    hashtagSuggestions: 'Suggestions de tags',
    city: 'Ville',
    category: 'Categorie',
    publicShare: 'Partager publiquement',
    rewardTitle: 'Points gagnes',
    rewardPost: 'Publication',
    rewardPhoto: 'Photo',
    rewardHashtag: 'Hashtag',
    points: 'points',
    cancel: 'Annuler',
    adding: 'Ajout en cours...',
    posting: 'Publication...',
    submitTrip: "Ajouter a l'arret",
    submitSocial: 'Partager',
    alertTitleSocial: 'Le titre doit contenir au moins 12 caracteres.',
    alertTitleTrip: 'Le titre doit contenir au moins 3 caracteres.',
    alertDesc: 'La description doit contenir au moins 40 caracteres.',
    alertHashtag: 'Ajoutez au moins 1 tag.',
    alertLogin: 'Vous devez etre connecte',
    alertLocation: 'La localisation n a pas pu etre verifiee.',
    alertTripAdded: 'Arret ajoute !',
    alertPublished: 'Votre publication a ete publiee !',
    alertError: 'Erreur',
    defaultFoundContent: 'J ai trouve ce spot !',
    defaultContent: 'Publication',
  },
  es: {
    headerSocial: 'Viaje Raro',
    headerTrip: 'Agregar parada',
    photo: 'Foto',
    photoAdd: 'Agregar foto',
    title: 'Titulo *',
    titlePlaceholder: 'Ej: Sony Walkman de los 80 encontrado en caja',
    titleHint: 'Incluye nombre de producto, marca o serie en el titulo.',
    description: 'Descripcion *',
    descriptionPlaceholder: 'Que viste? Cuentalo...',
    descriptionHint: 'Lugar, estado, pista de precio o por que importa mejoran el descubrimiento.',
    hashtags: 'Hashtags',
    hashtagPlaceholder: '#vintage #camara',
    add: 'Agregar',
    hashtagRequired: 'Agrega al menos una etiqueta.',
    hashtagSuggestions: 'Sugerencias de etiquetas',
    city: 'Ciudad',
    category: 'Categoria',
    publicShare: 'Compartir publicamente',
    rewardTitle: 'Puntos que ganaras',
    rewardPost: 'Publicacion',
    rewardPhoto: 'Foto',
    rewardHashtag: 'Hashtag',
    points: 'puntos',
    cancel: 'Cancelar',
    adding: 'Agregando...',
    posting: 'Publicando...',
    submitTrip: 'Agregar a parada',
    submitSocial: 'Compartir',
    alertTitleSocial: 'El titulo debe tener al menos 12 caracteres.',
    alertTitleTrip: 'El titulo debe tener al menos 3 caracteres.',
    alertDesc: 'La descripcion debe tener al menos 40 caracteres.',
    alertHashtag: 'Agrega al menos 1 etiqueta.',
    alertLogin: 'Debes iniciar sesion',
    alertLocation: 'No se pudo verificar la ubicacion.',
    alertTripAdded: 'Parada agregada!',
    alertPublished: 'Tu publicacion fue publicada!',
    alertError: 'Error',
    defaultFoundContent: 'Encontre este spot!',
    defaultContent: 'Publicacion',
  },
  ru: {
    headerSocial: 'Redkoe puteshestvie',
    headerTrip: 'Dobavit ostanovku',
    photo: 'Foto',
    photoAdd: 'Dobavit foto',
    title: 'Zagolovok *',
    titlePlaceholder: 'Napr: nayden Sony Walkman 1980-h v korobke',
    titleHint: 'Ukazhite v zagolovke nazvanie tovara, brend ili seriyu.',
    description: 'Opisanie *',
    descriptionPlaceholder: 'Chto vy uvideli? Rasskazhite...',
    descriptionHint: 'Mesto, sostoyanie, cena ili vazhnost uluchshayut obnaruzhenie.',
    hashtags: 'Hashtagi',
    hashtagPlaceholder: '#vintage #kamera',
    add: 'Dobavit',
    hashtagRequired: 'Dobavte hotya by odin teg.',
    hashtagSuggestions: 'Predlozhennye tegi',
    city: 'Gorod',
    category: 'Kategoriya',
    publicShare: 'Publichnaya publikaciya',
    rewardTitle: 'Ballov poluchite',
    rewardPost: 'Publikaciya',
    rewardPhoto: 'Foto',
    rewardHashtag: 'Hashtag',
    points: 'баллов',
    cancel: 'Otmena',
    adding: 'Dobavlenie...',
    posting: 'Publikaciya...',
    submitTrip: 'Dobavit v ostanovku',
    submitSocial: 'Podelitsya',
    alertTitleSocial: 'Zagolovok dolzhen byt ne menee 12 simvolov.',
    alertTitleTrip: 'Zagolovok dolzhen byt ne menee 3 simvolov.',
    alertDesc: 'Opisanie dolzhno byt ne menee 40 simvolov.',
    alertHashtag: 'Dobavte hotya by 1 teg.',
    alertLogin: 'Neobhodimo voiti v sistemu',
    alertLocation: 'Ne udalos podtverdit mestopolozhenie.',
    alertTripAdded: 'Ostanovka dobavlena!',
    alertPublished: 'Vasha publikaciya opublikovana!',
    alertError: 'Oshibka',
    defaultFoundContent: 'Ya nashel etot spot!',
    defaultContent: 'Publikaciya',
  },
}

const CATEGORY_TEXT: Record<SupportedLocale, Record<string, string>> = {
  tr: {},
  en: {
    'Tarihi Yerler': 'Historical Places',
    'Muzeler ve Sergiler': 'Museums and Exhibitions',
    Ibadethane: 'Places of Worship',
    Konaklama: 'Accommodation',
    'Restoran ve Lezzet Duraklari': 'Restaurants and Food Stops',
    'Kafeler ve Kahveciler': 'Cafes and Coffee Shops',
    'Yerel Pazarlar ve Carsilar': 'Local Markets and Bazaars',
    'Antika ve Bit Pazarlari': 'Antique and Flea Markets',
    'Doga Rotalari ve Milli Parklar': 'Nature Routes and National Parks',
    'Kiyi ve Plajlar': 'Coasts and Beaches',
    'Seyir Teraslari ve Manzara Noktalari': 'View Terraces and Scenic Points',
    'Sanat Sokaklari ve Atolyeler': 'Art Streets and Workshops',
    'Festival ve Etkinlik Alanlari': 'Festival and Event Areas',
    'Gece Hayati ve Eglence': 'Nightlife and Entertainment',
    'Koyler ve Kasabalar': 'Villages and Towns',
    'Rota Ustu Duraklar': 'On-Route Stops',
    'Gizli Mekanlar': 'Hidden Places',
    Diger: 'Other',
  },
  de: {},
  fr: {},
  es: {},
  ru: {},
}

export type TripPostModalPayload = {
  title: string
  description: string | null
  imageUrl: string | null
  category: string | null
  locationName: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  hashtags: string[]
}

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
  initialType?: 'rare_sight' | 'spot' | 'found' | 'product'
  parentSpotId?: string
  mode?: 'social' | 'trip_only'
  headerTitle?: string
  submitLabel?: string
  onTripPostCreated?: (payload: TripPostModalPayload) => Promise<void> | void
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onPostCreated,
  initialType,
  parentSpotId,
  mode = 'social',
  headerTitle,
  submitLabel,
  onTripPostCreated,
}: CreatePostModalProps) {
  const locale = useCurrentLocale()
  const t = FORM_TEXT[locale] ?? FORM_TEXT.tr
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const CITY_LIST = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Trabzon'
  ];
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [locationData, setLocationData] = useState<any>(null)
  const [category, setCategory] = useState<string>('') // Kategori
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  // Yeni tipler: rare_sight | spot | found | product
  const [postType, setPostType] = useState<'rare_sight' | 'spot' | 'found' | 'product'>(initialType || 'rare_sight')
  const [rewardAmount, setRewardAmount] = useState<number | ''>('')
  const [isPublicPost, setIsPublicPost] = useState(true) // yalnızca "found" tipi için geçerli
  const [hasIsPublicColumn, setHasIsPublicColumn] = useState<boolean>(true)
  const normalizedTitle = title.trim()
  const normalizedContent = content.trim()
  const isTitleDetailedEnough = normalizedTitle.length >= 12
  const isContentDetailedEnough = normalizedContent.length >= 40
  const suggestedHashtags = suggestHashtagsFromText([title, content, category, location, city]).filter(
    (tag) => !hashtags.includes(tag.replace('#', ''))
  )
  // Konum seçildiğinde şehir bilgisini otomatik doldur
  const handleLocationSelect = (loc: any) => {
    setLocation(loc.address || loc.name || '')
    // city, town, county sırasıyla kontrol et
    let cityValue = loc.city || loc.town || loc.county || ''
    // normalize: küçük harf, trimli
    cityValue = (cityValue || '').trim().toLocaleLowerCase('tr-TR')
    setCity(cityValue)
    setLocationData(loc)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const getCategoryName = (name: string) => {
    const localized = CATEGORY_TEXT[locale]?.[name]
    if (localized) return localized
    if (locale !== 'tr') return CATEGORY_TEXT.en[name] || name
    return name
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      const optimizedFile = await optimizeImageFile(selectedFile)
      const preview = await getImagePreviewDataUrl(optimizedFile)
      setImageFile(optimizedFile)
      setImagePreview(preview)
    } catch {
      alert(`${t.alertError}: image optimization failed.`)
    }

    e.target.value = ''
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace('#', '')
    if (tag && !hashtags.includes(tag)) {
      setHashtags(prev => [...prev, tag])
      setHashtagInput('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(prev => prev.filter(t => t !== tag))
  }

  const addSuggestedHashtag = (tag: string) => {
    const normalizedTag = tag.replace('#', '')
    if (!hashtags.includes(normalizedTag)) {
      setHashtags(prev => [...prev, normalizedTag])
    }
  }

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!imageFile) return null

    const fileName = buildSeoImageFileName({
      folder: 'social',
      userId,
      title: title || content,
      originalName: imageFile.name,
      index: 0,
    })

    const { error: uploadError } = await supabase.storage
      .from('spot-images')
      .upload(fileName, imageFile)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('spot-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async () => {

    if (mode === 'social' && !isTitleDetailedEnough) {
      alert(t.alertTitleSocial)
      return
    }

    if (mode === 'trip_only' && normalizedTitle.length < 3) {
      alert(t.alertTitleTrip)
      return
    }

    if (mode === 'social' && !isContentDetailedEnough) {
      alert(t.alertDesc)
      return
    }

    if (mode === 'social' && hashtags.length === 0) {
      alert(t.alertHashtag)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(t.alertLogin)

      // user_profiles tablosunda user.id var mı kontrol et, yoksa ekle
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (!profile) {
        // Kullanıcı profilini ekle (minimum id ile)
        const { error: insertProfileError } = await supabase.from('user_profiles').insert({ id: user.id }).single();
        if (insertProfileError) {
          console.error('user_profiles insert hatası:', insertProfileError, 'user.id:', user.id);
        } else {
          console.log('user_profiles insert başarılı, user.id:', user.id);
        }
      } else {
        console.log('user_profiles zaten var, user.id:', user.id);
      }

      // 1. Resimleri yükle
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImage(user.id)
        console.log('Yuklenen resim URL:', imageUrl)
      }

      if (mode === 'trip_only') {
        if (!onTripPostCreated) {
          throw new Error('Trip post kaydetme fonksiyonu eksik')
        }

        let selectedAddress = (locationData?.address || locationData?.name || '').trim()
        let resolvedLatitude =
          locationData?.latitude != null
            ? Number(locationData.latitude)
            : locationData?.lat != null
              ? Number(locationData.lat)
              : null
        let resolvedLongitude =
          locationData?.longitude != null
            ? Number(locationData.longitude)
            : locationData?.lng != null
              ? Number(locationData.lng)
              : null
        let resolvedCity = (locationData?.city || city || '').trim() || null

        // Kullanici metni elle girdiyse, adres + koordinati arka planda otomatik tamamla.
        if ((!selectedAddress || resolvedLatitude == null || resolvedLongitude == null) && location.trim()) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}&accept-language=tr`,
              { headers: { 'User-Agent': 'spotitforme/1.0' } },
            )
            const rows = await res.json()
            if (Array.isArray(rows) && rows.length > 0) {
              const first = rows[0] as any
              selectedAddress = String(first?.display_name || location).trim()
              resolvedLatitude = first?.lat != null ? Number(first.lat) : resolvedLatitude
              resolvedLongitude = first?.lon != null ? Number(first.lon) : resolvedLongitude
              if (!resolvedCity) {
                resolvedCity =
                  first?.address?.city ||
                  first?.address?.town ||
                  first?.address?.province ||
                  null
              }
            }
          } catch {
            // Geocode basarisizsa asagida tek ve net hata verilir.
          }
        }

        if (!selectedAddress || resolvedLatitude == null || resolvedLongitude == null) {
          alert(t.alertLocation)
          setLoading(false)
          return
        }

        await onTripPostCreated({
          title: normalizedTitle,
          description: normalizedContent || null,
          imageUrl,
          category: category || null,
          locationName: selectedAddress,
          city: resolvedCity,
          latitude: resolvedLatitude,
          longitude: resolvedLongitude,
          hashtags,
        })

        alert(`✅ ${t.alertTripAdded}`)

        setTitle('')
        setContent('')
        setLocation('')
        setCategory('')
        setHashtags([])
        setHashtagInput('')
        setImageFile(null)
        setImagePreview(null)
        setPostType('rare_sight')
        setRewardAmount('')
        setIsPublicPost(true)
        setCity('')
        setLocationData(null)

        onPostCreated()
        onClose()
        return
      }

      // 2. Post verilerini hazırla
      const postData: any = {
        user_id: user.id,
        title: normalizedTitle,
        content: content || t.defaultContent,
        post_type: postType
      }
      if (parentSpotId) {
        postData.parent_spot_id = parentSpotId
      }

      // türe özel alanlar
      if (postType === 'spot' && rewardAmount !== '' && rewardAmount > 0) {
        postData.reward = rewardAmount
      }
      if (postType === 'found' && hasIsPublicColumn) {
        postData.is_public = isPublicPost
      }

      // Array alanlarını ekle (boş array göndermemeye dikkat et)
      if (imageUrl) {
        postData.images = [imageUrl]
      }

      if (hashtags.length > 0) {
        postData.hashtags = hashtags
      }

      // Opsiyonel alanları ekle

      if (location && location.trim() !== '') {
        postData.location = location
      }
      if (locationData?.latitude != null && locationData?.longitude != null) {
        postData.latitude = Number(locationData.latitude)
        postData.longitude = Number(locationData.longitude)
      }
      if (city && city.trim() !== '') {
        // normalize: küçük harf, trimli
        postData.city = city.trim().toLocaleLowerCase('tr-TR')
      }
      if (category && category.trim() !== '') {
        postData.category = category
      }

      console.log('Gönderilecek veri:', JSON.stringify(postData, null, 2))

      // 3. Post'u oluştur
      const insertPayload: any = { ...postData }
      let { data: newPost, error: postError } = await supabase
        .from('social_posts')
        .insert(insertPayload)
        .select()
        .single()

      // Eski şema uyumu: title kolonu yoksa title'sız tekrar dene
      if (postError?.message?.includes('title')) {
        delete insertPayload.title
        const retry = await supabase
          .from('social_posts')
          .insert(insertPayload)
          .select()
          .single()
        newPost = retry.data
        postError = retry.error
      }

      // Eski şema uyumu: koordinat kolonları yoksa kaldırıp tekrar dene
      if (postError && (postError.message?.includes('latitude') || postError.message?.includes('longitude'))) {
        delete insertPayload.latitude
        delete insertPayload.longitude
        const retryWithoutCoords = await supabase
          .from('social_posts')
          .insert(insertPayload)
          .select()
          .single()
        newPost = retryWithoutCoords.data
        postError = retryWithoutCoords.error
      }

      if (postError) {
        console.error('social_posts insert hatası:', postError, 'user_id:', postData.user_id);
        throw postError
      } else {
        console.log('social_posts insert başarılı, user_id:', postData.user_id);
      }

      // Social post çevirilerini kaydet
      if (newPost?.id) {
        try {
          const translateResponse = await fetch('/api/save-translations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity: 'social_post',
              recordId: newPost.id,
              sourceLanguage: locale,
              title: normalizedTitle || postData.title || 'Social Post',
              description: normalizedContent || postData.content || normalizedTitle || 'Social content',
            }),
          })

          if (!translateResponse.ok) {
            const translateError = await translateResponse.text().catch(() => 'unknown')
            console.error('Social post translation save failed:', translateError)
          }
        } catch {
          // Ana akış başarılıysa çeviri hatası paylaşımı durdurmaz.
        }
      }

      // 3a. Canlı seyahat planına otomatik ekle (aktif session varsa)
      if (mode === 'social' && newPost?.id && locationData?.latitude != null && locationData?.longitude != null) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          const token = session?.access_token
          if (!token) {
            throw new Error('Canli plan token bulunamadi')
          }

          await fetch('/api/rare-travel-plan/live/add-post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              postId: newPost.id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            }),
          })
        } catch (err) {
          console.warn('Canlı plan otomatik ekleme başarısız:', err)
        }
      }

      // 3b. spot bulunan postunu bildirim gönder (sadece 'found' tipi ve parent_spot_id varsa)
      if (postType === 'found' && parentSpotId) {
        try {
          const { data: parent } = await supabase
            .from('social_posts')
            .select('user_id')
            .eq('id', parentSpotId)
            .maybeSingle()
          const spotOwner = parent?.user_id
          if (spotOwner && spotOwner !== user.id) {
            await supabase.from('social_notifications').insert({
              user_id: spotOwner,
              type: 'spot_found',
              actor_id: user.id,
              post_id: parentSpotId,
              message: 'spotunuz için "Ben Gördüm" paylaşımı yapıldı'
            })
          }
        } catch (e) {
          console.warn('Spot owner notification failed', e)
        }
      }

      // 4. Başarılı
      alert(`✅ ${t.alertPublished}`)
      
      // 5. Formu temizle
      setTitle('')
      setContent('')
      setLocation('')
      setCategory('')
      setHashtags([])
      setHashtagInput('')
      setImageFile(null)
      setImagePreview(null)
      setPostType('rare_sight')
      setRewardAmount('')
      setIsPublicPost(true)
      setCity('')
      setLocationData(null)
      
      // 6. Parent'i bilgilendir ve kapat
      onPostCreated()
      onClose()

    } catch (error: any) {
      console.error('Hata:', error)
      alert(`${t.alertError}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const check = async () => {
      try {
        await supabase.from('social_posts').select('is_public').limit(1)
        setHasIsPublicColumn(true)
      } catch (e) {
        console.warn('is_public column not found:', e)
        setHasIsPublicColumn(false)
      }
    }
    check()
  }, [])

  useEffect(() => {
    if (initialType) setPostType(initialType)
    if (parentSpotId) {
      setContent(t.defaultFoundContent)
    }
  }, [initialType, parentSpotId, t.defaultFoundContent])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{headerTitle || (mode === 'trip_only' ? t.headerTrip : t.headerSocial)}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Paylaşım Türü kaldırıldı, sadece discovery için tekli form */}

          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.photo} {imageFile && '(1)'}
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-3 gap-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {!imageFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition"
                >
                  <span className="text-2xl text-gray-400">+</span>
                  <span className="text-xs text-gray-500 mt-1">{t.photoAdd}</span>
                </button>
              )}
            </div>
          </div>




          {/* Konum Seçimi kaldırıldı, sadece şehir zorunlu */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.title}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.titlePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={120}
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <span className={isTitleDetailedEnough ? 'text-emerald-600' : 'text-amber-600'}>
                {t.titleHint}
              </span>
              <span className="text-gray-500">{title.length}/120</span>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {content.length}/500
            </div>
            {!isContentDetailedEnough && content.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t.descriptionHint}
              </p>
            )}
          </div>

          {/* Hashtagler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.hashtags}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                placeholder={t.hashtagPlaceholder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addHashtag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                {t.add}
              </button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {hashtags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeHashtag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {hashtags.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                {t.hashtagRequired}
              </p>
            )}
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">{t.hashtagSuggestions}</p>
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


          {/* Konum Seçici (şehir otomatik) */}
          <div>
            <LocationSelector
              onLocationSelect={handleLocationSelect}
              initialLocation={location}
              required={true}
            />
            {city && (
              <div className="text-xs text-gray-500 mt-1">{t.city}: <b>{city}</b></div>
            )}
          </div>


          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.category}
            </label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {SOCIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  type="button"
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    category === cat.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium text-gray-700 truncate">{getCategoryName(cat.name)}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Spot için ödül alanı kaldırıldı */}

          {/* Ben Gördüm için gizlilik */}
          {postType === 'found' && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isPublicPost}
                onChange={(e) => setIsPublicPost(e.target.checked)}
                className="w-4 h-4 text-blue-600"
                id="isPublicPost"
              />
              <label htmlFor="isPublicPost" className="text-sm font-medium text-gray-700">
                {t.publicShare}
              </label>
            </div>
          )}

          {/* Puan Bilgisi */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">🎉 {t.rewardTitle}</p>
                <p className="text-sm text-green-600">
                  • {t.rewardPost}: 10 {t.points}<br />
                  • {t.rewardPhoto}: +{(imageFile ? 1 : 0) * 5} {t.points}<br />
                  • {t.rewardHashtag}: +{hashtags.length * 2} {t.points}
                </p>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {10 + ((imageFile ? 1 : 0) * 5) + (hashtags.length * 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {mode === 'trip_only' ? t.adding : t.posting}
                </span>
              ) : (
                submitLabel || (mode === 'trip_only' ? t.submitTrip : t.submitSocial)
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}