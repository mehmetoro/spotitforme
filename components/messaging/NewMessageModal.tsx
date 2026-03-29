// components/messaging/NewMessageModal.tsx - DÜZELTİLMİŞ
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { ADMIN_USER_ID } from '@/lib/admin'
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
        full_name: user.full_name || user.name || 'Kullanıcı',
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
          last_active: 'Çevrimiçi',
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
      setFormError('Kullanıcı listesi yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const formatLastActive = (lastSeen: string) => {
    if (!lastSeen) return 'Bilinmiyor'
    
    const lastSeenDate = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - lastSeenDate.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 5) return 'Çevrimiçi'
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)} saat önce`
    return `${Math.floor(diffMins / (60 * 24))} gün önce`
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
      setFormError('Lütfen bir kullanıcı seçin ve mesajınızı yazın.')
      return
    }

    if (!isValidUuid(selectedUser.id)) {
      setFormError('Geçersiz kullanıcı seçimi. Lütfen listeden tekrar seçim yapın.')
      return
    }

    setFormError('')
    setSending(true)
    try {
      const resolvedThreadType = initialThreadType || (selectedSpot ? 'spot' : messageType)

      // Tek kaynak olarak parent callback üzerinden gönder
      const sent = await onSendMessage(selectedUser.id, message, resolvedThreadType)

      if (!sent) {
        setFormError('Mesaj talebi gönderilemedi. Lütfen tekrar deneyin.')
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
      setFormError('Bir hata oluştu. Lütfen tekrar deneyin.')
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
                {step === 'select' ? 'Yeni Mesaj' : `${selectedUser?.full_name}'a Mesaj`}
              </h2>
              <p className="text-sm text-gray-500">
                {step === 'select' 
                  ? 'Bir kullanıcı seçin ve mesajlaşma talebi gönderin' 
                  : 'Talep mesajınızı yazın'}
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
                      Spotlarınız İçin Mesaj Gönderin
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
                                Spot hakkında mesaj gönder
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
                      placeholder="İsim veya kullanıcı adı ile ara..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                  
                  {searchQuery.length > 0 && searchQuery.length < 2 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Aramak için en az 2 karakter girin
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
                    {searchQuery ? 'Arama Sonuçları' : 'Önerilen Kullanıcılar'}
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
                      <p>Kullanıcı bulunamadı</p>
                      <p className="text-sm mt-1">Farklı bir arama terimi deneyin</p>
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
                              {user.last_active === 'Çevrimiçi' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium">{user.full_name}</p>
                                {user.reputation_score && user.reputation_score > 0 ? (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {user.reputation_score} puan
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
                            Mesaj
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
                              {selectedUser.reputation_score} puan
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
                      Kullanıcı değiştir
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
                        Bu spot için mesaj gönderiyorsunuz
                      </p>
                    </div>
                  )}
                </div>

                {/* Mesaj Şablonları */}
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Hızlı Şablonlar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleMessageTemplate('spot_question')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      Ürün Sorusu
                    </button>
                    <button
                      onClick={() => handleMessageTemplate('meeting_request')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      Buluşma Talebi
                    </button>
                    <button
                      onClick={() => handleMessageTemplate('price_offer')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded"
                      disabled={sending}
                    >
                      Fiyat Teklifi
                    </button>
                  </div>
                </div>

                {/* Mesaj Alanı */}
                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesajınız
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        if (formError) setFormError('')
                      }}
                      placeholder="Mesajınızı detaylı bir şekilde yazın..."
                      className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      disabled={sending}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {message.length}/2000 karakter
                      </span>
                      <span className="text-xs text-gray-500">
                        Shift+Enter ile yeni satır
                      </span>
                    </div>
                  </div>

                  {/* Mesaj Türü Seçimi */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj Türü
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
                          {type === 'general' && 'Genel Mesaj'}
                          {type === 'spot' && 'Spot İçin'}
                          {type === 'help' && 'Yardım Talebi'}
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
                              Güvenli Mesajlaşma İpuçları
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
                  İptal
                </button>
                <div className="text-sm text-gray-500 flex items-center">
                  {selectedSpot && (
                    <span className="mr-3">
                      Seçili spot: <span className="font-medium">{selectedSpot.title}</span>
                    </span>
                  )}
                  <span>
                    {filteredUsers.length} kullanıcı
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
                    Geri
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
                      Temizle
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
                          <span>Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Talep Gönder</span>
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