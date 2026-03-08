// components/messaging/MessageThread.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Send, Paperclip, Image as ImageIcon, X, ArrowLeft, MoreVertical, Phone, Video, Info, Trash2, MessageSquare } from 'lucide-react'

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
  const [messages, setMessages] = useState<Message[]>([])
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (threadId) {
      fetchThreadData()
    }
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchThreadData = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // 1. Thread bilgilerini çek
      const { data: threadData, error: threadError } = await supabase
        .from('message_threads')
        .select(`
          *,
          participant1:user_profiles!participant1_id(*),
          participant2:user_profiles!participant2_id(*),
          spot:spots(title)
        `)
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      setThreadMeta({
        id: threadData.id,
        participant1_id: threadData.participant1_id,
        participant2_id: threadData.participant2_id,
        request_status: threadData.request_status || 'accepted',
        request_initiator_id: threadData.request_initiator_id,
        request_message: threadData.request_message,
        request_responded_at: threadData.request_responded_at,
      })

      // 2. Hangi katılımcı biz değiliz?
      let otherParticipant = null
      let isParticipant1 = false
      
      if (threadData.participant1_id === userId) {
        otherParticipant = threadData.participant2
        isParticipant1 = true
      } else {
        otherParticipant = threadData.participant1
        isParticipant1 = false
      }

      setParticipant({
        id: otherParticipant?.id || 'unknown',
        name: otherParticipant?.name || 'Kullanıcı',
        avatar: otherParticipant?.avatar_url || '',
        is_online: otherParticipant?.last_seen ? 
          new Date(otherParticipant.last_seen).getTime() > Date.now() - 5 * 60 * 1000 : false,
        last_seen: otherParticipant?.last_seen
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
      setLoadError('Konuşma yüklenemedi. Lütfen tekrar deneyin.')
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
      toast.error('Bu sohbet için önce mesajlaşma talebinin kabul edilmesi gerekiyor.')
      return
    }

    if (threadMeta?.request_status === 'rejected') {
      toast.error('Bu sohbet talebi reddedildi. Yeni bir talep başlatmalısınız.')
      return
    }

    if (!newMessage.trim() && !attachment) return

    setSending(true)
    const tempMessageId = Date.now().toString()

    try {
      // 1. Kullanıcı bilgisi
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Kullanıcı bulunamadı')

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

      // 3. Yeni mesaj oluştur (optimistik)
      const newMsg: Message = {
        id: tempMessageId,
        sender_id: user.id,
        content: newMessage,
        attachments: attachmentUrl ? [attachmentUrl] : undefined,
        created_at: new Date().toISOString(),
        is_read: false,
        type: attachment ? 'image' : 'text'
      }

      setMessages(prev => [...prev, newMsg])
      
      // 4. Supabase'e kaydet
      const { error: saveError } = await supabase
        .from('messages')
        .insert([{
          thread_id: threadId,
          sender_id: user.id,
          content: newMessage,
          attachments: attachmentUrl ? [attachmentUrl] : null,
          type: attachment ? 'image' : 'text'
        }])

      if (saveError) throw saveError

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
      toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.')
      
      // Optimistik mesajı geri al
      setMessages(prev => prev.filter(msg => msg.id !== tempMessageId))
    } finally {
      setSending(false)
    }
  }

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Dosya boyutu 10MB\'dan küçük olmalı')
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Sadece JPG, PNG, GIF veya PDF dosyaları yükleyebilirsiniz')
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
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
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
              ? 'Mesajlaşma talebi kabul edildi'
              : 'Mesajlaşma talebi reddedildi',
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
            content: '✅ Mesajlaşma talebi kabul edildi. Sohbet başlayabilir.',
            type: 'system',
            is_read: false,
          })
      }

      await fetchThreadData()
    } catch (error) {
      console.error('Request decision failed:', error)
      toast.error('Talep yanıtlanamadı. Lütfen tekrar deneyin.')
    } finally {
      setRequestActionLoading(false)
    }
  }

  const isPendingRequest = threadMeta?.request_status === 'pending'
  const isRejectedRequest = threadMeta?.request_status === 'rejected'
  const isRequestInitiator = threadMeta?.request_initiator_id === userId

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
            <p className="mt-2 text-gray-500">Mesajlar yükleniyor...</p>
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
            {participant?.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">{participant?.name || 'Kullanıcı'}</h3>
            <p className="text-sm text-gray-500">
              {participant?.is_online 
                ? 'Çevrimiçi' 
                : participant?.last_seen 
                  ? `Son görülme: ${new Date(participant.last_seen).toLocaleTimeString('tr-TR')}`
                  : 'Çevrimdışı'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Ara">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Görüntülü ara">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg py-2 z-20">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Profili görüntüle
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Görüşmeyi sil
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm flex items-center">
                  <X className="w-4 h-4 mr-2" />
                  Bildirimleri kapat
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                  {isRequestInitiator ? '⚡ Mesaj Talebi Gönderildi' : '🔔 Yeni Mesaj Talebi'}
                </h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {threadMeta?.request_message || 'Mesajlaşma başlatmak için talep gönderildi.'}
                </p>
              </div>
            </div>

            {isRequestInitiator ? (
              <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-amber-900 font-medium">
                  ⏳ Talebiniz karşı tarafa iletildi. Kabul ettiğinde mesajlaşmaya başlayabileceksiniz.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-4 border border-amber-200">
                <button
                  onClick={() => handleRequestDecision('accept')}
                  disabled={requestActionLoading}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                >
                  ✔️ Kabul Et
                </button>
                <button
                  onClick={() => handleRequestDecision('reject')}
                  disabled={requestActionLoading}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 shadow-md hover:shadow-lg transition-all"
                >
                  ❌ Reddet
                </button>
              </div>
            )}
          </div>
        ) : isRejectedRequest ? (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            ❌ Bu mesajlaşma talebi reddedildi. Yeniden iletişim için yeni talep göndermeniz gerekir.
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Henüz mesaj yok</p>
              <p className="text-sm mt-1">İlk mesajı siz gönderin</p>
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
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  
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
                              rel="noopener noreferrer"
                              className="flex items-center p-2 hover:bg-gray-50"
                            >
                              <Paperclip className="w-4 h-4 mr-2" />
                              <span className="text-sm truncate">Dosya eki</span>
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
                {attachment?.name} yükleniyor...
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
              ? 'Mesaj kutusu, talep onaylanana kadar kilitlidir.'
              : 'Mesaj kutusu kapalı. Yeni iletişim için yeni talep başlatın.'}
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
            title="Dosya ekle"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Mesajınızı yazın... (Enter ile gönder, Shift+Enter ile yeni satır)"
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
            title="Gönder"
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
            • SpotItForme üzerinden kişisel bilgi (telefon, adres, kart bilgisi) paylaşmayın •
            Ödemeler için güvenli kanallar kullanın
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