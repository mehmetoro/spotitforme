// app/admin/ads/create-manual/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateManualAdPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    ad_type: 'manual',
    position: 'sidebar',
    size: '300x250',
    custom_html: '',
    advertiser_name: '',
    advertiser_url: '',
    advertiser_email: '',
    start_date: '',
    end_date: '',
    daily_budget: '',
    total_budget: '',
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Supabase'e kaydet
    router.push('/admin/ads');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Yeni Manuel Reklam Ekle</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reklam Adı *</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Pozisyon *</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            >
              <option value="header">Ana Sayfa Üst (728x90)</option>
              <option value="sidebar">Sağ Sidebar (300x250)</option>
              <option value="inline">İçerik Arası (728x90)</option>
              <option value="mobile">Mobil Banner (320x50)</option>
              <option value="popup">Popup (400x300)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reklamveren Bilgileri</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <input
              type="text"
              placeholder="Şirket Adı"
              className="p-2 border rounded"
              value={formData.advertiser_name}
              onChange={(e) => setFormData({...formData, advertiser_name: e.target.value})}
            />
            <input
              type="url"
              placeholder="Website URL"
              className="p-2 border rounded"
              value={formData.advertiser_url}
              onChange={(e) => setFormData({...formData, advertiser_url: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reklam HTML Kodu</label>
          <textarea
            rows={8}
            className="w-full p-2 border rounded font-mono text-sm"
            placeholder='<a href="https://example.com"><img src="https://example.com/banner.jpg" alt="Reklam" /></a>'
            value={formData.custom_html}
            onChange={(e) => setFormData({...formData, custom_html: e.target.value})}
          />
          <p className="text-sm text-gray-500 mt-1">
            HTML5 banner kodu veya basit HTML. Boyutlara dikkat edin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reklamı Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}