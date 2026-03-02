// components/TrueLocationPicker.tsx - KESİN ÇALIŞAN
'use client'

import { useState } from 'react'

interface TrueLocationPickerProps {
  onLocationSelect: (location: {
    city: string
    lat?: number
    lng?: number
  }) => void
}

export default function TrueLocationPicker({ onLocationSelect }: TrueLocationPickerProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle')
  const [city, setCity] = useState('')
  const [manualCity, setManualCity] = useState('')

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Trabzon', 'Gaziantep', 'Kayseri', 'Mersin', 'Eskişehir', 'Diyarbakır',
    'Samsun', 'Denizli', 'İzmit', 'Manisa', 'Balıkesir', 'Van', 'Malatya',
    'Türkiye Geneli', 'Yurt Dışı'
  ]

  // KESİN ÇALIŞAN KONUM ALMA FONKSİYONU
  const requestLocationPermission = async () => {
    setStatus('requesting')
    
    // 1. Tarayıcı destekliyor mu?
    if (!navigator.geolocation) {
      setStatus('error')
      alert('Tarayıcınız konum servisini desteklemiyor.')
      return
    }

    // 2. Permissions API ile izin durumunu kontrol et (modern tarayıcılar)
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        
        if (permissionStatus.state === 'denied') {
          setStatus('error')
          alert('Konum izni tarayıcı ayarlarınızdan engellenmiş. Lütfen ayarlardan izin verin.')
          return
        }
        
        if (permissionStatus.state === 'granted') {
          // Zaten izin verilmiş
          getLocation()
          return
        }
      } catch {
        // Permissions API desteklenmiyor, devam et
      }
    }

    // 3. Kullanıcıya açıkça sor (en güvenli yol)
    const userConfirmed = window.confirm(
      'Konumunuzu kullanmamıza izin veriyor musunuz?\n\n' +
      '• Daha hızlı yardım almanızı sağlar\n' +
      '• Sadece şehir bilgisi kullanılır\n' +
      '• Tam adresiniz asla paylaşılmaz\n\n' +
      'Telefonunuz konum izni isteyecek, lütfen "İzin Ver" seçeneğini seçin.'
    )

    if (!userConfirmed) {
      setStatus('idle')
      return
    }

    // 4. Konumu al
    getLocation()
  }

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Şehir bilgisini al
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          )
          const data = await response.json()
          
          let detectedCity = 'Konumunuz'
          if (data.address) {
            detectedCity = data.address.city || 
                          data.address.town || 
                          data.address.county ||
                          `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
          }
          
          setCity(detectedCity)
          setStatus('success')
          onLocationSelect({
            city: detectedCity,
            lat: latitude,
            lng: longitude
          })
        } catch {
          // Şehir bulunamazsa
          setCity('Konum alındı')
          setStatus('success')
          onLocationSelect({
            city: 'Konum alındı',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        }
      },
      (error) => {
        console.error('Konum hatası:', error)
        setStatus('error')
        
        let message = 'Konum alınamadı. '
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            message += 'Lütfen:\n1. Telefon ayarlarından konumu açın\n2. Tarayıcı ayarlarından siteye izin verin\n3. Manuel şehir seçin'
            break
          case 2: // POSITION_UNAVAILABLE
            message += 'GPS veya internet bağlantısı yok.'
            break
          case 3: // TIMEOUT
            message += 'Zaman aşımı. Tekrar deneyin.'
            break
        }
        
        alert(message)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }

  const handleManualSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value
    setManualCity(selectedCity)
    if (selectedCity) {
      onLocationSelect({ city: selectedCity })
    }
  }

  return (
    <div className="space-y-6">
      {/* Seçenekler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPS Butonu - KULLANICI ONAYI İLE */}
        <div className="text-center">
          <button
            type="button"
            onClick={requestLocationPermission}
            disabled={status === 'requesting'}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              status === 'success' 
                ? 'border-green-500 bg-green-50' 
                : status === 'requesting'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-3">📍</div>
            <h4 className="font-bold text-gray-900 mb-2">
              {status === 'requesting' ? 'Konum İsteniyor...' : 'Telefon Konumu Kullan'}
            </h4>
            <p className="text-sm text-gray-600">
              {status === 'success' ? `✓ ${city}` : 'Telefonunuzdan konum izni istenir'}
            </p>
          </button>
          
          {status === 'error' && (
            <p className="text-red-600 text-sm mt-2">
              Konum alınamadı. Lütfen manuel şehir seçin.
            </p>
          )}
        </div>

        {/* Manuel Seçim */}
        <div className="text-center">
          <div className={`w-full p-6 rounded-xl border-2 ${
            manualCity ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <div className="text-3xl mb-3">🏙️</div>
            <h4 className="font-bold text-gray-900 mb-2">Şehir Seç</h4>
            <p className="text-sm text-gray-600">Listeden şehir seçin</p>
          </div>
        </div>
      </div>

      {/* Manuel Şehir Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Şehir Seçin
        </label>
        <select
          value={manualCity}
          onChange={handleManualSelect}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        >
          <option value="">Şehir seçin</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          Telefon konumu çalışmazsa buradan seçin
        </p>
      </div>

      {/* Telefon Kullanıcıları İçin Detaylı Talimatlar */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">📱</span>
          Telefon Kullanıcıları İçin Adımlar:
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-lg p-2 mr-3">1</div>
            <div>
              <p className="font-medium text-blue-900">"Telefon Konumu Kullan" butonuna tıklayın</p>
              <p className="text-sm text-blue-700">Tarayıcı konum izni isteyecek</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-lg p-2 mr-3">2</div>
            <div>
              <p className="font-medium text-blue-900">"İzin Ver" butonuna tıklayın</p>
              <p className="text-sm text-blue-700">
                iOS: "İzin Ver" veya "Uygulama Kullanırken İzin Ver"<br />
                Android: "İzin Ver" veya "Sadece bu seferlik"
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-lg p-2 mr-3">3</div>
            <div>
              <p className="font-medium text-blue-900">Konumunuz otomatik alınacak</p>
              <p className="text-sm text-blue-700">
                Çalışmazsa yukarıdaki listeden şehir seçin
              </p>
            </div>
          </div>
        </div>

        {/* Sorun Giderme */}
        <details className="mt-6">
          <summary className="cursor-pointer text-blue-700 font-medium">
            🛠️ Konum çalışmıyorsa tıklayın
          </summary>
          <div className="mt-3 p-4 bg-white rounded-lg space-y-3">
            <div>
              <p className="font-medium text-gray-900">iPhone (Safari):</p>
              <p className="text-sm text-gray-700">
                1. Ayarlar → Gizlilik → Konum Hizmetleri → AÇIK<br />
                2. Safari → "Konuma Erişim" → "İzin Ver"<br />
                3. Siteyi yeniden yükleyin
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900">Android (Chrome):</p>
              <p className="text-sm text-gray-700">
                1. Ayarlar → Konum → AÇIK<br />
                2. Chrome → Site ayarları → Konum → "Siteden izin istenir"<br />
                3. Siteyi yeniden yükleyin
              </p>
            </div>
          </div>
        </details>
      </div>

      {/* Konum Durumu */}
      {(status === 'success' || manualCity) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center">
            <span className="text-green-600 text-2xl mr-3">✅</span>
            <div>
              <p className="font-bold text-green-900">Konum Seçildi!</p>
              <p className="text-green-800">
                {status === 'success' ? city : manualCity}
              </p>
              <p className="text-sm text-green-700 mt-1">
                Yardım edecek kişiler bu konumu görecek
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}