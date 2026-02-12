// components/messaging/TradeAgreementForm.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MESSAGING_DISCLAIMERS } from '@/lib/messaging/disclaimer'

interface TradeAgreementFormProps {
  threadId: string
  buyerId: string
  sellerId: string
  productTitle?: string
  onAgreementCreated?: (agreementId: string) => void
  onCancel?: () => void
}

export default function TradeAgreementForm({
  threadId,
  buyerId,
  sellerId,
  productTitle = '',
  onAgreementCreated,
  onCancel
}: TradeAgreementFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Ürün bilgileri
    productDescription: productTitle,
    agreedPrice: '',
    priceCurrency: 'TRY',
    
    // Teslimat
    deliveryMethod: 'local_pickup',
    deliveryAddress: '',
    meetingLocation: '',
    meetingTime: '',
    
    // Ödeme
    paymentMethod: 'cash',
    paymentDetails: '',
    
    // Garanti
    warrantyDays: '0',
    returnPolicy: 'Satın alınan ürün orijinal durumunda iade edilebilir.',
    
    // Kabul
    disclaimerAccepted: false
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 1. Mutabakat formunu oluştur
      const { data: agreement, error } = await supabase
        .from('trade_agreements')
        .insert({
          thread_id: threadId,
          buyer_id: buyerId,
          seller_id: sellerId,
          product_description: formData.productDescription,
          agreed_price: parseFloat(formData.agreedPrice),
          price_currency: formData.priceCurrency,
          delivery_method: formData.deliveryMethod,
          delivery_address: formData.deliveryMethod === 'cargo' ? formData.deliveryAddress : null,
          meeting_location: formData.meetingLocation,
          meeting_time: formData.meetingTime ? new Date(formData.meetingTime).toISOString() : null,
          payment_method: formData.paymentMethod,
          payment_details: formData.paymentDetails,
          warranty_days: parseInt(formData.warrantyDays),
          return_policy: formData.returnPolicy,
          disclaimer_accepted: true,
          disclaimer_text: MESSAGING_DISCLAIMERS.TRADE_AGREEMENT_DISCLAIMER,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // 2. Thread'e sistem mesajı ekle
      await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: buyerId, // Formu başlatan kişi
          receiver_id: sellerId,
          content: `📄 Mutabakat formu oluşturuldu. Lütfen inceleyin ve kabul edin.`,
          content_type: 'agreement',
          is_system_message: true,
          system_message_type: 'agreement_created',
          metadata: { agreement_id: agreement.id }
        })

      // 3. Başarılı
      alert('✅ Mutabakat formu başarıyla oluşturuldu! Karşı taraf onayı bekleniyor.')
      
      if (onAgreementCreated) {
        onAgreementCreated(agreement.id)
      }

    } catch (error) {
      console.error('Mutabakat formu oluşturma hatası:', error)
      alert('Form oluşturulurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const deliveryMethods = [
    { value: 'cargo', label: '🚚 Kargo', description: 'Kargo ile gönderim' },
    { value: 'local_pickup', label: '🏪 Mağazadan Teslim', description: 'Mağazadan teslim alım' },
    { value: 'meetup', label: '🤝 Yerinde Buluşma', description: 'Halka açık yerde buluşma' },
    { value: 'other', label: '📦 Diğer', description: 'Diğer teslimat yöntemi' }
  ]

  const paymentMethods = [
    { value: 'cash', label: '💵 Nakit', description: 'Yüz yüze nakit ödeme' },
    { value: 'bank_transfer', label: '🏦 Banka Havalesi', description: 'Banka havalesi/EFT' },
    { value: 'eft', label: '💳 EFT', description: 'Elektronik fon transferi' },
    { value: 'credit_card', label: '💳 Kredi Kartı', description: 'Kredi kartı ile ödeme' },
    { value: 'other', label: '📄 Diğer', description: 'Diğer ödeme yöntemi' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🤝 Alışveriş Mutabakat Formu</h2>
        <p className="text-gray-600">
          Güvenli alışveriş için tüm detayları belgeleyin. Bu form yasal bağlayıcılığı olmayan bir kayıttır.
        </p>
        
        {/* Step indicator */}
        <div className="flex mt-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex-1">
              <div className={`h-2 rounded-full ${
                step >= stepNum ? 'bg-green-600' : 'bg-gray-200'
              }`}></div>
              <p className="text-xs text-center mt-2">
                {stepNum === 1 ? 'Ürün' : stepNum === 2 ? 'Teslimat' : stepNum === 3 ? 'Ödeme' : 'Özet'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Açıklaması *
              </label>
              <textarea
                value={formData.productDescription}
                onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                placeholder="Satın alınacak ürünün detaylı açıklaması..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg h-32"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Mümkün olduğunca detaylı yazın: marka, model, durum, varsa kusurlar...
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anlaşılan Fiyat (TL) *
                </label>
                <input
                  type="number"
                  value={formData.agreedPrice}
                  onChange={(e) => setFormData({...formData, agreedPrice: e.target.value})}
                  placeholder="Örn: 1500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Garanti Süresi (gün)
                </label>
                <select
                  value={formData.warrantyDays}
                  onChange={(e) => setFormData({...formData, warrantyDays: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="0">Garanti yok</option>
                  <option value="7">7 gün</option>
                  <option value="14">14 gün</option>
                  <option value="30">30 gün</option>
                  <option value="90">90 gün</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Teslimat Yöntemi</h3>
              <div className="grid grid-cols-2 gap-4">
                {deliveryMethods.map((method) => (
                  <label 
                    key={method.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 ${
                      formData.deliveryMethod === method.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.value}
                      checked={formData.deliveryMethod === method.value}
                      onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})}
                      className="sr-only"
                    />
                    <div className="text-lg mb-2">{method.label}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Teslimat detayları */}
            {formData.deliveryMethod === 'cargo' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teslimat Adresi *
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                  placeholder="Tam teslimat adresi..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>
            )}

            {formData.deliveryMethod === 'meetup' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buluşma Yeri *
                  </label>
                  <input
                    type="text"
                    value={formData.meetingLocation}
                    onChange={(e) => setFormData({...formData, meetingLocation: e.target.value})}
                    placeholder="Örn: İstiklal Caddesi Starbucks, Kadıköy Rıhtım"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Halka açık, güvenli ve kameralı bir yer seçin.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buluşma Zamanı
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Ödeme Yöntemi</h3>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 ${
                      formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="sr-only"
                    />
                    <div className="text-lg mb-2">{method.label}</div>
                    <div className="text-sm text-gray-600">{method.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Ödeme detayları */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ödeme Detayları
              </label>
              <textarea
                value={formData.paymentDetails}
                onChange={(e) => setFormData({...formData, paymentDetails: e.target.value})}
                placeholder={
                  formData.paymentMethod === 'bank_transfer' 
                    ? 'Banka adı, IBAN, alıcı adı...' 
                    : formData.paymentMethod === 'cash'
                    ? 'Ödeme yapılacak miktar ve para birimi...'
                    : 'Diğer ödeme detayları...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>

            {/* İade politikası */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İade Politikası
              </label>
              <textarea
                value={formData.returnPolicy}
                onChange={(e) => setFormData({...formData, returnPolicy: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                İade koşullarını açıkça belirtin.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            {/* Özet */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-4">📋 Mutabakat Özeti</h4>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ürün:</p>
                  <p className="font-medium">{formData.productDescription}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Fiyat:</p>
                    <p className="font-medium">{formData.agreedPrice} {formData.priceCurrency}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Teslimat:</p>
                    <p className="font-medium">
                      {deliveryMethods.find(m => m.value === formData.deliveryMethod)?.label}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Ödeme:</p>
                    <p className="font-medium">
                      {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Garanti:</p>
                    <p className="font-medium">
                      {formData.warrantyDays === '0' ? 'Yok' : `${formData.warrantyDays} gün`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sorumluluk reddi */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h4 className="font-bold text-red-900 mb-3">⚠️ KRİTİK UYARI</h4>
              
              <div className="prose prose-sm max-w-none text-red-800">
                {MESSAGING_DISCLAIMERS.TRADE_AGREEMENT_DISCLAIMER.split('\n').map((line, i) => (
                  <p key={i} className={i === 0 ? 'font-bold' : ''}>
                    {line}
                  </p>
                ))}
              </div>
              
              <div className="mt-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.disclaimerAccepted}
                    onChange={(e) => setFormData({...formData, disclaimerAccepted: e.target.checked})}
                    className="mt-1 mr-3 text-red-600"
                    required
                  />
                  <span className="text-sm font-medium text-red-900">
                    Yukarıdaki sorumluluk reddini okudum, anladım ve kabul ediyorum.
                    <br />
                    <span className="font-normal text-red-700">
                      Bu form sadece kayıt amaçlıdır, yasal bağlayıcılığı yoktur.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Tavsiyeler */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-bold text-gray-900 mb-3">💡 Güvenli Alışveriş Tavsiyeleri</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Yerel buluşmalarda halka açık, kameralı yerleri tercih edin</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Ürünü görmeden, teslimat almadan ödeme yapmayın</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Resmi fatura veya garanti belgesi talep edin</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Şüpheli durumları platform@spotitforme.com'a bildirin</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t flex justify-between">
        <button
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
          className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium"
        >
          {step === 1 ? 'İptal' : 'Geri'}
        </button>

        <div className="flex space-x-4">
          {step < 4 && (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
            >
              Devam Et
            </button>
          )}
          
          {step === 4 && (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.disclaimerAccepted || !formData.agreedPrice}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Oluşturuluyor...
                </span>
              ) : (
                'Mutabakat Formunu Oluştur'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}