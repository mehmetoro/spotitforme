// app/test-geo/page.tsx
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TestGeoPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [position, setPosition] = useState<{lat: number, lon: number} | null>(null)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testGeolocation = () => {
    addLog('Test başlatıldı...')
    
    if (!navigator.geolocation) {
      addLog('❌ Tarayıcı konum desteklemiyor')
      return
    }

    addLog('📍 navigator.geolocation.getCurrentPosition çağrılıyor...')
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        addLog(`✅ Konum alındı! Lat: ${pos.coords.latitude}, Lon: ${pos.coords.longitude}`)
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      (err) => {
        addLog(`❌ Hata: ${err.message} (Kod: ${err.code})`)
        if (err.code === 1) {
          addLog('⚠️ İZİN REDDEDİLDİ! Kullanıcı izin vermedi.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const checkPermissions = () => {
    addLog('İzin durumu kontrol ediliyor...')
    
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as any }).then((result) => {
        addLog(`İzin durumu: ${result.state}`)
        result.onchange = () => {
          addLog(`İzin durumu değişti: ${result.state}`)
        }
      })
    } else {
      addLog('⚠️ Permissions API desteklenmiyor')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container-custom py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          📍 Konum Servisi Testi
        </h1>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Butonlar */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testGeolocation}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold"
            >
              Konum İzni İste
            </button>
            <button
              onClick={checkPermissions}
              className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold"
            >
              İzin Durumunu Kontrol Et
            </button>
          </div>

          {/* URL Bilgisi */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="font-medium">Test URL: {typeof window !== 'undefined' ? window.location.href : ''}</p>
            <p className="text-sm mt-2">
              HTTPS: {window.location.protocol === 'https:' ? '✅' : '❌'}
            </p>
          </div>

          {/* Konum Bilgisi */}
          {position && (
            <div className="p-6 bg-green-50 rounded-xl">
              <h3 className="text-xl font-bold mb-4">📍 Alınan Konum</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Enlem</p>
                  <p className="text-2xl font-bold">{position.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Boylam</p>
                  <p className="text-2xl font-bold">{position.lon.toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loglar */}
          <div className="bg-gray-900 text-white rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📝 Test Logları</h3>
            <div className="h-64 overflow-y-auto font-mono text-sm space-y-2">
              {logs.map((log, i) => (
                <div key={i} className={`p-2 rounded ${log.includes('✅') ? 'bg-green-900' : log.includes('❌') ? 'bg-red-900' : 'bg-gray-800'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Talimatlar */}
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="text-xl font-bold mb-4">📋 Test Talimatları</h3>
            <ol className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                <p>"Konum İzni İste" butonuna tıklayın</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                <p>Tarayıcının <strong>üst kısmında</strong> izin isteğini bekleyin</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                <p><strong>"İzin Ver"</strong> veya <strong>"Allow"</strong> seçeneğini tıklayın</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                <p>Sonuçları loglardan takip edin</p>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}