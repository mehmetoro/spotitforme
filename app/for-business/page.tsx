// app/for-business/page.tsx - DÜZELTMİŞ
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import { sendBusinessRegistrationEmail } from '@/lib/email-server'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const fbText = {
  tr: { heroTitle: 'İşletmeniz İçin', heroBadge: '🎯 Tamamen Ücretsiz - Sınırsız Spot Oluşturma', feat1Title: 'Binlerce Potansiyel Müşteri', feat1: 'Arayan müşteriler doğrudan size ulaşsın', feat2Title: 'Anında Bildirim', feat2: 'Müşteri aradığında hemen haberdar olun', feat3Title: 'Satışları Artırın', feat3: 'Hedefli müşterilerle satış yapın', formTitleNew: 'Ücretsiz Mağaza Kaydı', formTitleEdit: 'Mağaza Bilgilerini Güncelle', formSubNew: 'Formu doldurun, 2 dakikada mağazanızı açın', formSubEdit: 'Mağaza bilgilerinizi güncelleyin', loginRequired: 'Giriş Yapmanız Gerekiyor', loginDesc: 'Mağaza kaydı için önce giriş yapmalısınız.', loginBtn: 'Giriş Yap / Kayıt Ol', skipBtn: 'Şimdilik Atla', loggedIn: 'Giriş Yapıldı', businessInfo: '🏪 İşletme Bilgileri', shopName: 'İşletme Adı *', shopNamePlaceholder: 'Örn: Retro Eşya Mağazası', shopNameHint: 'Müşterilerin göreceği isim', ownerName: 'Yetkili Kişi Adı *', ownerNameHint: 'İletişim için gerekli', email: 'Email Adresi *', emailHint: 'Onay ve bildirimler için', phone: 'Telefon *', phoneHint: 'Müşterilerin arayabileceği numara', city: 'Şehir *', cityPlaceholder: 'Şehir seçin', cityHint: 'İşletmenizin bulunduğu şehir', bizType: 'İşletme Türü *', addressInfo: '📍 Adres Bilgileri', address: 'Adres', addressHint: 'Müşterilerin bulabilmesi için tam adres', website: 'Website (varsa)', descSection: '📝 İşletme Açıklaması', descLabel: 'Kısa Tanıtım *', descHint: 'Müşteriler bu açıklamayı görecek.', spotsSection: '📊 Tahmini Aktivite', spotsLabel: 'Ayda kaç spot oluşturmayı planlıyorsunuz? *', termsSection: '📜 Koşullar ve Onaylar', acceptTerms: 'Kullanım Koşullarını okudum ve kabul ediyorum', acceptPrivacy: 'Gizlilik Politikasını okudum ve kabul ediyorum', acceptMarketing: 'Yenilik ve kampanya bilgilerini almak istiyorum', submitBtn: 'Mağaza Kaydımı Tamamla', updateBtn: 'Bilgileri Güncelle', successTitleNew: 'Mağaza Kaydınız Alındı!', successTitleEdit: 'Mağaza Bilgileriniz Güncellendi!', successDesc: 'mağazanız için kaydınız başarıyla alındı! 🎉', goPanel: 'Mağaza Paneline Git', createSpot: 'İlk Spot\'unu Oluştur', termsError: 'Lütfen Kullanım Koşulları ve Gizlilik Politikasını kabul edin.', duplicateError: 'Bu email adresiyle zaten bir mağaza kaydı bulunmaktadır.', genericError: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.', shopExists: 'Zaten bir mağazanız var. Mağaza panelinize yönlendiriliyorsunuz.' },
  en: { heroTitle: 'For Your Business', heroBadge: '🎯 Completely Free - Unlimited Spot Creation', feat1Title: 'Thousands of Potential Customers', feat1: 'Searching customers reach you directly', feat2Title: 'Instant Notification', feat2: 'Be notified immediately when a customer searches', feat3Title: 'Boost Sales', feat3: 'Sell to targeted customers', formTitleNew: 'Free Shop Registration', formTitleEdit: 'Update Shop Information', formSubNew: 'Fill the form, open your shop in 2 minutes', formSubEdit: 'Update your shop information', loginRequired: 'Login Required', loginDesc: 'You must log in first to register a shop.', loginBtn: 'Login / Register', skipBtn: 'Skip for Now', loggedIn: 'Logged In', businessInfo: '🏪 Business Information', shopName: 'Business Name *', shopNamePlaceholder: 'e.g. Retro Goods Store', shopNameHint: 'Name customers will see', ownerName: 'Contact Person *', ownerNameHint: 'Required for contact', email: 'Email Address *', emailHint: 'For confirmation and notifications', phone: 'Phone *', phoneHint: 'Number customers can call', city: 'City *', cityPlaceholder: 'Select city', cityHint: 'City where your business is located', bizType: 'Business Type *', addressInfo: '📍 Address Information', address: 'Address', addressHint: 'Full address for customers to find you', website: 'Website (if any)', descSection: '📝 Business Description', descLabel: 'Short Introduction *', descHint: 'Customers will see this description.', spotsSection: '📊 Estimated Activity', spotsLabel: 'How many spots do you plan to create per month? *', termsSection: '📜 Terms & Approvals', acceptTerms: 'I have read and accept the Terms of Use', acceptPrivacy: 'I have read and accept the Privacy Policy', acceptMarketing: 'I want to receive news and campaign information', submitBtn: 'Complete My Registration', updateBtn: 'Update Information', successTitleNew: 'Your Shop Registration Received!', successTitleEdit: 'Your Shop Information Updated!', successDesc: 'registration for your shop was successful! 🎉', goPanel: 'Go to Shop Panel', createSpot: 'Create Your First Spot', termsError: 'Please accept the Terms of Use and Privacy Policy.', duplicateError: 'A shop registration with this email already exists.', genericError: 'An error occurred during registration. Please try again.', shopExists: 'You already have a shop. Redirecting to your shop panel.' },
  de: { heroTitle: 'Für Ihr Unternehmen', heroBadge: '🎯 Völlig kostenlos - Unbegrenzte Spot-Erstellung', feat1Title: 'Tausende potenzielle Kunden', feat1: 'Suchende Kunden erreichen Sie direkt', feat2Title: 'Sofortige Benachrichtigung', feat2: 'Sofort benachrichtigt werden', feat3Title: 'Umsatz steigern', feat3: 'An zielgerichtete Kunden verkaufen', formTitleNew: 'Kostenlose Shop-Registrierung', formTitleEdit: 'Shop-Informationen aktualisieren', formSubNew: 'Formular ausfüllen, Shop in 2 Minuten eröffnen', formSubEdit: 'Ihre Shop-Informationen aktualisieren', loginRequired: 'Anmeldung erforderlich', loginDesc: 'Sie müssen sich zuerst anmelden, um einen Shop zu registrieren.', loginBtn: 'Anmelden / Registrieren', skipBtn: 'Jetzt überspringen', loggedIn: 'Angemeldet', businessInfo: '🏪 Unternehmensinformationen', shopName: 'Unternehmensname *', shopNamePlaceholder: 'z.B. Retro-Waren-Laden', shopNameHint: 'Name, den Kunden sehen', ownerName: 'Kontaktperson *', ownerNameHint: 'Für Kontaktzwecke erforderlich', email: 'E-Mail-Adresse *', emailHint: 'Für Bestätigung und Benachrichtigungen', phone: 'Telefon *', phoneHint: 'Nummer, die Kunden anrufen können', city: 'Stadt *', cityPlaceholder: 'Stadt auswählen', cityHint: 'Stadt Ihres Unternehmens', bizType: 'Unternehmenstyp *', addressInfo: '📍 Adressinformationen', address: 'Adresse', addressHint: 'Vollständige Adresse', website: 'Website (falls vorhanden)', descSection: '📝 Unternehmensbeschreibung', descLabel: 'Kurze Vorstellung *', descHint: 'Kunden sehen diese Beschreibung.', spotsSection: '📊 Geschätzte Aktivität', spotsLabel: 'Wie viele Spots planen Sie pro Monat? *', termsSection: '📜 Bedingungen & Genehmigungen', acceptTerms: 'Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie', acceptPrivacy: 'Ich habe die Datenschutzrichtlinie gelesen und akzeptiere sie', acceptMarketing: 'Ich möchte Neuigkeiten und Kampagneninformationen erhalten', submitBtn: 'Registrierung abschließen', updateBtn: 'Informationen aktualisieren', successTitleNew: 'Ihre Shop-Registrierung erhalten!', successTitleEdit: 'Ihre Shop-Informationen aktualisiert!', successDesc: 'Ihre Shop-Registrierung war erfolgreich! 🎉', goPanel: 'Zum Shop-Panel', createSpot: 'Ersten Spot erstellen', termsError: 'Bitte akzeptieren Sie die Nutzungsbedingungen und Datenschutzrichtlinie.', duplicateError: 'Mit dieser E-Mail-Adresse existiert bereits eine Shop-Registrierung.', genericError: 'Während der Registrierung ist ein Fehler aufgetreten.', shopExists: 'Sie haben bereits einen Shop. Weiterleitung zum Shop-Panel.' },
  fr: { heroTitle: 'Pour votre entreprise', heroBadge: '🎯 Entièrement gratuit - Création illimitée de spots', feat1Title: 'Des milliers de clients potentiels', feat1: 'Les clients qui cherchent vous trouvent directement', feat2Title: 'Notification instantanée', feat2: 'Être notifié immédiatement', feat3Title: 'Augmenter les ventes', feat3: 'Vendre à des clients ciblés', formTitleNew: 'Inscription boutique gratuite', formTitleEdit: 'Mettre à jour les informations', formSubNew: 'Remplissez le formulaire, ouvrez votre boutique en 2 minutes', formSubEdit: 'Mettre à jour vos informations', loginRequired: 'Connexion requise', loginDesc: 'Vous devez vous connecter pour enregistrer une boutique.', loginBtn: 'Se connecter / S\'inscrire', skipBtn: 'Ignorer pour l\'instant', loggedIn: 'Connecté', businessInfo: '🏪 Informations commerciales', shopName: 'Nom de l\'entreprise *', shopNamePlaceholder: 'ex. Boutique Rétro', shopNameHint: 'Nom que les clients verront', ownerName: 'Personne de contact *', ownerNameHint: 'Requis pour le contact', email: 'Adresse e-mail *', emailHint: 'Pour confirmation et notifications', phone: 'Téléphone *', phoneHint: 'Numéro que les clients peuvent appeler', city: 'Ville *', cityPlaceholder: 'Sélectionner la ville', cityHint: 'Ville de votre entreprise', bizType: 'Type d\'entreprise *', addressInfo: '📍 Informations d\'adresse', address: 'Adresse', addressHint: 'Adresse complète', website: 'Site web (si disponible)', descSection: '📝 Description de l\'entreprise', descLabel: 'Présentation courte *', descHint: 'Les clients verront cette description.', spotsSection: '📊 Activité estimée', spotsLabel: 'Combien de spots prévoyez-vous par mois ? *', termsSection: '📜 Conditions et approbations', acceptTerms: 'J\'ai lu et j\'accepte les Conditions d\'utilisation', acceptPrivacy: 'J\'ai lu et j\'accepte la Politique de confidentialité', acceptMarketing: 'Je veux recevoir des informations sur les actualités et promotions', submitBtn: 'Compléter mon inscription', updateBtn: 'Mettre à jour les informations', successTitleNew: 'Votre inscription boutique reçue!', successTitleEdit: 'Vos informations boutique mises à jour!', successDesc: 'votre inscription a été réussie ! 🎉', goPanel: 'Aller au panel boutique', createSpot: 'Créer votre premier spot', termsError: 'Veuillez accepter les Conditions d\'utilisation et la Politique de confidentialité.', duplicateError: 'Une inscription boutique avec cet e-mail existe déjà.', genericError: 'Une erreur s\'est produite lors de l\'inscription.', shopExists: 'Vous avez déjà une boutique. Redirection vers votre panel.' },
  es: { heroTitle: 'Para su negocio', heroBadge: '🎯 Completamente gratis - Creación ilimitada de spots', feat1Title: 'Miles de clientes potenciales', feat1: 'Los clientes que buscan te encuentran directamente', feat2Title: 'Notificación instantánea', feat2: 'Ser notificado inmediatamente', feat3Title: 'Aumentar ventas', feat3: 'Vender a clientes dirigidos', formTitleNew: 'Registro de tienda gratuito', formTitleEdit: 'Actualizar información', formSubNew: 'Rellena el formulario, abre tu tienda en 2 minutos', formSubEdit: 'Actualiza tu información', loginRequired: 'Inicio de sesión requerido', loginDesc: 'Debes iniciar sesión para registrar una tienda.', loginBtn: 'Iniciar sesión / Registrarse', skipBtn: 'Omitir por ahora', loggedIn: 'Sesión iniciada', businessInfo: '🏪 Información del negocio', shopName: 'Nombre del negocio *', shopNamePlaceholder: 'ej. Tienda Retro', shopNameHint: 'Nombre que verán los clientes', ownerName: 'Persona de contacto *', ownerNameHint: 'Requerido para contacto', email: 'Correo electrónico *', emailHint: 'Para confirmación y notificaciones', phone: 'Teléfono *', phoneHint: 'Número que los clientes pueden llamar', city: 'Ciudad *', cityPlaceholder: 'Seleccionar ciudad', cityHint: 'Ciudad de su negocio', bizType: 'Tipo de negocio *', addressInfo: '📍 Información de dirección', address: 'Dirección', addressHint: 'Dirección completa', website: 'Sitio web (si existe)', descSection: '📝 Descripción del negocio', descLabel: 'Presentación corta *', descHint: 'Los clientes verán esta descripción.', spotsSection: '📊 Actividad estimada', spotsLabel: '¿Cuántos spots planea crear por mes? *', termsSection: '📜 Términos y aprobaciones', acceptTerms: 'He leído y acepto los Términos de uso', acceptPrivacy: 'He leído y acepto la Política de privacidad', acceptMarketing: 'Quiero recibir noticias e información de campañas', submitBtn: 'Completar mi registro', updateBtn: 'Actualizar información', successTitleNew: '¡Registro de tienda recibido!', successTitleEdit: '¡Información de tienda actualizada!', successDesc: '¡Tu registro fue exitoso! 🎉', goPanel: 'Ir al panel de tienda', createSpot: 'Crear tu primer spot', termsError: 'Por favor acepta los Términos de uso y la Política de privacidad.', duplicateError: 'Ya existe un registro de tienda con este correo electrónico.', genericError: 'Se produjo un error durante el registro.', shopExists: 'Ya tienes una tienda. Redirigiendo a tu panel.' },
  ru: { heroTitle: 'Для вашего бизнеса', heroBadge: '🎯 Полностью бесплатно - Неограниченное создание спотов', feat1Title: 'Тысячи потенциальных клиентов', feat1: 'Ищущие клиенты находят вас напрямую', feat2Title: 'Мгновенное уведомление', feat2: 'Получать уведомления немедленно', feat3Title: 'Увеличить продажи', feat3: 'Продавать целевым клиентам', formTitleNew: 'Бесплатная регистрация магазина', formTitleEdit: 'Обновить информацию', formSubNew: 'Заполните форму, откройте магазин за 2 минуты', formSubEdit: 'Обновите информацию о магазине', loginRequired: 'Требуется вход', loginDesc: 'Вы должны войти для регистрации магазина.', loginBtn: 'Войти / Зарегистрироваться', skipBtn: 'Пропустить сейчас', loggedIn: 'Вошли', businessInfo: '🏪 Информация о бизнесе', shopName: 'Название компании *', shopNamePlaceholder: 'напр. Ретро магазин', shopNameHint: 'Название, которое увидят клиенты', ownerName: 'Контактное лицо *', ownerNameHint: 'Требуется для связи', email: 'Адрес электронной почты *', emailHint: 'Для подтверждения и уведомлений', phone: 'Телефон *', phoneHint: 'Номер, который могут позвонить клиенты', city: 'Город *', cityPlaceholder: 'Выберите город', cityHint: 'Город вашего бизнеса', bizType: 'Тип бизнеса *', addressInfo: '📍 Информация об адресе', address: 'Адрес', addressHint: 'Полный адрес', website: 'Веб-сайт (если есть)', descSection: '📝 Описание бизнеса', descLabel: 'Краткое представление *', descHint: 'Клиенты увидят это описание.', spotsSection: '📊 Предполагаемая активность', spotsLabel: 'Сколько спотов вы планируете создавать в месяц? *', termsSection: '📜 Условия и согласия', acceptTerms: 'Я прочитал и принимаю Условия использования', acceptPrivacy: 'Я прочитал и принимаю Политику конфиденциальности', acceptMarketing: 'Я хочу получать новости и информацию о кампаниях', submitBtn: 'Завершить регистрацию', updateBtn: 'Обновить информацию', successTitleNew: 'Регистрация магазина получена!', successTitleEdit: 'Информация о магазине обновлена!', successDesc: 'регистрация прошла успешно! 🎉', goPanel: 'Перейти на панель магазина', createSpot: 'Создать первый спот', termsError: 'Пожалуйста, примите Условия использования и Политику конфиденциальности.', duplicateError: 'Регистрация с этим email уже существует.', genericError: 'Произошла ошибка при регистрации.', shopExists: 'У вас уже есть магазин. Перенаправление на панель.' },
} as const

interface ShopFormData {
  shopName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  website: string
  description: string
  businessType: string
  monthlySpots: string
  acceptTerms: boolean
  acceptPrivacy: boolean
  acceptMarketing: boolean
}

export default function ForBusinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === 'true'
  const locale = useCurrentLocale()
  const t = fbText[locale as keyof typeof fbText] ?? fbText.tr
  
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    website: '',
    description: '',
    businessType: 'retail',
    monthlySpots: '20-50',
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [existingShop, setExistingShop] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [authSuccessCallback, setAuthSuccessCallback] = useState<() => void>(() => {})

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      // Kullanıcının mağazası var mı kontrol et
      checkExistingShop(user.id)
      // Forma email ve isim bilgilerini otomatik doldur
      if (!editMode) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          ownerName: user.user_metadata?.name || ''
        }))
      }
    }
  }

  const checkExistingShop = async (userId: string) => {
    const { data: shop } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', userId)
      .single()

    if (shop) {
      setExistingShop(shop)
      if (!editMode) {
        router.push(`/shop/dashboard`)
      } else {
        // Edit modunda formu doldur
        setFormData({
          shopName: shop.shop_name || '',
          ownerName: shop.owner_name || '',
          email: shop.email || '',
          phone: shop.phone || '',
          address: shop.address || '',
          city: shop.city || '',
          website: shop.website || '',
          description: shop.description || '',
          businessType: shop.business_type || 'retail',
          monthlySpots: shop.monthly_capacity || '20-50',
          acceptTerms: true,
          acceptPrivacy: true,
          acceptMarketing: false
        })
      }
    }
  }

  const businessTypes = [
    { id: 'retail', name: 'Perakende Mağaza', icon: '🏪', description: 'Fiziksel veya online mağaza' },
    { id: 'antique', name: 'Antikacı', icon: '🏺', description: 'Antika ve koleksiyon ürünleri' },
    { id: 'collector', name: 'Koleksiyoner', icon: '🎨', description: 'Nadir ve koleksiyonluk ürünler' },
    { id: 'repair', name: 'Tamir Servisi', icon: '🔧', description: 'Onarım ve yedek parça' },
    { id: 'secondhand', name: '2. El Mağaza', icon: '🔄', description: 'İkinci el ürün satışı' },
    { id: 'specialty', name: 'Uzman Mağaza', icon: '🎯', description: 'Özel ürünler (hobi, sanat, vs.)' },
    { id: 'other', name: 'Diğer', icon: '🏢', description: 'Diğer işletme türleri' },
  ]

  const spotRanges = [
    { id: '1-10', name: '1-10 spot/ay', description: 'Yeni başlayanlar için' },
    { id: '10-20', name: '10-20 spot/ay', description: 'Orta ölçekli işletme' },
    { id: '20-50', name: '20-50 spot/ay', description: 'Aktif mağaza' },
    { id: '50-100', name: '50-100 spot/ay', description: 'Büyük ölçekli işletme' },
    { id: '100+', name: '100+ spot/ay', description: 'Çok aktif mağaza' },
  ]

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
    'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin', 'Kayseri', 'Eskişehir',
    'Trabzon', 'Samsun', 'Balıkesir', 'Aydın', 'Muğla', 'Denizli',
    'Tekirdağ', 'Kocaeli', 'Manisa', 'Hatay', 'Sakarya', 'Diyarbakır',
    'Van', 'Malatya', 'Elazığ', 'Erzurum', 'Kahramanmaraş', 'Sivas'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Kullanıcı kontrolü
      if (!user) {
        // Auth modal'ını aç ve form submit callback'ini kaydet
        setAuthSuccessCallback(() => () => handleFormSubmit())
        setShowAuthModal(true)
        setLoading(false)
        return
      }

      // Form submit işlemini yap
      await handleFormSubmit()
      
    } catch (error: any) {
      console.error('Mağaza kaydı hatası:', error)
      
      let errorMessage: string = t.genericError
      
      if (error.message?.includes('unique constraint')) {
        errorMessage = t.duplicateError
      } else if (error.message?.includes('foreign key constraint')) {
        errorMessage = t.genericError
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async () => {
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      alert(t.termsError)
      return
    }

    let result

    if (editMode && existingShop) {
      // Güncelleme modu
      result = await supabase
        .from('shops')
        .update({
          shop_name: formData.shopName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          email: formData.email,
          business_type: formData.businessType,
          monthly_capacity: formData.monthlySpots,
          updated_at: new Date().toISOString(),
          owner_name: formData.ownerName  // EKLENDİ
        })
        .eq('id', existingShop.id)
        .select()
        .single()
    } else {
      // Yeni kayıt
      result = await supabase
        .from('shops')
        .insert({
          owner_id: user.id,
          shop_name: formData.shopName,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          website: formData.website || null,
          email: formData.email,
          business_type: formData.businessType,
          monthly_capacity: formData.monthlySpots,
          subscription_type: 'free',
          is_verified: false,
          verification_status: 'pending',
          owner_name: formData.ownerName
        })
        .select()
        .single()
    }

    if (result.error) {
      // Mağaza zaten var mı kontrol et
      if (result.error.code === '23505') {
        const { data: existing } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single()
        
        if (existing) {
          alert(t.shopExists)
          router.push(`/shop/dashboard`)
          return
        }
      }
      
      // Daha detaylı hata mesajı
      console.error('Supabase error:', result.error)
      throw new Error(`Supabase error: ${result.error.message} (code: ${result.error.code})`)
    }

    // Email gönder (yeni kayıt için)
    if (!editMode) {
      try {
        await sendBusinessRegistrationEmail(
          formData.email, 
          formData.shopName, 
          user.id
        )
      } catch (emailError) {
        console.warn('Email gönderilemedi:', emailError)
        // Email hatası form submit işlemini durdurmaz
      }
    }

    // Başarılı
    setSubmitted(true)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    checkUser() // Kullanıcı bilgilerini yenile
    
    // Auth başarılı olduktan sonra kaydedilen callback'i çalıştır
    if (authSuccessCallback) {
      setTimeout(() => {
        authSuccessCallback()
      }, 500) // Kısa bir bekleme süresi
    }
  }

  const handleSkipForNow = () => {
    router.push('/spots')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              ✅
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {editMode ? t.successTitleEdit : t.successTitleNew}
            </h1>
            
            <p className="text-gray-600 mb-8">
              <strong>{formData.shopName}</strong> {t.successDesc}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => router.push('/shop/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg"
              >
                {t.goPanel}
              </button>
              
              <button
                onClick={() => router.push('/create-spot')}
                className="w-full bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-bold py-4 px-8 rounded-xl text-lg"
              >
                {t.createSpot}
              </button>
              
              <button
                onClick={() => {
                  setSubmitted(false)
                  if (editMode) {
                    router.push('/for-business')
                  }
                }}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                {editMode ? 'Başka Bir Mağaza Düzenle' : 'Yeni Mağaza Kaydı Oluştur'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.heroTitle} <span className="text-blue-600">SpotItForMe</span>
          </h1>
          
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            {t.heroBadge}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">👁️</div>
              <h3 className="font-bold text-gray-900 mb-2">{t.feat1Title}</h3>
              <p className="text-gray-600 text-sm">{t.feat1}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">{t.feat2Title}</h3>
              <p className="text-gray-600 text-sm">{t.feat2}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="font-bold text-gray-900 mb-2">{t.feat3Title}</h3>
              <p className="text-gray-600 text-sm">{t.feat3}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <h2 className="text-3xl font-bold mb-2">
                {editMode ? t.formTitleEdit : t.formTitleNew}
              </h2>
              <p className="opacity-90">
                {editMode ? t.formSubEdit : t.formSubNew}
              </p>
            </div>

            {/* User Status */}
            {!user && (
              <div className="mx-8 my-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">🔒</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t.loginRequired}</h3>
                    <p className="text-gray-600 text-sm">
                      {t.loginDesc}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => {
                      setAuthSuccessCallback(() => () => {}) // Boş callback
                      setShowAuthModal(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                  >
                    {t.loginBtn}
                  </button>
                  
                  <button
                    onClick={handleSkipForNow}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg"
                  >
                    {t.skipBtn}
                  </button>
                </div>
              </div>
            )}

            {user && (
              <div className="mx-8 my-6 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-2xl mr-4">✅</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t.loggedIn}</h3>
                    <p className="text-gray-600 text-sm">
                      {user.email} olarak giriş yaptınız. Mağaza kaydına devam edebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8">
              <div className="space-y-8">
                {/* İşletme Bilgileri */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b">
                    {t.businessInfo}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.shopName}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.shopName}
                        onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Örn: Retro Eşya Mağazası, Tekno Parça"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Müşterilerin göreceği isim</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.ownerName}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ad Soyad"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">İletişim için gerekli</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="iletisim@magaza.com"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Onay ve bildirimler için</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="05XX XXX XX XX"
                        disabled={!user && !editMode}
                      />
                      <p className="text-gray-500 text-xs mt-2">Müşterilerin arayabileceği numara</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.city}
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!user && !editMode}
                      >
                        <option value="">{t.cityPlaceholder}</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-xs mt-2">İşletmenizin bulunduğu şehir</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.bizType}
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!user && !editMode}
                      >
                        <option value="">Seçiniz</option>
                        {businessTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.icon} {type.name} - {type.description}
                          </option>
                        ))}
                      </select>
                      <p className="text-gray-500 text-xs mt-2">Ana faaliyet alanınız</p>
                    </div>
                  </div>
                </div>

                {/* Adres */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.addressInfo}
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mahalle, cadde, sokak, bina no, daire no..."
                      rows={3}
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">Müşterilerin bulabilmesi için tam adres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.website}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.ornek.com"
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">Müşterilerin ziyaret edebileceği site</p>
                  </div>
                </div>

                {/* Açıklama */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.descSection}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.descLabel}
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İşletmenizi kısaca tanıtın. Uzmanlık alanlarınız, ürün yelpazeniz, hizmetleriniz..."
                      rows={4}
                      disabled={!user && !editMode}
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Müşteriler bu açıklamayı görecek. Net ve çekici olun.
                    </p>
                  </div>
                </div>

                {/* Tahmini Spot Sayısı */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.spotsSection}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                        {t.spotsLabel}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {spotRanges.map(range => (
                        <label 
                          key={range.id}
                          className={`cursor-pointer border-2 rounded-xl p-4 text-center transition duration-200 ${
                            formData.monthlySpots === range.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${(!user && !editMode) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="monthlySpots"
                            value={range.id}
                            checked={formData.monthlySpots === range.id}
                            onChange={(e) => setFormData({...formData, monthlySpots: e.target.value})}
                            className="sr-only"
                            required
                            disabled={!user && !editMode}
                          />
                          <div className="font-bold text-gray-900">{range.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{range.description}</div>
                        </label>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      Size özel öneriler sunabilmemiz için bu bilgi önemlidir.
                    </p>
                  </div>
                </div>

                {/* Koşullar */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t.termsSection}
                  </h3>
                  
                  <div className="space-y-4">
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                        className="mt-1 mr-3"
                        required
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        <a 
                          href="/terms" 
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          SpotItForMe
                        </a>{' '}{t.acceptTerms} *
                      </span>
                    </label>
                    
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptPrivacy}
                        onChange={(e) => setFormData({...formData, acceptPrivacy: e.target.checked})}
                        className="mt-1 mr-3"
                        required
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        <a 
                          href="/privacy" 
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          SpotItForMe
                        </a>{' '}{t.acceptPrivacy} *
                      </span>
                    </label>
                    
                    <label className={`flex items-start ${(!user && !editMode) ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={formData.acceptMarketing}
                        onChange={(e) => setFormData({...formData, acceptMarketing: e.target.checked})}
                        className="mt-1 mr-3"
                        disabled={!user && !editMode}
                      />
                      <span className="text-sm">
                        {t.acceptMarketing}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-8 border-t">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={loading || !user}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {editMode ? 'Güncelleniyor...' : locale === 'tr' ? 'Kaydediliyor...' : '...'}
                        </span>
                      ) : editMode ? (
                        t.updateBtn
                      ) : user ? (
                        t.submitBtn
                      ) : (
                        t.loginBtn
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/')}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-8 rounded-xl"
                    >
                      İptal
                    </button>
                  </div>
                  
                  {!user && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm text-center">
                        Mağaza kaydı için önce giriş yapmalısınız. 
                        <button
                          onClick={() => {
                            setAuthSuccessCallback(() => handleFormSubmit)
                            setShowAuthModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium ml-2 underline"
                        >
                          Hemen giriş yapın
                        </button>
                      </p>
                    </div>
                  )}
                  
                  <p className="text-center text-gray-500 text-sm mt-4">
                    Kayıt işlemi tamamlandığında size bir onay email'i göndereceğiz.
                    <br />
                    Ücretsiz paketle başlayın, ileride premium özelliklere geçebilirsiniz.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SSS */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Sıkça Sorulan Sorular</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "Mağaza kaydı ücretsiz mi?",
                a: "Evet! SpotItForMe'de mağaza kaydı tamamen ücretsizdir. Sınırsız spot oluşturabilir, binlerce potansiyel müşteriye ulaşabilirsiniz."
              },
              {
                q: "Premium paketler ne zaman gelecek?",
                a: "Premium paketler (PRO, BUSINESS) platform büyüdükçe eklenecek. Şu anda tüm özellikler ücretsiz kullanılabilir."
              },
              {
                q: "Müşteriler beni nasıl bulacak?",
                a: "Müşteriler aradıkları ürünü sizde gördüğünde, mağaza profilinize yönlendirilecek ve iletişim bilgilerinizi görecek."
              },
              {
                q: "Kaç tane spot oluşturabilirim?",
                a: "Ücretsiz pakette aylık spot sınırı yok! Ancak resim yükleme için ayda 20 adet ücretsiz hakkınız var."
              },
              {
                q: "Hangi tür işletmeler katılabilir?",
                a: "Antikacılar, koleksiyonerler, tamir servisleri, ikinci el mağazalar, özel ürün satan tüm işletmeler katılabilir."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
                <h4 className="font-bold text-lg mb-3 flex items-center">
                  <span className="text-blue-600 mr-3">❓</span>
                  {faq.q}
                </h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Hala sorularınız mı var?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            İşletmeniz için SpotItForMe'yi nasıl kullanabileceğinizi konuşalım.
            Ücretsiz danışmanlık için bize ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:spotitformeweb@gmail.com"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg"
            >
              📧 Email Gönder
            </a>
            <a
              href="tel:+905555555555"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg"
            >
              📞 Ara
            </a>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}