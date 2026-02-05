// components/admin/AdUnitManager.tsx
'use client'

import { useState } from 'react'

// Tip tanımları - export edelim
export interface AdUnit {
  id: string
  name: string
  type: 'display' | 'in-article' | 'in-feed'
  size: string
  position: string
  status: 'active' | 'paused'
  revenue: number
}

export interface AdUnitManagerProps {
  adUnits: AdUnit[]
  onUpdate: (units: AdUnit[]) => void
  clientId: string
}

export default function AdUnitManager({ adUnits, onUpdate, clientId }: AdUnitManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [newAdUnit, setNewAdUnit] = useState({
    name: '',
    type: 'display' as 'display' | 'in-article' | 'in-feed',
    size: '300x250',
    position: 'sidebar',
    status: 'active' as 'active' | 'paused'
  })

  const sizes = [
    '300x250', '336x280', '728x90', '970x250',
    '300x600', '320x100', '160x600'
  ]

  const positions = [
    'header', 'sidebar', 'footer',
    'content-top', 'content-middle', 'content-bottom',
    'in-article', 'in-feed'
  ]

  const addAdUnit = () => {
    if (!newAdUnit.name.trim()) {
      alert('Lütfen reklam adı girin')
      return
    }

    const unit: AdUnit = {
      id: `ad-${Date.now()}`,
      name: newAdUnit.name,
      type: newAdUnit.type,
      size: newAdUnit.size,
      position: newAdUnit.position,
      status: newAdUnit.status,
      revenue: 0
    }

    // onUpdate'i çağır - TİP GÜVENLİ
    onUpdate([...adUnits, unit])
    
    // Formu sıfırla
    setNewAdUnit({
      name: '',
      type: 'display',
      size: '300x250',
      position: 'sidebar',
      status: 'active'
    })
    setShowForm(false)
  }

  const toggleAdStatus = (id: string) => {
    // updated değişkenine açık tip ataması yap
    const updated: AdUnit[] = adUnits.map(unit => {
      if (unit.id === id) {
        return {
          ...unit,
          status: unit.status === 'active' ? 'paused' : 'active'
        }
      }
      return unit
    })
    
    // onUpdate'i çağır - artık tip güvenli
    onUpdate(updated)
  }

  const deleteAdUnit = (id: string) => {
    const updated = adUnits.filter(unit => unit.id !== id)
    onUpdate(updated)
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Reklam Üniteleri</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          {showForm ? 'İptal' : '+ Yeni Reklam'}
        </button>
      </div>

      {/* Yeni Reklam Formu */}
      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">Yeni Reklam Ünitesi</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reklam Adı *
              </label>
              <input
                type="text"
                value={newAdUnit.name}
                onChange={(e) => setNewAdUnit(prev => ({...prev, name: e.target.value}))}
                placeholder="Örn: Ana Sayfa Sidebar"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reklam Tipi
              </label>
              <select
                value={newAdUnit.type}
                onChange={(e) => setNewAdUnit(prev => ({
                  ...prev, 
                  type: e.target.value as 'display' | 'in-article' | 'in-feed'
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="display">Display Reklam</option>
                <option value="in-article">Makale İçi</option>
                <option value="in-feed">Feed İçi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boyut
              </label>
              <select
                value={newAdUnit.size}
                onChange={(e) => setNewAdUnit(prev => ({...prev, size: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pozisyon
              </label>
              <select
                value={newAdUnit.position}
                onChange={(e) => setNewAdUnit(prev => ({...prev, position: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Başlangıç Durumu
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={newAdUnit.status === 'active'}
                    onChange={() => setNewAdUnit(prev => ({...prev, status: 'active'}))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                  <span className="text-xs text-gray-500">(Hemen yayında)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="paused"
                    checked={newAdUnit.status === 'paused'}
                    onChange={() => setNewAdUnit(prev => ({...prev, status: 'paused'}))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Duraklatılmış</span>
                  <span className="text-xs text-gray-500">(Daha sonra aktif edilecek)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              İptal
            </button>
            <button
              onClick={addAdUnit}
              disabled={!newAdUnit.name.trim()}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reklam Ekle
            </button>
          </div>
        </div>
      )}

      {/* Reklam Listesi */}
      {adUnits.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-4xl mb-4">📺</div>
          <p className="text-lg font-medium">Henüz reklam üniteniz yok</p>
          <p className="text-sm mt-2">Yeni reklam eklemek için "Yeni Reklam" butonuna tıklayın</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boyut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pozisyon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gelir
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adUnits.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{unit.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {unit.type === 'display' ? 'Display' : 
                         unit.type === 'in-article' ? 'Makale İçi' : 'Feed İçi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        unit.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {unit.status === 'active' ? 'Aktif' : 'Duraklatıldı'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {unit.revenue.toFixed(2)} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleAdStatus(unit.id)}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            unit.status === 'active'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {unit.status === 'active' ? 'Duraklat' : 'Aktif Et'}
                        </button>
                        <button
                          onClick={() => deleteAdUnit(unit.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-medium border border-gray-300"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* İstatistikler */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700">Toplam Reklam</p>
              <p className="text-2xl font-bold text-blue-900">{adUnits.length}</p>
              <p className="text-xs text-blue-600 mt-1">
                {adUnits.filter(u => u.status === 'active').length} aktif
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-700">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-900">
                {adUnits.reduce((sum, unit) => sum + unit.revenue, 0).toFixed(2)} ₺
              </p>
              <p className="text-xs text-green-600 mt-1">
                Ortalama: {(adUnits.reduce((sum, unit) => sum + unit.revenue, 0) / adUnits.length || 0).toFixed(2)} ₺
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-700">Tahmini Aylık</p>
              <p className="text-2xl font-bold text-purple-900">
                {(adUnits.reduce((sum, unit) => sum + unit.revenue, 0) * 30).toFixed(2)} ₺
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Tüm reklamlar aktifse
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}