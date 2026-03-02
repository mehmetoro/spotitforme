// app/shop/[id]/inventory/add/page.tsx - STORAGE ONLY VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, X, Loader2, Save, ArrowLeft } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    price_currency: 'TRY',
    quantity: 1,
    location: '',
    status: 'draft'
  });

  useEffect(() => {
    loadShopAndCategories();
  }, [shopId]);

  const loadShopAndCategories = async () => {
    try {
      // Mağaza bilgilerini getir
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (shopData) {
        setShop(shopData);
        setFormData(prev => ({ ...prev, location: shopData.city || '' }));
      }

      // Kategorileri getir
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesData) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Dosya validasyonu
    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası seçin');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Resim boyutu maksimum 5MB olmalıdır');
      return;
    }
    
    setImageFile(file);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // STORAGE'A YÜKLEME (TypeScript-safe)
  const uploadImageToStorage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      // 1. Bucket kontrolü
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Bucket listeleme hatası:', bucketsError);
        throw new Error('Storage erişim hatası');
      }

      // TypeScript için null kontrolü
      if (!buckets) {
        throw new Error('Bucket listesi alınamadı');
      }

      const hasProductImagesBucket = buckets.some(b => b.name === 'product-images');
      
      if (!hasProductImagesBucket) {
        throw new Error('"product-images" bucket bulunamadı. Lütfen Supabase Storage\'da oluşturun.');
      }

      // 2. Dosya adını oluştur
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${shopId}/products/${timestamp}_${randomString}.${fileExt}`;
      
      console.log(`Resim yükleniyor: product-images/${fileName}`);

      // 3. Resmi yükle
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Resim yükleme hatası:', uploadError);
        throw uploadError;
      }

      // 4. Public URL'i al
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      return publicUrl;

    } catch (error: any) {
      console.error('Resim yükleme hatası:', error);
      throw error; // Hata durumunda üst seviyeye fırlat
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.title.trim()) {
      alert('Ürün adı zorunludur');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Geçerli bir fiyat girin');
      return;
    }
    
    if (!imageFile) {
      alert('Lütfen bir resim yükleyin');
      return;
    }

    setLoading(true);

    try {
      // Resim yükle
      const imageUrl = await uploadImageToStorage();
      
      if (!imageUrl) {
        throw new Error('Resim yüklenemedi');
      }

      // Ürünü veritabanına kaydet
      const productData = {
        shop_id: shopId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || null,
        price: parseFloat(formData.price),
        price_currency: formData.price_currency,
        quantity: formData.quantity,
        location: formData.location.trim() || null,
        images: [imageUrl],
        status: formData.status,
        is_negotiable: false,
        view_count: 0,
        inquiry_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: product, error: productError } = await supabase
        .from('shop_inventory')
        .insert(productData)
        .select()
        .single();

      if (productError) {
        console.error('Ürün kaydetme hatası:', productError);
        throw productError;
      }

      // Resim sayacını güncelle
      if (shop) {
        await supabase
          .from('shops')
          .update({ 
            free_images_used: (shop.free_images_used || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', shopId);
      }

      alert('✅ Ürün başarıyla eklendi!');
      router.push(`/shop/${shopId}/dashboard`);
      router.refresh();

    } catch (error: any) {
      console.error('Ürün ekleme hatası:', error);
      
      // Kullanıcı dostu hata mesajları
      let errorMessage = 'Ürün eklenirken bir hata oluştu';
      
      if (error.message?.includes('product-images')) {
        errorMessage = 'Storage bucket bulunamadı. Lütfen Supabase Storage\'da "product-images" bucket oluşturun.';
      } else if (error.message?.includes('storage')) {
        errorMessage = 'Storage erişim hatası. Lütfen storage ayarlarını kontrol edin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Navigasyon */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/shop/${shopId}/dashboard`)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ArrowLeft className="mr-2" size={20} />
              Dashboard'a Dön
            </button>
            
            <div className="text-sm text-gray-600">
              Mağaza: <span className="font-semibold">{shop.shop_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-600 mt-2">Mağazanıza yeni ürün ekleyin</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              
              {/* Resim Yükleme */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Ürün Resmi *</h3>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center"
                    >
                      <X className="mr-1" size={16} />
                      Kaldır
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  {imagePreview ? (
                    <div className="w-full max-w-md">
                      <img
                        src={imagePreview}
                        alt="Ürün resmi önizleme"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="block cursor-pointer"
                      >
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                          <div className="flex flex-col items-center">
                            <Upload className="text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600 font-medium mb-2">
                              Resim Yükleyin
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG veya GIF (max 5MB)
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              Kalan resim hakkı: {shop.total_images - (shop.free_images_used || 0)}
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
                
                {imageFile && (
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>{imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)</p>
                  </div>
                )}
              </div>

              {/* Ürün Bilgileri */}
              <div className="space-y-6">
                {/* Ürün Adı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Sony A7 III Fotoğraf Makinesi"
                  />
                </div>

                {/* Açıklama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ürünün özellikleri, durumu, teknik detayları..."
                  />
                </div>

                {/* Kategori ve Fiyat */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fiyat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (TRY) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">₺</span>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Miktar ve Konum */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Miktar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Adedi
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  {/* Konum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konum
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="İstanbul - Kadıköy"
                    />
                  </div>
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ürün Durumu
                  </label>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="mr-2 h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-700">Taslak</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="mr-2 h-5 w-5 text-blue-600"
                      />
                      <span className="text-gray-700">Aktif</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Bilgi ve Butonlar */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <span>Kalan Resim: {shop.total_images - (shop.free_images_used || 0)}</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/shop/${shopId}/dashboard`)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    disabled={loading}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !imageFile}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={20} />
                        Ürünü Kaydet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}