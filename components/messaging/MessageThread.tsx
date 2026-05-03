// components/messaging/MessageThread.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ADMIN_USER_ID } from '@/lib/admin';
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useCurrentLocale, type SupportedLocale } from '@/hooks/useCurrentLocale'
import { translateTextInBrowser } from '@/lib/browser-translation'
import { Send, Paperclip, Image as ImageIcon, X, ArrowLeft, MoreVertical, Info, Trash2, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  content: string
  attachments?: string[]
  created_at: string
  is_read: boolean
  type?: string
}

interface ThreadMeta {
  id: string
  participant1_id: string
  participant2_id: string
  participant1_language?: SupportedLocale | null
  participant2_language?: SupportedLocale | null
  request_status?: 'pending' | 'accepted' | 'rejected'
  request_initiator_id?: string | null
  request_message?: string | null
  request_responded_at?: string | null
}

interface Participant {
  id: string
  name: string
  avatar: string
  is_online: boolean
  last_seen?: string
}

interface MessageThreadProps {
  threadId: string
  userId: string
  onBack: () => void
}

export default function MessageThread({ threadId, userId, onBack }: MessageThreadProps) {
  const toast = useToast()
  const locale = useCurrentLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({})
  const [detectedSourceLanguages, setDetectedSourceLanguages] = useState<Record<string, SupportedLocale | null>>({})
  const [newMessage, setNewMessage] = useState('')
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [threadMeta, setThreadMeta] = useState<ThreadMeta | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [requestActionLoading, setRequestActionLoading] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [languageSaving, setLanguageSaving] = useState(false)
  const [translationAvailable, setTranslationAvailable] = useState(true)
  const [translationInProgress, setTranslationInProgress] = useState(false)
  const [presenceOnline, setPresenceOnline] = useState(false)

  const t = {
    user: { tr: 'Kullanici', en: 'User', de: 'Benutzer', fr: 'Utilisateur', es: 'Usuario', ru: 'Polzovatel' },
    loadingMessages: { tr: 'Mesajlar yukleniyor...', en: 'Loading messages...', de: 'Nachrichten werden geladen...', fr: 'Chargement des messages...', es: 'Cargando mensajes...', ru: 'Zagruzka soobshcheniy...' },
    online: { tr: 'Cevrimici', en: 'Online', de: 'Online', fr: 'En ligne', es: 'En linea', ru: 'V seti' },
    offline: { tr: 'Cevrimdisi', en: 'Offline', de: 'Offline', fr: 'Hors ligne', es: 'Desconectado', ru: 'Ne v seti' },
    lastSeen: { tr: 'Son gorulme', en: 'Last seen', de: 'Zuletzt gesehen', fr: 'Vu derniere fois', es: 'Ultima vez', ru: 'Posledniy raz v seti' },
    conversationLanguage: { tr: 'Konusma dili', en: 'Conversation language', de: 'Gesprache Sprache', fr: 'Langue de conversation', es: 'Idioma de conversacion', ru: 'Yazyk chata' },
    otherLanguage: { tr: 'Karsi taraf dili', en: 'Other user language', de: 'Sprache der Gegenseite', fr: 'Langue de l autre utilisateur', es: 'Idioma de la otra persona', ru: 'Yazyk sobesednika' },
    languageUnknown: { tr: 'Belirtilmedi', en: 'Not set', de: 'Nicht festgelegt', fr: 'Non defini', es: 'No definido', ru: 'Ne ukazan' },
    translating: { tr: 'Cevriliyor...', en: 'Translating...', de: 'Wird ubersetzt...', fr: 'Traduction...', es: 'Traduciendo...', ru: 'Perevod...' },
    languageHint: { tr: 'Konusma dilinizi seciniz. Gelen mesajlar bu dilde goruntulenir.', en: 'Select your conversation language. Incoming messages are shown in this language.', de: 'Wahlen Sie Ihre Gesprachssprache. Eingehende Nachrichten werden in dieser Sprache angezeigt.', fr: 'Choisissez votre langue de conversation. Les messages entrants seront affiches dans cette langue.', es: 'Elige tu idioma de conversacion. Los mensajes entrantes se mostraran en este idioma.', ru: 'Vyberite yazyk razgovora. Vkhodyashchie soobshcheniya budut pokazany na etom yazyke.' },
    profileView: { tr: 'Profili goruntule', en: 'View profile', de: 'Profil anzeigen', fr: 'Voir le profil', es: 'Ver perfil', ru: 'Otkryt profil' },
    deleteConversation: { tr: 'Konusmayi sil', en: 'Delete conversation', de: 'Unterhaltung loschen', fr: 'Supprimer la conversation', es: 'Eliminar conversacion', ru: 'Udalit chat' },
    browserNoTranslate: { tr: 'Tarayiciniz anlik ceviriyi desteklemiyor. Mesajlar orijinal dilinde gosteriliyor.', en: 'Your browser does not support live translation. Messages are shown in the original language.', de: 'Ihr Browser unterstutzt keine Live-Ubersetzung. Nachrichten werden in der Originalsprache angezeigt.', fr: 'Votre navigateur ne prend pas en charge la traduction en direct. Les messages restent dans la langue d origine.', es: 'Tu navegador no admite traduccion en vivo. Los mensajes se muestran en su idioma original.', ru: 'Vash brauzer ne podderzhivaet perevod v realnom vremeni. Soobshcheniya pokazany na originalnom yazyke.' },
    noMessageYet: { tr: 'Henuz mesaj yok', en: 'No messages yet', de: 'Noch keine Nachrichten', fr: 'Pas encore de messages', es: 'Aun no hay mensajes', ru: 'Soobshcheniy poka net' },
    sendFirst: { tr: 'Ilk mesaji siz gonderin', en: 'Send the first message', de: 'Senden Sie die erste Nachricht', fr: 'Envoyez le premier message', es: 'Envia el primer mensaje', ru: 'Otpravte pervoe soobshchenie' },
    requestSentTitle: { tr: 'Mesaj Talebi Gonderildi', en: 'Message Request Sent', de: 'Nachrichtenanfrage gesendet', fr: 'Demande envoyee', es: 'Solicitud enviada', ru: 'Zapros otpravlen' },
    newRequestTitle: { tr: 'Yeni Mesaj Talebi', en: 'New Message Request', de: 'Neue Nachrichtenanfrage', fr: 'Nouvelle demande', es: 'Nueva solicitud', ru: 'Novyy zapros' },
    requestDefaultText: { tr: 'Mesajlasma baslatmak icin talep gonderildi.', en: 'A request was sent to start messaging.', de: 'Eine Anfrage wurde gesendet, um den Chat zu starten.', fr: 'Une demande a ete envoyee pour demarrer la discussion.', es: 'Se envio una solicitud para iniciar el chat.', ru: 'Zapros na nachalo perepiski otpravlen.' },
    requestForwarded: { tr: 'Talebiniz karsi tarafa iletildi. Kabul ettiginde mesajlasmaya baslayabileceksiniz.', en: 'Your request has been delivered. You can chat once it is accepted.', de: 'Ihre Anfrage wurde ubermittelt. Nach Annahme konnen Sie chatten.', fr: 'Votre demande a ete transmise. Vous pourrez discuter apres acceptation.', es: 'Tu solicitud fue enviada. Podras chatear cuando sea aceptada.', ru: 'Vash zapros otpravlen. Posle prinyatiya vy smozhete obshchatsya.' },
    accept: { tr: 'Kabul Et', en: 'Accept', de: 'Annehmen', fr: 'Accepter', es: 'Aceptar', ru: 'Prinyat' },
    reject: { tr: 'Reddet', en: 'Reject', de: 'Ablehnen', fr: 'Refuser', es: 'Rechazar', ru: 'Otklonit' },
    requestRejectedBox: { tr: 'Bu mesajlasma talebi reddedildi. Yeniden iletisim icin yeni talep gondermeniz gerekir.', en: 'This message request was rejected. Send a new request to contact again.', de: 'Diese Anfrage wurde abgelehnt. Senden Sie eine neue Anfrage fur Kontakt.', fr: 'Cette demande a ete refusee. Envoyez une nouvelle demande pour reprendre contact.', es: 'Esta solicitud fue rechazada. Envia una nueva solicitud para volver a contactar.', ru: 'Etot zapros byl otklonen. Otpravte novyy zapros, chtoby svyazatsya snova.' },
    threadLoadFailed: { tr: 'Konusma yuklenemedi. Lutfen tekrar deneyin.', en: 'Conversation could not be loaded. Please try again.', de: 'Unterhaltung konnte nicht geladen werden. Bitte erneut versuchen.', fr: 'La conversation n a pas pu etre chargee. Veuillez reessayer.', es: 'No se pudo cargar la conversacion. Intentalo de nuevo.', ru: 'Ne udalos zagruzit chat. Poprobuyte snova.' },
    needAcceptedRequest: { tr: 'Bu sohbet icin once mesajlasma talebinin kabul edilmesi gerekiyor.', en: 'This chat requires an accepted message request first.', de: 'Fur diesen Chat muss die Anfrage zuerst angenommen werden.', fr: 'Cette conversation necessite d abord une demande acceptee.', es: 'Este chat requiere primero una solicitud aceptada.', ru: 'Dlya etogo chata snachala nuzhno prinyatie zaprosa.' },
    requestAlreadyRejected: { tr: 'Bu sohbet talebi reddedildi. Yeni bir talep baslatmalisiniz.', en: 'This request was rejected. Start a new request.', de: 'Diese Anfrage wurde abgelehnt. Starten Sie eine neue Anfrage.', fr: 'Cette demande a ete refusee. Lancez une nouvelle demande.', es: 'Esta solicitud fue rechazada. Inicia una nueva solicitud.', ru: 'Etot zapros otklonen. Nachnite novyy zapros.' },
    userNotFound: { tr: 'Kullanici bulunamadi', en: 'User not found', de: 'Benutzer nicht gefunden', fr: 'Utilisateur introuvable', es: 'Usuario no encontrado', ru: 'Polzovatel ne nayden' },
    sendFailed: { tr: 'Mesaj gonderilemedi. Lutfen tekrar deneyin.', en: 'Message could not be sent. Please try again.', de: 'Nachricht konnte nicht gesendet werden. Bitte erneut versuchen.', fr: 'Le message n a pas pu etre envoye. Veuillez reessayer.', es: 'No se pudo enviar el mensaje. Intentalo de nuevo.', ru: 'Ne udalos otpravit soobshchenie. Poprobuyte snova.' },
    fileTooLarge: { tr: 'Dosya boyutu 10MB dan kucuk olmali', en: 'File size must be smaller than 10MB', de: 'Dateigrosse muss unter 10MB liegen', fr: 'La taille du fichier doit etre inferieure a 10 Mo', es: 'El archivo debe ser menor a 10MB', ru: 'Razmer faila dolzhen byt menshe 10MB' },
    fileTypeInvalid: { tr: 'Sadece JPG, PNG, GIF veya PDF dosyalari yukleyebilirsiniz', en: 'Only JPG, PNG, GIF or PDF files are allowed', de: 'Nur JPG, PNG, GIF oder PDF sind erlaubt', fr: 'Seuls les fichiers JPG, PNG, GIF ou PDF sont autorises', es: 'Solo se permiten archivos JPG, PNG, GIF o PDF', ru: 'Dostupny tolko faily JPG, PNG, GIF ili PDF' },
    languageSaveFailed: { tr: 'Konusma dili kaydedilemedi. Mesaj dil kolonlari icin migration gerekli olabilir.', en: 'Conversation language could not be saved. Migration may be required.', de: 'Konversationssprache konnte nicht gespeichert werden. Migration kann erforderlich sein.', fr: 'La langue de conversation n a pas pu etre enregistree. Une migration peut etre necessaire.', es: 'No se pudo guardar el idioma de conversacion. Puede requerir migracion.', ru: 'Ne udalos sokhranit yazyk chata. Vozmozhno, nuzhna migratsiya.' },
    languageUpdated: { tr: 'Konusma dili guncellendi.', en: 'Conversation language updated.', de: 'Gesprache Sprache aktualisiert.', fr: 'Langue de conversation mise a jour.', es: 'Idioma de conversacion actualizado.', ru: 'Yazyk chata obnovlen.' },
    requestAcceptedPreview: { tr: 'Mesajlasma talebi kabul edildi', en: 'Request accepted', de: 'Anfrage angenommen', fr: 'Demande acceptee', es: 'Solicitud aceptada', ru: 'Zapros prinyat' },
    requestRejectedPreview: { tr: 'Mesajlasma talebi reddedildi', en: 'Request rejected', de: 'Anfrage abgelehnt', fr: 'Demande refusee', es: 'Solicitud rechazada', ru: 'Zapros otklonen' },
    requestAcceptedSystem: { tr: 'Mesajlasma talebi kabul edildi. Sohbet baslayabilir.', en: 'Message request accepted. Chat can start.', de: 'Anfrage akzeptiert. Chat kann beginnen.', fr: 'Demande acceptee. La discussion peut commencer.', es: 'Solicitud aceptada. El chat puede comenzar.', ru: 'Zapros prinyat. Chat mozhet nachatsya.' },
    requestDecisionFailed: { tr: 'Talep yanitlanamadi. Lutfen tekrar deneyin.', en: 'Request could not be processed. Please try again.', de: 'Anfrage konnte nicht verarbeitet werden. Bitte erneut versuchen.', fr: 'La demande n a pas pu etre traitee. Veuillez reessayer.', es: 'No se pudo procesar la solicitud. Intentalo de nuevo.', ru: 'Ne udalos obrabotat zapros. Poprobuyte snova.' },
    originalLanguage: { tr: 'Orijinal dil', en: 'Original language', de: 'Originalsprache', fr: 'Langue originale', es: 'Idioma original', ru: 'Originalnyy yazyk' },
    attachment: { tr: 'Dosya eki', en: 'Attachment', de: 'Anhang', fr: 'Piece jointe', es: 'Adjunto', ru: 'Vlozhenie' },
    lockedPending: { tr: 'Mesaj kutusu, talep onaylanana kadar kilitlidir.', en: 'Message box is locked until the request is approved.', de: 'Das Nachrichtenfeld ist gesperrt, bis die Anfrage genehmigt ist.', fr: 'La zone de message est verrouillee jusqu a approbation.', es: 'La caja de mensajes esta bloqueada hasta que se apruebe la solicitud.', ru: 'Pole soobshcheniya zablokirovano do podtverzhdeniya zaprosa.' },
    lockedClosed: { tr: 'Mesaj kutusu kapali. Yeni iletisim icin yeni talep baslatin.', en: 'Message box is closed. Start a new request to contact again.', de: 'Das Nachrichtenfeld ist geschlossen. Starten Sie eine neue Anfrage.', fr: 'La zone de message est fermee. Lancez une nouvelle demande.', es: 'La caja de mensajes esta cerrada. Inicia una nueva solicitud.', ru: 'Pole soobshcheniya zakryto. Nachnite novyy zapros dlya svyazi.' },
    addFile: { tr: 'Dosya ekle', en: 'Attach file', de: 'Datei anhangen', fr: 'Joindre un fichier', es: 'Adjuntar archivo', ru: 'Prikrepit fail' },
    writeMessage: { tr: 'Mesajinizi yazin... (Enter ile gonder, Shift+Enter ile yeni satir)', en: 'Write your message... (Enter to send, Shift+Enter for new line)', de: 'Nachricht schreiben... (Enter zum Senden, Shift+Enter fur neue Zeile)', fr: 'Ecrivez votre message... (Entree pour envoyer, Shift+Entree pour nouvelle ligne)', es: 'Escribe tu mensaje... (Enter para enviar, Shift+Enter para nueva linea)', ru: 'Napishete soobshchenie... (Enter otpravit, Shift+Enter novaya stroka)' },
    send: { tr: 'Gonder', en: 'Send', de: 'Senden', fr: 'Envoyer', es: 'Enviar', ru: 'Otpravit' },
    uploading: { tr: 'yukleniyor...', en: 'uploading...', de: 'wird hochgeladen...', fr: 'telechargement...', es: 'subiendo...', ru: 'zagruzhaetsya...' },
    securityNotice: { tr: 'SpotItForme uzerinden kisisel bilgi (telefon, adres, kart bilgisi) paylasmayin. Odemeler icin guvenli kanallar kullanin.', en: 'Do not share personal information (phone, address, card details) on SpotItForme. Use secure payment channels.', de: 'Teilen Sie keine personlichen Daten (Telefon, Adresse, Kartendaten) uber SpotItForme. Nutzen Sie sichere Zahlungswege.', fr: 'Ne partagez pas d informations personnelles (telephone, adresse, carte) sur SpotItForme. Utilisez des paiements securises.', es: 'No compartas informacion personal (telefono, direccion, tarjeta) en SpotItForme. Usa canales de pago seguros.', ru: 'Ne delites lichnymi dannymi (telefon, adres, karta) v SpotItForme. Ispolzuyte bezopasnye kanaly oplaty.' },
  } as const

  const trText = <K extends keyof typeof t>(key: K) => t[key][locale] ?? t[key].tr
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (threadId) {
      fetchThreadData()
    }
  }, [threadId])

  useEffect(() => {
    if (!threadId || !userId) return

    const channel = supabase
      .channel(`message-thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const incoming = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]))

          if (incoming.sender_id !== userId) {
            await supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', incoming.id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_threads',
          filter: `id=eq.${threadId}`,
        },
        (payload) => {
          const next = payload.new as Partial<ThreadMeta>
          setThreadMeta((prev) =>
            prev
              ? {
                  ...prev,
                  participant1_language: (next.participant1_language as SupportedLocale | null | undefined) ?? prev.participant1_language,
                  participant2_language: (next.participant2_language as SupportedLocale | null | undefined) ?? prev.participant2_language,
                  request_status: (next.request_status as ThreadMeta['request_status']) ?? prev.request_status,
                  request_initiator_id: next.request_initiator_id ?? prev.request_initiator_id,
                  request_message: next.request_message ?? prev.request_message,
                  request_responded_at: next.request_responded_at ?? prev.request_responded_at,
                }
              : prev
          )
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [threadId, userId])

  useEffect(() => {
    if (!threadId || !userId || !participant?.id) return

    const presenceChannel = supabase.channel(`presence-thread:${threadId}`, {
      config: { presence: { key: userId } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const otherOnline = Object.prototype.hasOwnProperty.call(state, participant.id)
        setPresenceOnline(otherOnline)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      void supabase.removeChannel(presenceChannel)
    }
  }, [threadId, userId, participant?.id])

  const currentConversationLanguage: SupportedLocale =
    threadMeta?.participant1_id === userId
      ? threadMeta?.participant1_language || locale
      : threadMeta?.participant2_language || locale

  const otherParticipantLanguage: SupportedLocale | null =
    threadMeta?.participant1_id === userId
      ? threadMeta?.participant2_language || null
      : threadMeta?.participant1_language || null

  useEffect(() => {
    let cancelled = false

    const translateIncomingMessages = async () => {
      if (!messages.length || !currentConversationLanguage) {
        setTranslatedMessages({})
        setDetectedSourceLanguages({})
        return
      }

      setTranslationInProgress(true)
      let anySupported = false
      const nextTranslations: Record<string, string> = {}
      const nextSourceLanguages: Record<string, SupportedLocale | null> = {}

      for (const message of messages) {
        if (message.sender_id === userId || message.type === 'system' || !message.content.trim()) {
          continue
        }

        const result = await translateTextInBrowser({
          text: message.content,
          targetLanguage: currentConversationLanguage,
        })

        if (cancelled) return
        nextSourceLanguages[message.id] = result.sourceLanguage
        if (result.supported) {
          anySupported = true
          nextTranslations[message.id] = result.translatedText
        }
      }

      if (!cancelled) {
        setTranslatedMessages(nextTranslations)
        setDetectedSourceLanguages(nextSourceLanguages)
        setTranslationAvailable(anySupported || Object.keys(nextTranslations).length === 0)
        setTranslationInProgress(false)
      }
    }

    void translateIncomingMessages()

    return () => {
      cancelled = true
    }
  }, [messages, currentConversationLanguage, userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Menüyü dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptions) {
        const target = event.target as HTMLElement
        if (!target.closest('button[title]') && !target.closest('.absolute')) {
          setShowOptions(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showOptions])

  const fetchThreadData = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // 1. Thread bilgilerini çek (legacy şemalarda ilişki join sorunlarına karşı sade sorgu)
      let threadQuery = await supabase
        .from('message_threads')
        .select(
          'id, participant1_id, participant2_id, participant1_language, participant2_language, request_status, request_initiator_id, request_message, request_responded_at'
        )
        .eq('id', threadId)
        .single()

      if (threadQuery.error?.message?.includes('participant1_language')) {
        threadQuery = await supabase
          .from('message_threads')
          .select(
            'id, participant1_id, participant2_id, request_status, request_initiator_id, request_message, request_responded_at'
          )
          .eq('id', threadId)
          .single()
      }

      const { data: threadData, error: threadError } = threadQuery

      if (threadError) throw threadError

      setThreadMeta({
        id: threadData.id,
        participant1_id: threadData.participant1_id,
        participant2_id: threadData.participant2_id,
        participant1_language: threadData.participant1_language || null,
        participant2_language: threadData.participant2_language || null,
        request_status: threadData.request_status || 'accepted',
        request_initiator_id: threadData.request_initiator_id,
        request_message: threadData.request_message,
        request_responded_at: threadData.request_responded_at,
      })

      // 2. Karşı tarafı belirle ve profile bilgisini ayrı çek
      const isParticipant1 = threadData.participant1_id === userId
      const otherParticipantId = isParticipant1
        ? threadData.participant2_id
        : threadData.participant1_id

      let profileData: any = null
      let profileError: any = null

      const profileSelectCandidates = [
        'id, full_name, username, avatar_url',
        'id, full_name, username',
        'id, full_name',
      ]

      for (const selectFields of profileSelectCandidates) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select(selectFields)
          .eq('id', otherParticipantId)
          .maybeSingle()

        if (!error) {
          profileData = data
          profileError = null
          break
        }

        profileError = error
      }

      if (profileError && !profileData) {
        console.warn('Katılımcı profili yüklenemedi:', profileError)
      }

      let conversationData: any = null
      const conversationSelectCandidates = [
        'id, participant1_id, participant2_id, other_user_name, other_user_avatar, participant1_name, participant2_name',
        'id, participant1_id, participant2_id, other_user_name, participant1_name, participant2_name',
      ]

      for (const selectFields of conversationSelectCandidates) {
        const { data, error } = await supabase
          .from('active_conversations')
          .select(selectFields)
          .eq('id', threadId)
          .maybeSingle()

        if (!error) {
          conversationData = data
          break
        }
      }

      const fallbackConversationName =
        conversationData?.other_user_name ||
        (conversationData?.participant1_id === userId
          ? conversationData?.participant2_name
          : conversationData?.participant1_name) ||
        ''

      // Her zaman sadece full_name göster
      console.log("profileData:", profileData);
      let participantName = profileData?.full_name || 'Kullanıcı';

      const participantAvatar =
        (profileData as any)?.avatar_url ||
        (profileData as any)?.avatar ||
        conversationData?.other_user_avatar ||
        ''

      const participantLastSeen = (profileData as any)?.last_seen || undefined

      setParticipant({
        id: otherParticipantId || 'unknown',
        name: participantName,
        avatar: participantAvatar,
        is_online: participantLastSeen
          ? new Date(participantLastSeen).getTime() > Date.now() - 5 * 60 * 1000
          : false,
        last_seen: participantLastSeen,
      })

      // 3. Mesajları çek
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      setMessages(messagesData || [])
      
      // 4. Okunmamış mesajları işaretle
      await markMessagesAsRead(isParticipant1)

    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error)
      setParticipant(null)
      setMessages([])
      setLoadError(trText('threadLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (isParticipant1: boolean) => {
    try {
      // Mesajları okundu olarak işaretle
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      // Thread'deki okunmamış sayısını sıfırla
      const updateField = isParticipant1 ? 'unread_count_p1' : 'unread_count_p2'
      await supabase
        .from('message_threads')
        .update({ [updateField]: 0 })
        .eq('id', threadId)

    } catch (error) {
      console.error('Okundu işaretleme hatası:', error)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async () => {
    if (threadMeta?.request_status === 'pending') {
      toast.error(trText('needAcceptedRequest'))
      return
    }

    if (threadMeta?.request_status === 'rejected') {
      toast.error(trText('requestAlreadyRejected'))
      return
    }

    if (!newMessage.trim() && !attachment) return

    setSending(true)

    try {
      // 1. Kullanıcı bilgisi
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error(trText('userNotFound'))

      let attachmentUrl = null
      
      // 2. Dosya yükleme
      if (attachment) {
        const fileExt = attachment.name.split('.').pop()
        const fileName = `${user.id}/${threadId}/${Date.now()}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('message-attachments')
          .upload(fileName, attachment)

        if (error) throw error
        attachmentUrl = data?.path
      }

      // 3. Supabase'e kaydet ve gercek kaydi geri al
      const { data: insertedMessage, error: saveError } = await supabase
        .from('messages')
        .insert([{
          thread_id: threadId,
          sender_id: user.id,
          receiver_id: participant?.id || null,
          content: newMessage,
          attachments: attachmentUrl ? [attachmentUrl] : null,
          type: attachment ? 'image' : 'text'
        }])
        .select('*')
        .single()

      if (saveError) throw saveError

      if (insertedMessage) {
        setMessages((prev) => (prev.some((m) => m.id === insertedMessage.id) ? prev : [...prev, insertedMessage as Message]))
      }

      // 5. Thread'i güncelle
      const { error: updateError } = await supabase
        .from('message_threads')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: newMessage.substring(0, 100),
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId)

      if (updateError) console.warn('Thread güncellenemedi:', updateError)

      // 6. Formu temizle
      setNewMessage('')
      setAttachment(null)
      setUploadProgress(0)

    } catch (error) {
      console.error('Mesaj gönderilemedi:', error)
      toast.error(trText('sendFailed'))
    } finally {
      setSending(false)
    }
  }

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(trText('fileTooLarge'))
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error(trText('fileTypeInvalid'))
        return
      }
      
      setAttachment(file)
      // Upload progress simülasyonu
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 100)
    }
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLanguageLabel = (language: SupportedLocale | null | undefined) => {
    switch (language) {
      case 'tr':
        return 'Turkce'
      case 'en':
        return 'English'
      case 'de':
        return 'Deutsch'
      case 'fr':
        return 'Francais'
      case 'es':
        return 'Espanol'
      case 'ru':
        return 'Russkiy'
      default:
        return null
    }
  }

  const handleConversationLanguageChange = async (nextLanguage: SupportedLocale) => {
    if (!threadMeta) return

    const columnName = threadMeta.participant1_id === userId ? 'participant1_language' : 'participant2_language'
    const previousLanguage = currentConversationLanguage

    setLanguageSaving(true)
    setThreadMeta((prev) =>
      prev
        ? {
            ...prev,
            [columnName]: nextLanguage,
          }
        : prev
    )

    const { error } = await supabase
      .from('message_threads')
      .update({ [columnName]: nextLanguage })
      .eq('id', threadId)

    setLanguageSaving(false)

    if (error) {
      toast.error(trText('languageSaveFailed'))
      setThreadMeta((prev) =>
        prev
          ? {
              ...prev,
              [columnName]: previousLanguage,
            }
          : prev
      )
      return
    }

    toast.success(trText('languageUpdated'), 2500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRequestDecision = async (decision: 'accept' | 'reject') => {
    try {
      setRequestActionLoading(true)

      const nowIso = new Date().toISOString()
      const newStatus = decision === 'accept' ? 'accepted' : 'rejected'

      const { error: updateError } = await supabase
        .from('message_threads')
        .update({
          request_status: newStatus,
          request_responded_at: nowIso,
          last_message_preview:
            decision === 'accept'
              ? trText('requestAcceptedPreview')
              : trText('requestRejectedPreview'),
          updated_at: nowIso,
        })
        .eq('id', threadId)

      if (updateError) throw updateError

      if (decision === 'accept' && participant?.id) {
        await supabase
          .from('messages')
          .insert({
            thread_id: threadId,
            sender_id: userId,
            receiver_id: participant.id,
            content: `✅ ${trText('requestAcceptedSystem')}`,
            type: 'system',
            is_read: false,
          })
      }

      await fetchThreadData()
    } catch (error) {
      console.error('Request decision failed:', error)
      toast.error(trText('requestDecisionFailed'))
    } finally {
      setRequestActionLoading(false)
    }
  }

  const isPendingRequest = threadMeta?.request_status === 'pending'
  const isRejectedRequest = threadMeta?.request_status === 'rejected'
  const isRequestInitiator = threadMeta?.request_initiator_id === userId
  const isParticipantOnline = (participant?.is_online || false) || presenceOnline

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">{trText('loadingMessages')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {participant?.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="font-semibold text-blue-600 text-lg">
                  {participant?.name?.charAt(0) || 'K'}
                </span>
              )}
            </div>
            {isParticipantOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">{participant?.name || trText('user')}</h3>
            <p className="text-sm text-gray-500">
              {isParticipantOnline 
                ? trText('online') 
                : participant?.last_seen 
                  ? `${trText('lastSeen')}: ${new Date(participant.last_seen).toLocaleTimeString(locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'ru-RU')}`
                  : trText('offline')
              }
            </p>
            <p className="mt-1 text-[11px] text-gray-500">
              {trText('otherLanguage')}: {getLanguageLabel(otherParticipantLanguage) || trText('languageUnknown')}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-gray-500">{trText('conversationLanguage')}</label>
              <select
                value={currentConversationLanguage}
                onChange={(e) => handleConversationLanguageChange(e.target.value as SupportedLocale)}
                disabled={languageSaving}
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
              >
                <option value="tr">Turkce</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Francais</option>
                <option value="es">Espanol</option>
                <option value="ru">Russkiy</option>
              </select>
              {translationInProgress ? <span className="text-[11px] text-gray-400">{trText('translating')}</span> : null}
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              {trText('languageHint')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg py-2 z-20">
                <a 
                  href={`/profile/${participant?.id}`}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center"
                  onClick={() => setShowOptions(false)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {trText('profileView')}
                </a>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {trText('deleteConversation')}
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {!translationAvailable && currentConversationLanguage !== locale ? (
          <div className="max-w-2xl mx-auto rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {trText('browserNoTranslate')}
          </div>
        ) : null}
        {loadError ? (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            {loadError}
          </div>
        ) : isPendingRequest ? (
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 text-lg mb-1">
                  {isRequestInitiator ? `⚡ ${trText('requestSentTitle')}` : `🔔 ${trText('newRequestTitle')}`}
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {threadMeta?.request_message || trText('requestDefaultText')}
                </p>
              </div>
            </div>

            {isRequestInitiator ? (
              <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-900 font-medium">
                  ⏳ {trText('requestForwarded')}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-4 border border-amber-200">
                <button
                  onClick={() => handleRequestDecision('accept')}
                  disabled={requestActionLoading}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                >
                  ✔️ {trText('accept')}
                </button>
                <button
                  onClick={() => handleRequestDecision('reject')}
                  disabled={requestActionLoading}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                >
                  ❌ {trText('reject')}
                </button>
              </div>
            )}
          </div>
        ) : isRejectedRequest ? (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            ❌ {trText('requestRejectedBox')}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{trText('noMessageYet')}</p>
              <p className="text-sm mt-1">{trText('sendFirst')}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[70%] rounded-2xl px-4 py-2 relative
                    ${msg.sender_id === userId
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none border'
                    }
                  `}
                >
                  {/* Mesaj içeriği */}
                    <p className="whitespace-pre-wrap break-words">{translatedMessages[msg.id] || msg.content}</p>
                  {msg.sender_id !== userId && getLanguageLabel(detectedSourceLanguages[msg.id]) ? (
                    <p className="mt-1 text-[11px] text-gray-500">
                      {trText('originalLanguage')}: {getLanguageLabel(detectedSourceLanguages[msg.id])}
                    </p>
                  ) : null}
                  
                  {/* Ekler */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((url, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden">
                          {url && url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message-attachments/${url}`}
                              alt="Ek"
                              className="max-w-full h-auto"
                              loading="lazy"
                            />
                          ) : (
                            <a 
                              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message-attachments/${url}`}
                              target="_blank"
                              rel="nofollow ugc noopener noreferrer"
                              className="flex items-center p-2 hover:bg-gray-50"
                            >
                              <Paperclip className="w-4 h-4 mr-2" />
                              <span className="text-sm truncate">{trText('attachment')}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Zaman ve okundu bilgisi */}
                  <div className={`flex items-center justify-between mt-1 ${msg.sender_id === userId ? 'text-blue-200' : 'text-gray-500'}`}>
                    <span className="text-xs">
                      {formatMessageTime(msg.created_at)}
                    </span>
                    {msg.sender_id === userId && (
                      <span className="text-xs ml-2">
                        {msg.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="px-4 py-2 border-t bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">
                {attachment?.name} {trText('uploading')}
              </span>
            </div>
            <span className="text-sm text-blue-700 font-medium">
              %{Math.round(uploadProgress)}
            </span>
          </div>
          <div className="mt-1 w-full bg-blue-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && uploadProgress === 0 && (
        <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                {(attachment.size / 1024).toFixed(1)} KB • {attachment.type.split('/')[1].toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        {isPendingRequest || isRejectedRequest ? (
          <div className="text-sm text-gray-600 bg-gray-50 border rounded-lg px-4 py-3">
            {isPendingRequest
              ? trText('lockedPending')
              : trText('lockedClosed')}
          </div>
        ) : (
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachment}
            accept="image/*,.pdf"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={trText('addFile')}
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={trText('writeMessage')}
              className="w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 resize-none min-h-[44px] max-h-[120px]"
              rows={1}
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`
              }}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-gray-400">
                {newMessage.length}/1000
              </span>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={sending || (!newMessage.trim() && !attachment)}
            className={`
              p-2 rounded-lg flex-shrink-0 transition-colors
              ${sending || (!newMessage.trim() && !attachment)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
            title={trText('send')}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        )}
        
        {/* Security Notice */}
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            {trText('securityNotice')}
          </p>
        </div>
      </div>

      {/* Options Overlay */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}