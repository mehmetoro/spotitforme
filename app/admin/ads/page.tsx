// app/admin/ads/page.tsx - Reklam Ana Sayfası
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminAdsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reklam Yönetimi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-green-600">₺0.00</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Aktif Reklamlar</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Bugünkü Gösterim</h3>
          <p className="text-2xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Bugünkü Tıklama</h3>
          <p className="text-2xl font-bold text-orange-600">0</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('overview')}
        >
          Genel Bakış
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'adsense' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('adsense')}
        >
          AdSense Yönetimi
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manuel Reklamlar
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === 'advertisers' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('advertisers')}
        >
          Reklamverenler
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Hızlı Eylemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/ads/adsense-setup" className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition">
              <h3 className="font-semibold">AdSense Kurulum</h3>
              <p className="text-sm text-gray-600">Google AdSense entegrasyonu</p>
            </Link>
            <Link href="/admin/ads/create-manual" className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 transition">
              <h3 className="font-semibold">Manuel Reklam Ekle</h3>
              <p className="text-sm text-gray-600">Kendi reklamınızı ekleyin</p>
            </Link>
            <Link href="/admin/ads/placements" className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:bg-purple-100 transition">
              <h3 className="font-semibold">Reklam Yerleşimleri</h3>
              <p className="text-sm text-gray-600">Reklam pozisyonlarını yönetin</p>
            </Link>
            <Link href="/admin/ads/reports" className="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:bg-orange-100 transition">
              <h3 className="font-semibold">Raporlar</h3>
              <p className="text-sm text-gray-600">Performans raporları</p>
            </Link>
          </div>
        </div>
      )}

      {activeTab === 'adsense' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">AdSense Yönetimi</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">AdSense Durumu</h3>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>AdSense aktif değil</span>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">AdSense Kurulumu</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">AdSense Client ID</label>
                  <input
                    type="text"
                    placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-sm text-gray-500 mt-1">Google AdSense panelinden alınan client ID</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  AdSense'i Aktif Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Manuel Reklam Yönetimi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Mevcut Reklamlar</h3>
              <Link href="/admin/ads/create-manual" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Yeni Reklam Ekle
              </Link>
            </div>
            
            {/* Reklam listesi buraya gelecek */}
            <div className="text-center py-8 text-gray-500">
              Henüz manuel reklam eklenmemiş
            </div>
          </div>
        </div>
      )}

      {activeTab === 'advertisers' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Reklamveren Yönetimi</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Reklamverenler</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Yeni Reklamveren Ekle
              </button>
            </div>
            
            {/* Reklamveren listesi buraya gelecek */}
            <div className="text-center py-8 text-gray-500">
              Henüz reklamveren eklenmemiş
            </div>
          </div>
        </div>
      )}
    </div>
  );
}