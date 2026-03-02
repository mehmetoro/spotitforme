// components/admin/AdSenseStatus.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AdSenseStatus {
  isActive: boolean
  clientId: string
  revenue: number
  impressions: number
  ctr: number
  lastUpdate: string
}

export default function AdSenseStatus() {
  const [status, setStatus] = useState<AdSenseStatus>({
    isActive: false,
    clientId: '',
    revenue: 0,
    impressions: 0,
    ctr: 0,
    lastUpdate: new Date().toISOString()
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdSenseStatus()
  }, [])

  const fetchAdSenseStatus = async () => {
    try {
      // Database'den AdSense durumunu getir
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'adsense_config')
        .single()

      if (data) {
        const config = JSON.parse(data.value)
        // Mock data - gerçek uygulamada Google AdSense API'sına bağlanacak
        setStatus({
          isActive: config.isActive || false,
          clientId: config.clientId || '',
          revenue: 245.67,
          impressions: 12543,
          ctr: 1.8,
          lastUpdate: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('AdSense durumu yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAdSense = async () => {
    try {
      const newStatus = !status.isActive
      
      // Database'de güncelle
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'adsense_config')
        .single()

      if (data) {
        const config = JSON.parse(data.value)
        config.isActive = newStatus

        await supabase
          .from('site_settings')
          .update({ value: JSON.stringify(config) })
          .eq('key', 'adsense_config')

        setStatus(prev => ({ ...prev, isActive: newStatus }))
        alert(`AdSense ${newStatus ? 'aktif' : 'devre dışı'} edildi`)
      }
    } catch (error) {
      console.error('AdSense durumu güncellenemedi:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AdSense Durumu</h3>
          <p className="text-gray-600">
            Son güncelleme: {new Date(status.lastUpdate).toLocaleDateString('tr-TR')}
          </p>
        </div>
        
        <button
          onClick={toggleAdSense}
          className={`px-4 py-2 rounded-lg font-medium ${
            status.isActive
              ? 'bg-red-100 hover:bg-red-200 text-red-700'
              : 'bg-green-100 hover:bg-green-200 text-green-700'
          }`}
        >
          {status.isActive ? 'Reklamları Durdur' : 'Reklamları Başlat'}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Durum</p>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${status.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className="font-bold">
              {status.isActive ? 'Aktif' : 'Devre Dışı'}
            </p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Toplam Gelir</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {status.revenue.toFixed(2)} ₺
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-600">Gösterim</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {status.impressions.toLocaleString()}
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600">Tıklama Oranı (CTR)</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {status.ctr}%
          </p>
        </div>
      </div>

      {/* Client ID */}
      {status.clientId && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Client ID</p>
          <code className="text-sm bg-white px-3 py-2 rounded border">
            {status.clientId}
          </code>
        </div>
      )}

      {!status.clientId && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            ⚠️ AdSense Client ID henüz ayarlanmamış. 
            <a href="/admin/adsense" className="font-medium underline ml-1">
              Hemen ayarla
            </a>
          </p>
        </div>
      )}
    </div>
  )
}