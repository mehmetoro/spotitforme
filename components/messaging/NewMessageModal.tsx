// components/messaging/NewMessageModal.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ADMIN_USER_ID } from '@/lib/admin'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'
import { X, Search, User, AlertCircle, Send, Image as ImageIcon, MapPin } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  avatar: string
  last_active: string
  reputation_score?: number
}

interface Spot {
  id: string
  title: string
  image_url?: string
}

interface NewMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSendMessage: (receiverId: string, content: string, threadType: string) => Promise<boolean>
  currentUserId: string
  spotId?: string
  initialReceiverId?: string
  initialThreadType?: string
  initialDraft?: string
}

// Database'den gelen user tipi
interface DatabaseUser {
  id: string
  full_name?: string | null
  name?: string | null
  avatar_url?: string | null
  avatar?: string | null
  last_seen?: string | null
  updated_at?: string | null
  reputation_score?: number | null
}

// Database'den gelen spot tipi  
interface DatabaseSpot {
  id: string
  title: string
  image_url: string | null
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUuid(value: string) {
  return UUID_REGEX.test(value)
}

export default function NewMessageModal({ 
  isOpen, 
  onClose, 
  onSendMessage, 
  currentUserId,
  spotId,
  initialReceiverId,
  initialThreadType,
  initialDraft,
}: NewMessageModalProps) {
  const locale = useCurrentLocale()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [step, setStep] = useState<'select' | 'compose'>('select')
  const [showTips, setShowTips] = useState(true)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [messageType, setMessageType] = useState<'general' | 'spot' | 'help'>('general')
  const [prefillApplied, setPrefillApplied] = useState(false)
  const [formError, setFormError] = useState('')
  
  const modalRef = useRef<HTMLDivElement>(null)

  const t = {
    unknownUser: { tr: 'Kullanici', en: 'User', de: 'Benutzer', fr: 'Utilisateur', es: 'Usuario', ru: 'Polzovatel' },
    online: { tr: 'Cevrimici', en: 'Online', de: 'Online', fr: 'En ligne', es: 'En linea', ru: 'V seti' },
    unknown: { tr: 'Bilinmiyor', en: 'Unknown', de: 'Unbekannt', fr: 'Inconnu', es: 'Desconocido', ru: 'Neizvestno' },
    minAgo: { tr: 'dakika once', en: 'minutes ago', de: 'Minuten zuvor', fr: 'minutes', es: 'minutos', ru: 'minut nazad' },
    hourAgo: { tr: 'saat once', en: 'hours ago', de: 'Stunden zuvor', fr: 'heures', es: 'horas', ru: 'chasov nazad' },
    dayAgo: { tr: 'gun once', en: 'days ago', de: 'Tage zuvor', fr: 'jours', es: 'dias', ru: 'dney nazad' },
    loadUsersFailed: { tr: 'Kullanici listesi yuklenemedi. Lutfen sayfayi yenileyip tekrar deneyin.', en: 'User list could not be loaded. Please refresh and try again.', de: 'Benutzerliste konnte nicht geladen werden. Bitte Seite neu laden.', fr: 'La liste des utilisateurs n a pas pu etre chargee. Rechargez la page.', es: 'No se pudo cargar la lista de usuarios. Recarga la pagina.', ru: 'Ne udalos zagruzit spisok polzovateley. Obnovite stranicu.' },
    selectAndWrite: { tr: 'Lutfen bir kullanici secin ve mesajinizi yazin.', en: 'Please select a user and write your message.', de: 'Bitte Nutzer auswahlen und Nachricht schreiben.', fr: 'Selectionnez un utilisateur et ecrivez votre message.', es: 'Selecciona un usuario y escribe tu mensaje.', ru: 'Vyberite polzovatelya i napishite soobshchenie.' },
    invalidUser: { tr: 'Gecersiz kullanici secimi. Lutfen listeden tekrar secim yapin.', en: 'Invalid user selection. Please choose from the list again.', de: 'Ungultige Nutzerauswahl. Bitte erneut aus der Liste auswahlen.', fr: 'Selection utilisateur invalide. Choisissez a nouveau dans la liste.', es: 'Seleccion de usuario invalida. Elige de nuevo de la lista.', ru: 'Nekorrektnyy vybor polzovatelya. Vyberite iz spiska eshche raz.' },
    requestSendFailed: { tr: 'Mesaj talebi gonderilemedi. Lutfen tekrar deneyin.', en: 'Message request could not be sent. Please try again.', de: 'Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.', fr: 'La demande n a pas pu etre envoyee. Veuillez reessayer.', es: 'No se pudo enviar la solicitud. Intentalo de nuevo.', ru: 'Ne udalos otpravit zapros. Poprobuyte snova.' },
    genericError: { tr: 'Bir hata olustu. Lutfen tekrar deneyin.', en: 'An error occurred. Please try again.', de: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.', fr: 'Une erreur est survenue. Veuillez reessayer.', es: 'Ocurrio un error. Intentalo de nuevo.', ru: 'Proizoshla oshibka. Poprobuyte snova.' },
    newMessage: { tr: 'Yeni Mesaj', en: 'New Message', de: 'Neue Nachricht', fr: 'Nouveau message', es: 'Nuevo mensaje', ru: 'Novoe soobshchenie' },
    messageTo: { tr: 'Mesaj', en: 'Message to', de: 'Nachricht an', fr: 'Message a', es: 'Mensaje a', ru: 'Soobshchenie dlya' },
    pickUserSubtitle: { tr: 'Bir kullanici secin ve mesajlasma talebi gonderin', en: 'Pick a user and send a message request', de: 'Wahlen Sie einen Nutzer und senden Sie eine Anfrage', fr: 'Choisissez un utilisateur et envoyez une demande', es: 'Elige un usuario y envia una solicitud', ru: 'Vyberite polzovatelya i otpravte zapros' },
    writeRequestSubtitle: { tr: 'Talep mesajinizi yazin', en: 'Write your request message', de: 'Schreiben Sie Ihre Anfrage', fr: 'Ecrivez votre message de demande', es: 'Escribe tu mensaje de solicitud', ru: 'Napishete tekst zaprosa' },
    spotForMessage: { tr: 'Spotlariniz Icin Mesaj Gonderin', en: 'Send Messages for Your Spots', de: 'Nachrichten fur Ihre Spots', fr: 'Envoyer des messages pour vos spots', es: 'Enviar mensajes para tus spots', ru: 'Otpravlyayte soobshcheniya po svoim spotam' },
    aboutSpot: { tr: 'Spot hakkinda mesaj gonder', en: 'Send message about this spot', de: 'Nachricht zu diesem Spot senden', fr: 'Envoyer un message sur ce spot', es: 'Enviar mensaje sobre este spot', ru: 'Otpravit soobshchenie ob etom spote' },
    searchByName: { tr: 'Isim veya kullanici adi ile ara...', en: 'Search by name or username...', de: 'Nach Name oder Benutzername suchen...', fr: 'Rechercher par nom ou pseudo...', es: 'Buscar por nombre o usuario...', ru: 'Poisk po imeni ili niku...' },
    minTwoChars: { tr: 'Aramak icin en az 2 karakter girin', en: 'Enter at least 2 characters to search', de: 'Mindestens 2 Zeichen eingeben', fr: 'Entrez au moins 2 caracteres', es: 'Ingresa al menos 2 caracteres', ru: 'Vvedite minimum 2 simvola' },
    searchResults: { tr: 'Arama Sonuclari', en: 'Search Results', de: 'Suchergebnisse', fr: 'Resultats de recherche', es: 'Resultados de busqueda', ru: 'Rezultaty poiska' },
    suggestedUsers: { tr: 'Onerilen Kullanicilar', en: 'Suggested Users', de: 'Empfohlene Nutzer', fr: 'Utilisateurs suggeres', es: 'Usuarios sugeridos', ru: 'Rekomendovannye polzovateli' },
    noUserFound: { tr: 'Kullanici bulunamadi', en: 'No user found', de: 'Kein Nutzer gefunden', fr: 'Aucun utilisateur trouve', es: 'No se encontro usuario', ru: 'Polzovatel ne nayden' },
    tryDifferentSearch: { tr: 'Farkli bir arama terimi deneyin', en: 'Try a different search term', de: 'Versuchen Sie einen anderen Suchbegriff', fr: 'Essayez un autre terme de recherche', es: 'Prueba otro termino de busqueda', ru: 'Poprobuyte drugoy poiskovyy zapros' },
    points: { tr: 'puan', en: 'pts', de: 'Punkte', fr: 'pts', es: 'pts', ru: 'ochk' },
    messageAction: { tr: 'Mesaj', en: 'Message', de: 'Nachricht', fr: 'Message', es: 'Mensaje', ru: 'Soobshchenie' },
    switchUser: { tr: 'Kullanici degistir', en: 'Change user', de: 'Nutzer wechseln', fr: 'Changer d utilisateur', es: 'Cambiar usuario', ru: 'Smenit polzovatelya' },
    spotSending: { tr: 'Bu spot icin mesaj gonderiyorsunuz', en: 'You are sending a message for this spot', de: 'Sie senden eine Nachricht fur diesen Spot', fr: 'Vous envoyez un message pour ce spot', es: 'Estas enviando un mensaje para este spot', ru: 'Vy otpravlyaete soobshchenie po etomu spotu' },
    quickTemplates: { tr: 'Hizli Sablonlar', en: 'Quick Templates', de: 'Schnellvorlagen', fr: 'Modeles rapides', es: 'Plantillas rapidas', ru: 'Bystrye shablony' },
    productQuestion: { tr: 'Urun Sorusu', en: 'Product Question', de: 'Produktfrage', fr: 'Question produit', es: 'Pregunta de producto', ru: 'Vopros o tovare' },
    meetingRequest: { tr: 'Bulusma Talebi', en: 'Meeting Request', de: 'Treffen anfragen', fr: 'Demande de rencontre', es: 'Solicitud de encuentro', ru: 'Zapros na vstrechu' },
    priceOffer: { tr: 'Fiyat Teklifi', en: 'Price Offer', de: 'Preisangebot', fr: 'Offre de prix', es: 'Oferta de precio', ru: 'Tsennovoe predlozhenie' },
    yourMessage: { tr: 'Mesajiniz', en: 'Your Message', de: 'Ihre Nachricht', fr: 'Votre message', es: 'Tu mensaje', ru: 'Vashe soobshchenie' },
    detailedWrite: { tr: 'Mesajinizi detayli bir sekilde yazin...', en: 'Write your message in detail...', de: 'Schreiben Sie Ihre Nachricht im Detail...', fr: 'Ecrivez votre message en detail...', es: 'Escribe tu mensaje con detalle...', ru: 'Podrobno napishite soobshchenie...' },
    chars: { tr: 'karakter', en: 'characters', de: 'Zeichen', fr: 'caracteres', es: 'caracteres', ru: 'simvolov' },
    newLineHint: { tr: 'Shift+Enter ile yeni satir', en: 'Shift+Enter for new line', de: 'Shift+Enter fur neue Zeile', fr: 'Shift+Entree pour nouvelle ligne', es: 'Shift+Enter para nueva linea', ru: 'Shift+Enter novaya stroka' },
    messageType: { tr: 'Mesaj Turu', en: 'Message Type', de: 'Nachrichtentyp', fr: 'Type de message', es: 'Tipo de mensaje', ru: 'Tip soobshcheniya' },
    generalMessage: { tr: 'Genel Mesaj', en: 'General Message', de: 'Allgemeine Nachricht', fr: 'Message general', es: 'Mensaje general', ru: 'Obshchee soobshchenie' },
    forSpot: { tr: 'Spot Icin', en: 'For Spot', de: 'Fur Spot', fr: 'Pour spot', es: 'Para spot', ru: 'Dlya spota' },
    helpRequest: { tr: 'Yardim Talebi', en: 'Help Request', de: 'Hilfeanfrage', fr: 'Demande d aide', es: 'Solicitud de ayuda', ru: 'Zapros pomoshchi' },
    safeTips: { tr: 'Guvenli Mesajlasma Ipuclari', en: 'Safe Messaging Tips', de: 'Tipps fur sichere Nachrichten', fr: 'Conseils de messagerie sure', es: 'Consejos de mensajeria segura', ru: 'Sovety po bezopasnoy perepiske' },
    cancel: { tr: 'Iptal', en: 'Cancel', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar', ru: 'Otmena' },
    selectedSpot: { tr: 'Secili spot', en: 'Selected spot', de: 'Ausgewahlter Spot', fr: 'Spot selectionne', es: 'Spot seleccionado', ru: 'Vybrannyy spot' },
    users: { tr: 'kullanici', en: 'users', de: 'Nutzer', fr: 'utilisateurs', es: 'usuarios', ru: 'polzovateley' },
    back: { tr: 'Geri', en: 'Back', de: 'Zuruck', fr: 'Retour', es: 'Atras', ru: 'Nazad' },
    clear: { tr: 'Temizle', en: 'Clear', de: 'Leeren', fr: 'Effacer', es: 'Limpiar', ru: 'Ochistit' },
    sending: { tr: 'Gonderiliyor...', en: 'Sending...', de: 'Wird gesendet...', fr: 'Envoi...', es: 'Enviando...', ru: 'Otpravka...' },
    sendRequest: { tr: 'Talep Gonder', en: 'Send Request', de: 'Anfrage senden', fr: 'Envoyer la demande', es: 'Enviar solicitud', ru: 'Otpravit zapros' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      document.body.style.overflow = 'hidden'
      setPrefillApplied(false)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // 1. Kullanıcıları getir
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', currentUserId)
        .limit(20)
        .order('updated_at', { ascending: false })

      if (usersError) throw usersError

      // DÜZELTME 1: user parametresi için tip belirle
      const formattedUsers: UserProfile[] = (usersData || []).map((user: DatabaseUser) => ({
        id: user.id,
        full_name: user.full_name || user.name || trText('unknownUser'),
        avatar: user.avatar_url || user.avatar || '',
        last_active: formatLastActive(user.last_seen || user.updated_at || ''),
        reputation_score: user.reputation_score || 0
      }))

      let usersList = formattedUsers
      // Eğer admin user yoksa ve initialReceiverId admin ise, admini ekle
      if (initialReceiverId === ADMIN_USER_ID && !formattedUsers.find(u => u.id === ADMIN_USER_ID)) {
        const adminProfile = {
          id: ADMIN_USER_ID,
          full_name: 'Admin',
          avatar: '',
          last_active: trText('online'),
          reputation_score: 9999
        }
        usersList = [adminProfile, ...formattedUsers]
      }
      setUsers(usersList)
      setFilteredUsers(usersList)

      if (!prefillApplied && initialReceiverId) {
        const preselected = usersList.find((user) => user.id === initialReceiverId)
        if (preselected) {
          setSelectedUser(preselected)
          setStep('compose')

          if (initialThreadType === 'spot') {
            setMessageType('spot')
          } else if (initialThreadType === 'help') {
            setMessageType('help')
          } else {
            setMessageType('general')
          }

          if (initialDraft && initialDraft.trim()) {
            setMessage(initialDraft)
          } else {
            setMessage(`Merhaba ${preselected.full_name},\n\nMesajlaşma talebi göndermek istiyorum.`)
          }

          setPrefillApplied(true)
        }
      }

      // 2. Spot'ları getir
      const { data: spotsData, error: spotsError } = await supabase
        .from('spots')
        .select('id, title, image_url')
        .eq('user_id', currentUserId)
        .eq('status', 'active')
        .limit(5)
        .order('created_at', { ascending: false })

      if (spotsError) throw spotsError
      
      const formattedSpots: Spot[] = (spotsData || []).map((spot: DatabaseSpot) => ({
        id: spot.id,
        title: spot.title,
        image_url: spot.image_url || undefined
      }))
      
      setSpots(formattedSpots)

      // 3. Eğer spotId varsa, o spot'u bul
      // DÜZELTME 2: s parametresi için tip belirle
      if (spotId) {
        const spot = spotsData?.find((s: DatabaseSpot) => s.id === spotId)
        if (spot) {
          setSelectedSpot({
            id: spot.id,
            title: spot.title,
            image_url: spot.image_url || undefined
          })
          setMessageType('spot')
          setMessage(`Merhaba, "${spot.title}" spot'u hakkında bilgi almak istiyorum...`)
        }
      }

    } catch (error) {
      console.error('Başlangıç verileri yüklenemedi:', error)
      setUsers([])
      setFilteredUsers([])
      setSpots([])
      setSelectedUser(null)
      setStep('select')
      setFormError(trText('loadUsersFailed'))
    } finally {
      setLoading(false)
    }
  }

  const formatLastActive = (lastSeen: string) => {
    if (!lastSeen) return trText('unknown')
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - lastSeenDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 5) return trText('online')
    if (diffMins < 60) return `${diffMins} ${trText('minAgo')}`
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)} ${trText('hourAgo')}`
    return `${Math.floor(diffMins / (60 * 24))} ${trText('dayAgo')}`
  }

  const handleSelectUser = (user: UserProfile) => {
    setFormError('')
    setSelectedUser(user)
    setStep('compose')
    
    // Mesajı hazırla
    if (selectedSpot) {
      setMessage(`Merhaba ${user.full_name},\n\n"${selectedSpot.title}" spot'u hakkında bilgi almak istiyorum. Bu konuda yardımcı olabilir misiniz?\n\nTeşekkürler.`)
    } else {
      setMessage(`Merhaba ${user.full_name},\n\n`)
    }
  }

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) {
      setFormError(trText('selectAndWrite'))
      return
    }

    if (!isValidUuid(selectedUser.id)) {
      setFormError(trText('invalidUser'))
      return
    }

    setFormError('')
    setSending(true)
    try {
      const resolvedThreadType = initialThreadType || (selectedSpot ? 'spot' : messageType)

      // Tek kaynak olarak parent callback üzerinden gönder
      const sent = await onSendMessage(selectedUser.id, message, resolvedThreadType)

      if (!sent) {
        setFormError(trText('requestSendFailed'))
        setSending(false)
        return
      }
      
      // Başarılı - modal'ı kapat
      setSending(false)
      setSelectedUser(null)
      setMessage('')
      setStep('select')
      onClose()
      
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error)
      setFormError(trText('genericError'))
      setSending(false)
    }
  }

  const handleMessageTemplate = (template: string) => {
    switch (template) {
      case 'spot_question':
        setMessage(`Merhaba ${selectedUser?.full_name || ''},\n\nBu ürün hakkında daha fazla bilgi alabilir miyim?\n- Durumu nedir?\n- Fiyat aralığı?\n- Nerede görülebilir?\n\nTeşekkürler.`)
        break
      case 'meeting_request':
        setMessage(`Merhaba ${selectedUser?.full_name || ''},\n\nÜrünü görmek için buluşabilir miyiz? Hangi gün ve saat uygun olursunuz?\n\nİyi günler.`)
        break
      case 'price_offer':
        setMessage(`Merhaba ${selectedUser?.full_name || ''},\n\nÜrün için fiyat teklifim var. Bu konuda konuşabilir miyiz?\n\nSaygılarımla.`)
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          ref={modalRef}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-lg font-semibold">
                {step === 'select' ? trText('newMessage') : `${trText('messageTo')} ${selectedUser?.full_name}`}
              </h2>
              <p className="text-sm text-gray-500">
                {step === 'select' 
                  ? trText('pickUserSubtitle') 
                  : trText('writeRequestSubtitle')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={sending}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {step === 'select' ? (
              <>
                {/* Spot Seçimi */}
                {spots.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      {trText('spotForMessage')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {spots.map((spot: Spot) => (
                        <div
                          key={spot.id}
                          className={`
                            border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md
                            ${selectedSpot?.id === spot.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'hover:border-blue-300'
                            }
                          `}
                          onClick={() => {
                            setSelectedSpot(spot)
                            setMessageType('spot')
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {spot.image_url ? (
                              <img
                                src={spot.image_url}
                                alt={spot.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {spot.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {trText('aboutSpot')}
                              </p>
                            </div>
                            {selectedSpot?.id === spot.id && (
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arama */}
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={trText('searchByName')}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {trText('minTwoChars')}
                    </p>
                  )}
                </div>

                {/* Kullanıcı Listesi */}
                <div className="p-4">
                  {formError && (
                    <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {formError}
                    </div>
                  )}

                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {searchQuery ? trText('searchResults') : trText('suggestedUsers')}
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{trText('noUserFound')}</p>
                      <p className="text-sm mt-1">{trText('tryDifferentSearch')}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((user: UserProfile) => (
                        <div
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors active:bg-gray-100"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={user.full_name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              {user.last_active === trText('online') && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{user.full_name}</p>
                                {user.reputation_score && user.reputation_score > 0 ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {user.reputation_score} {trText('points')}
                                  </span>
                                ) : null}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  {user.last_active}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 hover:bg-blue-50 rounded">
                            {trText('messageAction')}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Mesaj Yazma */
              <>
                {/* Kullanıcı Bilgisi */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {selectedUser?.avatar ? (
                          <img
                            src={selectedUser.avatar}
                            alt={selectedUser.full_name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{selectedUser?.full_name}</p>
                          {selectedUser?.reputation_score && selectedUser.reputation_score > 0 ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {selectedUser.reputation_score} {trText('points')}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-500">
                          {selectedUser?.last_active}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setStep('select')}
                      className="text-sm text-gray-600 hover:text-gray-800"
                      disabled={sending}
                    >
                      {trText('switchUser')}
                    </button>
                  </div>
                  
                  {selectedSpot && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {selectedSpot.title}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        {trText('spotSending')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mesaj Şablonları */}
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {trText('quickTemplates')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleMessageTemplate('spot_question')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      {trText('productQuestion')}
                    </button>
                    <button
                      onClick={() => handleMessageTemplate('meeting_request')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      {trText('meetingRequest')}
                    </button>
                    <button
                      onClick={() => handleMessageTemplate('price_offer')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      {trText('priceOffer')}
                    </button>
                  </div>
                </div>

                {/* Mesaj Alanı */}
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trText('yourMessage')}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        if (formError) setFormError('')
                      }}
                      placeholder={trText('detailedWrite')}
                      className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      disabled={sending}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {message.length}/2000 {trText('chars')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {trText('newLineHint')}
                      </span>
                    </div>
                  </div>

                  {/* Mesaj Türü Seçimi */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {trText('messageType')}
                    </label>
                    <div className="flex space-x-2">
                      {['general', 'spot', 'help'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setMessageType(type as 'general' | 'spot' | 'help')}
                          className={`
                            flex-1 py-2 text-sm rounded-lg border transition-colors
                            ${messageType === type
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                          disabled={sending}
                        >
                          {type === 'general' && trText('generalMessage')}
                          {type === 'spot' && trText('forSpot')}
                          {type === 'help' && trText('helpRequest')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Güvenlik Uyarısı */}
                  {showTips && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                              {trText('safeTips')}
                            </p>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              <li>• Kişisel bilgilerinizi (telefon, adres, TC kimlik) paylaşmayın</li>
                              <li>• Ön ödeme talep etmeyin veya yapmayın</li>
                              <li>• SpotItForme güvenli ödeme sistemini kullanın</li>
                              <li>• Şüpheli talepleri bize bildirin: guvenlik@spotitforme.com</li>
                            </ul>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowTips(false)}
                          className="text-yellow-600 hover:text-yellow-800"
                          disabled={sending}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t bg-gray-50">
            {step === 'select' ? (
              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  {trText('cancel')}
                </button>
                <div className="text-sm text-gray-500 flex items-center">
                  {selectedSpot && (
                    <span className="mr-3">
                      {trText('selectedSpot')}: <span className="font-medium">{selectedSpot.title}</span>
                    </span>
                  )}
                  <span>
                    {filteredUsers.length} {trText('users')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {formError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep('select')}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
                    disabled={sending}
                  >
                    {trText('back')}
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setFormError('')
                        setMessage('')
                        setSelectedUser(null)
                        setStep('select')
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                      disabled={sending}
                    >
                      {trText('clear')}
                    </button>
                    
                    <button
                      onClick={handleSend}
                      disabled={sending || !selectedUser || !message.trim()}
                      className={`
                        px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2
                        ${sending || !selectedUser || !message.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{trText('sending')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{trText('sendRequest')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}