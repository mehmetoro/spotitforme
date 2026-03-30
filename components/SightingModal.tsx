'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SightingModalProps {
  spotId: string;
  spotTitle: string;
}
export default function SightingModal({ spotId, spotTitle, onClose, onSuccess }: SightingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: spotTitle || '',
    location_description: '',
    price: '',
    notes: '',
    image_url: '',
    category: '',
    hashtags: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  // RESİM SEÇİMİ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Resim boyutu 5MB\'dan küçük olmalıdır');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Sadece resim dosyaları yüklenebilir');
      return;
    }
    setImageFile(file);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // RESİM KALDIRMA
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: '' });
  };

  // KONUM AL (GEOLOCATION)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Tarayıcın konum bilgisini desteklemiyor');
      return;
    }
    setGeoLoading(true);
    setErrorMessage('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setGeoLoading(false);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(r => r.json())
          .then(data => {
            if (data.address) {
              const addr = `${data.address.city || ''} ${data.address.district || ''} ${data.address.road || ''}`.trim();
              if (addr) {
                setFormData(prev => ({ ...prev, location_description: addr }));
              }
            }
          })
          .catch(() => console.log('Adres taraması başarısız'));
      },
      (error) => {
        setGeoLoading(false);
        console.error('Geolocation error:', error);
        setErrorMessage('Konum alınamadı: ' + error.message);
      }
    );
  };

  // FORM GÖNDERİMİ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Lütfen ürün adını girin');
      return;
    }
    if (!formData.location_description.trim()) {
      setErrorMessage('Lütfen nerede gördüğünüzü belirtin');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage('Bu işlem için giriş yapmalısınız');
        setLoading(false);
        return;
      }
      let uploadedImageUrl = formData.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${spotId}-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `sighting-images/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });
        if (uploadError) {
          console.error('Resim yükleme hatası:', uploadError);
          setErrorMessage('Resim yüklenirken hata oluştu');
          setLoading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(filePath);
        uploadedImageUrl = publicUrl;
      }
      const sightingData = {
        spot_id: spotId,
        spotter_id: user.id,
        title: formData.title.trim(),
        location_description: formData.location_description.trim(),
        price: formData.price ? parseFloat(formData.price) : null,
        notes: formData.notes.trim() || null,
        image_url: uploadedImageUrl || null,
        category: formData.category || null,
        hashtags: formData.hashtags.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null
      };
      const { data: insertedData, error: insertError } = await supabase
        .from('sightings')
        .insert(sightingData)
        .select();
      if (insertError) {
        setErrorMessage(`Bildirim kaydedilirken hata oluştu: ${insertError.message}`);
        setLoading(false);
        return;
      }
      const sightingId = insertedData[0]?.id;
      try {
        const { data: spotData } = await supabase
          .from('spots')
          .select('user_id')
          .eq('id', spotId)
          .single();
        if (spotData && spotData.user_id !== user.id) {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: spotData.user_id,
              actorId: user.id,
              type: 'spot_sighting',
              postId: `sighting-${sightingId}`,
              message: `"${spotTitle}" için "Ben Gördüm" bildirimi gönderdi`,
              spotTitle,
              spotLocation: formData.location_description,
              spotPrice: formData.price,
              spotNotes: formData.notes
            })
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}));
            console.warn('⚠️ Notification API hatası:', payload);
          }
        }
      } catch (notifError) {
        // Bildirim hatası olsa bile devam et
      }
      onSuccess();
    } catch (error) {
      setErrorMessage('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* BAŞLIK */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ben Gördüm! 🎉</h2>
                <p className="text-green-50 text-sm">{spotTitle}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
          {/* KATEGORİ (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Kategori Seç</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Giyim">Giyim</option>
              <option value="Ev Eşyaları">Ev Eşyaları</option>
              <option value="Spor">Spor</option>
              <option value="Kitap">Kitap</option>
              <option value="Oyuncak">Oyuncak</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          {/* HASHTAG'LER (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag'ler
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
              placeholder="Örn: #stokta #indirimli #sınırlı"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Boşlukla ayrılmış hashtag'ler</p>
          </div>
          {/* NOTLAR (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ek Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Stokta sınırlı sayıda var, açıkgöz olun!"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>
          {/* RESİM YÜKLEME (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotoğraf (Opsiyonel)
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Önizleme"
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-green-500 transition">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📷</span>
                  <span className="text-sm text-gray-600">Resim Yükle</span>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {/* BUTONLAR */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
