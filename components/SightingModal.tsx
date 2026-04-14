'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildSeoImageFileName, suggestHashtagsFromText } from '@/lib/content-seo'
import { supabase } from '@/lib/supabase'

interface SightingModalProps {
  spotId: string;
  spotTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}
export default function SightingModal({ spotId, spotTitle, onClose, onSuccess }: SightingModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [helpType, setHelpType] = useState<'physical' | 'virtual'>('physical');
  const [formData, setFormData] = useState({
    title: spotTitle || '',
    location_description: '',
    price: '',
    notes: '',
    image_url: '',
    category: '',
    hashtags: '',
    latitude: null as number | null,
    longitude: null as number | null,
    product_url: '',
    marketplace: '',
    seller_name: '',
    link_preview_title: '',
    link_preview_image: '',
    link_preview_description: '',
    link_preview_brand: '',
    link_preview_availability: '',
    link_preview_currency: 'TRY',
    source_domain: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
    const [pendingWarning, setPendingWarning] = useState('');
  const hashtagCount = formData.hashtags
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.startsWith('#')).length;
  const suggestedHashtags = suggestHashtagsFromText([
    formData.title,
    formData.notes,
    formData.link_preview_description,
    formData.category,
    formData.location_description,
  ]).filter((tag) => !formData.hashtags.includes(tag));

  const commonCurrencies = ['TRY', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED', 'SAR'];
  const selectedCurrency = (formData.link_preview_currency || 'TRY').toUpperCase();
  const currencyOptions = commonCurrencies.includes(selectedCurrency)
    ? commonCurrencies
    : [...commonCurrencies, selectedCurrency];

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase();
    if (code === 'TRY') return '₺';
    if (code === 'USD') return '$';
    if (code === 'EUR') return '€';
    if (code === 'GBP') return '£';
    if (code === 'JPY') return '¥';
    if (code === 'CNY') return '¥';
    return `${code} `;
  };

  const buildCombinedDetail = (manualDetail: string, previewDetail: string) => {
    const normalizedManual = manualDetail.trim();
    const normalizedPreview = previewDetail.trim();

    if (normalizedManual && normalizedPreview) {
      if (normalizedManual.toLowerCase().includes(normalizedPreview.toLowerCase())) {
        return normalizedManual;
      }
      return `${normalizedManual}\n\nUrun detayi: ${normalizedPreview}`;
    }

    return normalizedManual || normalizedPreview || '';
  };

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

  const addSuggestedHashtag = (tag: string) => {
    const currentTags = formData.hashtags.trim();
    if (currentTags.includes(tag)) return;
    setFormData({
      ...formData,
      hashtags: currentTags ? `${currentTags} ${tag}` : tag,
    });
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

  const fetchLinkPreview = async () => {
    if (!formData.product_url.trim()) return;
    setPreviewLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(formData.product_url.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Link okunamadı');
      }
      setFormData((prev) => ({
        ...prev,
        title: prev.title ? prev.title : (data.title || prev.title),
        price: prev.price ? prev.price : (data.price || prev.price),
        notes: prev.notes ? prev.notes : (data.description || prev.notes),
        link_preview_title: data.title || prev.link_preview_title,
        link_preview_image: data.image || prev.link_preview_image,
        link_preview_description: data.description || prev.link_preview_description,
        link_preview_brand: data.brand || prev.link_preview_brand,
        link_preview_availability: data.availability || prev.link_preview_availability,
        link_preview_currency: data.currency || prev.link_preview_currency,
        marketplace: data.marketplace || prev.marketplace,
        seller_name: data.seller || prev.seller_name,
        product_url: data.url || prev.product_url,
        source_domain: data.domain || prev.source_domain,
      }));
    } catch (error: any) {
      setErrorMessage(error?.message || 'Link önizlemesi alınamadı');
    } finally {
      setPreviewLoading(false);
    }
  };

  // FORM GÖNDERİMİ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Lütfen ürün adını girin');
      return;
    }
    if (formData.title.trim().length < 10) {
      setErrorMessage('Başlık en az 10 karakter olmalı. Marka veya model bilgisi ekleyin.');
      return;
    }
    if (helpType === 'physical' && !formData.location_description.trim()) {
      setErrorMessage('Lütfen nerede gördüğünüzü belirtin');
      return;
    }
    if (helpType === 'virtual' && !formData.product_url.trim()) {
      setErrorMessage('Sanal yardım için ürün linki zorunludur');
      return;
    }
    if (hashtagCount === 0) {
      setErrorMessage('En az bir hashtag ekleyin. Etiketler yardım sayfasının keşfedilmesini güçlendirir.');
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
        const filePath = buildSeoImageFileName({
          folder: 'sighting-images',
          userId: user.id,
          title: formData.title || spotTitle,
          originalName: imageFile.name,
          prefix: spotTitle,
        });
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
      if (!uploadedImageUrl && helpType === 'virtual' && formData.link_preview_image.trim()) {
        uploadedImageUrl = formData.link_preview_image.trim();
      }

      const sightingData = {
        spot_id: spotId,
        spotter_id: user.id,
        title: helpType === 'virtual'
          ? formData.link_preview_title.trim() || formData.title.trim() || spotTitle
          : formData.title.trim() || spotTitle,
        location_description: helpType === 'physical'
          ? formData.location_description.trim()
          : (formData.marketplace || formData.source_domain || 'Sanal ortam'),
        price: formData.price ? parseFloat(formData.price) : null,
        notes: buildCombinedDetail(formData.notes, formData.link_preview_description) || null,
        image_url: uploadedImageUrl || null,
        category: formData.category || null,
        hashtags: formData.hashtags.trim() || null,
        latitude: helpType === 'physical' ? formData.latitude || null : null,
        longitude: helpType === 'physical' ? formData.longitude || null : null,
        source_channel: helpType,
        product_url: formData.product_url.trim() || null,
        marketplace: formData.marketplace.trim() || null,
        seller_name: formData.seller_name.trim() || null,
        link_preview_title: formData.link_preview_title.trim() || null,
        link_preview_image: uploadedImageUrl || formData.link_preview_image.trim() || null,
        link_preview_description: formData.link_preview_description.trim() || null,
        link_preview_brand: formData.link_preview_brand.trim() || null,
        link_preview_availability: formData.link_preview_availability.trim() || null,
        link_preview_currency: formData.link_preview_currency.trim() || null,
        source_domain: formData.source_domain.trim() || null,
      };
      // Pre-publish URL kontrolü (sadece sanal yardımlar için)
      let isPendingReview = false;
      if (helpType === 'virtual' && formData.product_url.trim()) {
        try {
          const checkRes = await fetch('/api/product-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: formData.product_url.trim() }),
          });
          const checkData = await checkRes.json();
          if (checkData.status === 'active') {
            // Satın alınabilir: direkt yayına al
            (sightingData as Record<string, unknown>).is_hidden = false;
            (sightingData as Record<string, unknown>).product_check_status = 'active';
          } else {
            // Stokta yok, kaldırılmış, bot engeli vb: manuel onaya at
            (sightingData as Record<string, unknown>).is_hidden = true;
            (sightingData as Record<string, unknown>).product_check_status = 'pending_review';
            isPendingReview = true;
          }
        } catch {
          // Kontrol hatası: manuel onaya at
          (sightingData as Record<string, unknown>).is_hidden = true;
          (sightingData as Record<string, unknown>).product_check_status = 'pending_review';
          isPendingReview = true;
        }
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('sightings')
        .insert(sightingData)
        .select();
      let finalInsertedData = insertedData;
      let finalInsertError = insertError;

      if (finalInsertError && (
        finalInsertError.message?.includes('product_url') ||
        finalInsertError.message?.includes('marketplace') ||
        finalInsertError.message?.includes('seller_name') ||
        finalInsertError.message?.includes('link_preview_title') ||
        finalInsertError.message?.includes('link_preview_image') ||
        finalInsertError.message?.includes('link_preview_description') ||
        finalInsertError.message?.includes('link_preview_brand') ||
        finalInsertError.message?.includes('link_preview_availability') ||
        finalInsertError.message?.includes('link_preview_currency') ||
        finalInsertError.message?.includes('source_domain')
      )) {
        const legacyPayload = { ...sightingData } as Record<string, any>;
        // source_channel KALDIRILMAMALI — hangi sayfada görüneceğini belirler
        delete legacyPayload.product_url;
        delete legacyPayload.marketplace;
        delete legacyPayload.seller_name;
        delete legacyPayload.link_preview_title;
        delete legacyPayload.link_preview_image;
        delete legacyPayload.link_preview_description;
        delete legacyPayload.link_preview_brand;
        delete legacyPayload.link_preview_availability;
        delete legacyPayload.link_preview_currency;
        delete legacyPayload.source_domain;

        const retry = await supabase
          .from('sightings')
          .insert(legacyPayload)
          .select();

        finalInsertedData = retry.data;
        finalInsertError = retry.error;
      }

      if (finalInsertError) {
        const fallbackErrorMessage = finalInsertError.message || 'Bilinmeyen hata';
        setErrorMessage(`Bildirim kaydedilirken hata oluştu: ${fallbackErrorMessage}`);
        setLoading(false);
        return;
      }

      if (!finalInsertedData || finalInsertedData.length === 0) {
        setErrorMessage('Bildirim kaydedildi fakat kayıt ID alınamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      const sightingId = finalInsertedData[0]?.id;
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
              message: helpType === 'virtual'
                ? `"${spotTitle}" için Yardımlar sayfasında paylaştı`
                : `"${spotTitle}" için "Ben Gördüm" bildirimi gönderdi`,
              spotTitle,
              spotLocation: helpType === 'virtual' ? (formData.marketplace || formData.product_url) : formData.location_description,
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
      
      // Sanal yardım ise listesine yönlendir
      if (helpType === 'virtual') {
        if (isPendingReview) {
          setPendingWarning('Paylaşımınız alındı. Ürün bağlantısı otomatik doğrulanamadığı için incelendikten sonra yayınlanacaktır.');
          setLoading(false);
          setTimeout(() => router.push('/virtual-sightings?tab=virtual-helps'), 3000);
          return;
        }
        router.push('/virtual-sightings?tab=virtual-helps');
      } else {
        onSuccess();
      }
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
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-gray-200 p-1 grid grid-cols-2 gap-1 bg-gray-50">
              <button
                type="button"
                onClick={() => setHelpType('physical')}
                className={`px-3 py-2 text-sm rounded-lg font-semibold ${helpType === 'physical' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600'}`}
              >
                Konumlu Yardım
              </button>
              <button
                type="button"
                onClick={() => setHelpType('virtual')}
                className={`px-3 py-2 text-sm rounded-lg font-semibold ${helpType === 'virtual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600'}`}
              >
                Sanal Yardım
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Başlığı {helpType === 'virtual' && <span className="text-gray-400 font-normal">(boş bırakırsanız ürün adı kullanılır)</span>}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Ürün adı"
              />
              {formData.title.length > 0 && formData.title.trim().length < 10 && (
                <p className="text-xs text-amber-600 mt-1">
                  Başlıkta marka, model veya ürün tipini açık yazın.
                </p>
              )}
            </div>

            {helpType === 'physical' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nerede Gördünüz? *
                  </label>
                  <input
                    type="text"
                    value={formData.location_description}
                    onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Mağaza adı, semt, AVM"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50"
                  disabled={geoLoading}
                >
                  {geoLoading ? 'Konum alınıyor...' : 'Konumu Otomatik Al'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Linki *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.product_url}
                      onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={fetchLinkPreview}
                      className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      disabled={previewLoading || !formData.product_url.trim()}
                    >
                      {previewLoading ? '...' : 'Önizle'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.marketplace}
                    onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Pazar yeri (Amazon, eBay...)"
                  />
                  <input
                    type="text"
                    value={formData.seller_name}
                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Satıcı adı (opsiyonel)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.link_preview_brand}
                    onChange={(e) => setFormData({ ...formData, link_preview_brand: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Marka (otomatik gelir)"
                  />
                  <input
                    type="text"
                    value={formData.link_preview_availability}
                    onChange={(e) => setFormData({ ...formData, link_preview_availability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Stok durumu (opsiyonel)"
                  />
                </div>

                <textarea
                  value={formData.link_preview_description}
                  onChange={(e) => setFormData({ ...formData, link_preview_description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  placeholder="Ürün özeti (boş bırakırsanız linkten gelen açıklama kullanılır)"
                  rows={3}
                />

                {formData.link_preview_image && (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {formData.marketplace || formData.source_domain || 'Online pazar'}
                      </span>
                      <span className="text-[11px] text-gray-500">Mini Ürün Sayfası</span>
                    </div>
                    <div className="flex">
                      <div className="w-28 h-28 bg-gray-100 shrink-0">
                        <img src={formData.link_preview_image} alt="Link önizleme" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {formData.link_preview_title || formData.title || 'Ürün'}
                        </p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {formData.link_preview_description || 'Linkten ürün özeti alındı.'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                          {formData.link_preview_brand && <span>Marka: {formData.link_preview_brand}</span>}
                          {formData.seller_name && <span>Satıcı: {formData.seller_name}</span>}
                          {formData.link_preview_availability && <span>Durum: {formData.link_preview_availability}</span>}
                        </div>
                        {formData.price && (
                          <p className="mt-2 text-sm font-bold text-green-700">
                            {getCurrencyPrefix(formData.link_preview_currency)}
                            {Number(formData.price).toLocaleString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t border-gray-100 text-xs text-blue-700 truncate">
                      {formData.product_url}
                    </div>
                  </div>
                )}
              </>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Gördüğünüz Fiyat <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <select
                value={selectedCurrency}
                onChange={(e) => setFormData({ ...formData, link_preview_currency: e.target.value })}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              >
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Örn: 2500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Etikette veya satıcıdan öğrendiğiniz fiyatı yazın</p>
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
              <option value="Antika ve Koleksiyon">Antika ve Koleksiyon</option>
              <option value="Vintage ve Retro">Vintage ve Retro</option>
              <option value="Kitap ve Plak">Kitap ve Plak</option>
              <option value="Oyuncak ve Figür">Oyuncak ve Figür</option>
              <option value="Saat ve Takı">Saat ve Takı</option>
              <option value="Dekorasyon ve Ev">Dekorasyon ve Ev</option>
              <option value="Mutfak ve Zanaat">Mutfak ve Zanaat</option>
              <option value="Giyim ve Aksesuar">Giyim ve Aksesuar</option>
              <option value="Pazar ve Bit Pazarı">Pazar ve Bit Pazarı</option>
              <option value="Sahaf ve Plakçı">Sahaf ve Plakçı</option>
              <option value="Müzayede ve Mezat">Müzayede ve Mezat</option>
              <option value="Müze ve Sergi">Müze ve Sergi</option>
              <option value="Tarihi Çarşı ve Han">Tarihi Çarşı ve Han</option>
              <option value="Yerel Dükkan ve Atölye">Yerel Dükkan ve Atölye</option>
              <option value="Rota Üstü Durak">Rota Üstü Durak</option>
              <option value="Gizli Mekan">Gizli Mekan</option>
              <option value="Fotoğraflık Nokta">Fotoğraflık Nokta</option>
              <option value="Etkinlik ve Festival">Etkinlik ve Festival</option>
              <option value="Kafe ve Mola Noktası">Kafe ve Mola Noktası</option>
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
            <p className="text-xs text-gray-500 mt-1">Boşlukla ayrılmış hashtag'ler. En az 1 etiket ekleyin.</p>
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Otomatik etiket önerileri</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addSuggestedHashtag(tag)}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* NOTLAR (opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {helpType === 'virtual' ? 'Kendi Detayınız' : 'Ek Notlar'}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={helpType === 'virtual'
                ? 'Kendi yorumunuz, neden nadir oldugu, kondisyon, tavsiye gibi bilgiler... Yazarsanız ürün özetiyle birlikte kullanılır.'
                : 'Stokta sınırlı sayıda var, açıkgöz olun!'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            {helpType === 'virtual' && (
              <p className="text-xs text-gray-500 mt-1">
                Siz detay girmezseniz linkten gelen ürün özeti kullanılır. Girerseniz ikisi birlikte detay sayfasında değerlendirilir.
              </p>
            )}
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
                      {/* MESAJLAR */}
                      {errorMessage && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-2">
                          {errorMessage}
                        </div>
                      )}
                      {pendingWarning && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 mb-2">
                          ⏳ {pendingWarning}
                        </div>
                      )}
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
      </div>
    </form>
  );
}
