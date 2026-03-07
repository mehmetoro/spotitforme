// app/shop/[id]/inventory/[productId]/page.tsx - TAMAMI DÜZELTMİŞ
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Edit, Trash2, Package, Tag, Calendar, 
  MapPin, Truck, Eye, Share2, Loader2, DollarSign,
  CheckCircle, XCircle, AlertCircle, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// Helper fonksiyonu
const parseShippingOptions = (options: any) => {
  if (!options) return { shipping: false, local_pickup: false };
  
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch (error) {
      console.error('JSON parse error:', error);
      return { shipping: false, local_pickup: false };
    }
  }
  
  return options;
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSpotAmount, setSelectedSpotAmount] = useState<number>(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [shopId, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Mağaza bilgilerini getir
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();
      
      if (shopData) {
        setShop(shopData);
      }

      // Ürün bilgilerini getir
      const { data: productData, error } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('id', productId)
        .eq('shop_id', shopId)
        .single();

      if (error) throw error;
      setProduct(productData);

      // Görüntüleme sayısını artır
      await supabase
        .from('shop_inventory')
        .update({ 
          view_count: (productData.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', productId);

      // Benzer ürünleri getir
      if (productData.category) {
        const { data: similar } = await supabase
          .from('shop_inventory')
          .select('*')
          .eq('shop_id', shopId)
          .eq('category', productData.category)
          .eq('status', 'active')
          .neq('id', productId)
          .limit(4);

        setSimilarProducts(similar || []);
      }

    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
      alert('Ürün bulunamadı veya yüklenirken bir hata oluştu');
      router.push(`/shop/${shopId}/inventory`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('shop_inventory')
        .delete()
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) throw error;

      // Resim sayacını güncelle
      if (product?.images && shop) {
        const imageCount = product.images.length;
        await supabase
          .from('shops')
          .update({ free_images_used: Math.max(0, shop.free_images_used - imageCount) })
          .eq('id', shopId);
      }

      alert('Ürün başarıyla silindi');
      router.push(`/shop/${shopId}/inventory`);
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Ürün silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shop_inventory')
        .update({ status: newStatus })
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) throw error;

      setProduct({ ...product, status: newStatus });
      alert(`Ürün durumu "${getStatusText(newStatus)}" olarak güncellendi`);
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenirken bir hata oluştu');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/product/${productId}`;
    navigator.clipboard.writeText(url);
    alert('Ürün linki kopyalandı!');
  };

  const handlePurchaseClick = async () => {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Satın almak için giriş yapmanız gerekir');
        router.push('/auth/login');
        return;
      }

      setShowPurchaseModal(true);
    } catch (error) {
      console.error('Purchase init error:', error);
      alert('Bir hata oluştu');
    }
  };

  const handleConfirmPurchase = async () => {
    try {
      setPurchasing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('Oturumu yenileyin ve tekrar deneyin');
        return;
      }

      const response = await fetch(
        `/api/shop/${shopId}/inventory/${productId}/purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            spotAmount: selectedSpotAmount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(`Satın alma başarısız: ${result.error}`);
        return;
      }

      alert(`✅ Satın alma başarılı! Yeni bakiye: ${result.buyer_spot_balance} Spot`);
      setShowPurchaseModal(false);
      router.refresh();
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert('Satın alma işleminde hata oluştu');
    } finally {
      setPurchasing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'draft': return 'Taslak';
      case 'inactive': return 'Pasif';
      case 'sold': return 'Satıldı';
      default: return status;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return 'Sıfır / Yeni';
      case 'like_new': return 'Az Kullanılmış';
      case 'used': return 'Kullanılmış';
      case 'refurbished': return 'Fabrika Çıkışlı';
      case 'for_parts': return 'Parça İçin';
      default: return condition;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-gray-600">Ürün yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              Bu ürün silinmiş veya mevcut değil
            </p>
            <Link
              href={`/shop/${shopId}/inventory`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Envantere Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Shipping options'ı parse et
  const shippingOptions = parseShippingOptions(product.shipping_options);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Üst Navigasyon */}
        <div className="mb-6">
          <Link
            href={`/shop/${shopId}/inventory`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="mr-2" size={20} />
            Envantere Dön
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ürün Başlık ve Durum */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {product.category || 'Kategorisiz'}
                    </span>
                    {product.sku && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  {product.brand && (
                    <p className="text-lg text-gray-600">
                      Marka: <span className="font-medium">{product.brand}</span>
                      {product.model && ` • Model: ${product.model}`}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleShare}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Paylaş"
                  >
                    <Share2 size={20} />
                  </button>
                  <Link
                    href={`/shop/${shopId}/inventory/${productId}/edit`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Düzenle"
                  >
                    <Edit size={20} />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    title="Sil"
                  >
                    {deleting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Ürün Resimleri */}
              {product.images && product.images.length > 0 ? (
                <div className="mb-6">
                  <div className="mb-4">
                    <div className="relative h-96 w-full rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={product.images[activeImageIndex]}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {product.images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`relative h-20 rounded-lg overflow-hidden ${
                            activeImageIndex === index 
                              ? 'ring-2 ring-blue-500 ring-offset-2' 
                              : 'opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} - Resim ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6 h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Package className="text-gray-400" size={64} />
                </div>
              )}

              {/* Açıklama */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Açıklama</h2>
                <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                  {product.description || 'Açıklama eklenmemiş'}
                </div>
              </div>

              {/* Detaylar Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Package className="mr-2" size={16} />
                      Ürün Bilgileri
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durum:</span>
                        <span className="font-medium">{getConditionText(product.condition)}</span>
                      </div>
                      {product.year && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Yıl:</span>
                          <span className="font-medium">{product.year}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stok:</span>
                        <span className={`font-medium ${
                          product.quantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.quantity} adet
                        </span>
                      </div>
                      {product.weight_kg && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ağırlık:</span>
                          <span className="font-medium">{product.weight_kg} kg</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Boyutlar:</span>
                          <span className="font-medium">{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Calendar className="mr-2" size={16} />
                      Zaman Bilgileri
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Oluşturulma:</span>
                        <span className="font-medium">
                          {new Date(product.created_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      {product.last_viewed_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Son Görüntülenme:</span>
                          <span className="font-medium">
                            {new Date(product.last_viewed_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      {product.last_inquiry_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Son Soru:</span>
                          <span className="font-medium">
                            {new Date(product.last_inquiry_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <MapPin className="mr-2" size={16} />
                      Lokasyon & Kargo
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Konum:</span>
                        <span className="font-medium">{product.location || shop?.city || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kargo:</span>
                        <span className="font-medium flex items-center">
                          {shippingOptions.shipping ? (
                            <>
                              <CheckCircle className="text-green-500 mr-1" size={16} />
                              Var
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500 mr-1" size={16} />
                              Yok
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yerinden Teslim:</span>
                        <span className="font-medium flex items-center">
                          {shippingOptions.local_pickup ? (
                            <>
                              <CheckCircle className="text-green-500 mr-1" size={16} />
                              Var
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500 mr-1" size={16} />
                              Yok
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                      <Eye className="mr-2" size={16} />
                      İstatistikler
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Görüntülenme:</span>
                        <span className="font-medium">{product.view_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soru Sayısı:</span>
                        <span className="font-medium">{product.inquiry_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Satılan Adet:</span>
                        <span className="font-medium">{product.sold_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Favori:</span>
                        <span className="font-medium">{product.wishlist_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Etiketler */}
            {product.tags && product.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <Tag className="mr-2" size={20} />
                  Etiketler
                </h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benzer Ürünler */}
            {similarProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Benzer Ürünler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {similarProducts.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/shop/${shopId}/inventory/${similar.id}`}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex">
                        {similar.images && similar.images.length > 0 ? (
                          <img
                            src={similar.images[0]}
                            alt={similar.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <Package className="text-gray-400" size={20} />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">
                            {similar.title}
                          </h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-blue-600">
                              {similar.price.toLocaleString('tr-TR')} {similar.price_currency}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(similar.status)}`}>
                              {getStatusText(similar.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Fiyat ve İşlemler */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="mr-2" size={20} />
                Fiyat ve İşlemler
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fiyat:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price.toLocaleString('tr-TR')} {product.price_currency}
                  </span>
                </div>
                
                {product.original_price && product.original_price > product.price && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Orijinal Fiyat:</span>
                    <span className="text-lg text-gray-500 line-through">
                      {product.original_price.toLocaleString('tr-TR')} {product.price_currency}
                    </span>
                  </div>
                )}
                
                {product.discount_percent && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">İndirim:</span>
                    <span className="text-lg font-bold text-green-600">
                      %{product.discount_percent}
                    </span>
                  </div>
                )}
                
                {product.spot_discount && (
                  <div className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-600">Spot İndirimi:</span>
                    <span className="text-lg font-bold text-purple-600">
                      💎 {product.spot_discount} Spot
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stok Durumu:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity > 0 ? 'Stokta Var' : 'Stokta Yok'}
                  </span>
                </div>
              </div>

              {/* Spot ile Satın Al Butonu */}
              {product.spot_discount && product.quantity > 0 && (
                <button
                  onClick={handlePurchaseClick}
                  className="w-full mb-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center justify-center transition-colors"
                >
                  <ShoppingCart className="mr-2" size={20} />
                  💎 {product.spot_discount} Spot ile Satın Al
                </button>
              )}

              {/* Durum Değiştirme */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Durum Değiştir</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('active')}
                    disabled={product.status === 'active'}
                    className={`p-2 rounded-lg text-sm font-medium ${
                      product.status === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('draft')}
                    disabled={product.status === 'draft'}
                    className={`p-2 rounded-lg text-sm font-medium ${
                      product.status === 'draft'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    Taslak
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('inactive')}
                    disabled={product.status === 'inactive'}
                    className={`p-2 rounded-lg text-sm font-medium ${
                      product.status === 'inactive'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    Pasif
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('sold')}
                    disabled={product.status === 'sold'}
                    className={`p-2 rounded-lg text-sm font-medium ${
                      product.status === 'sold'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Satıldı
                  </button>
                </div>
              </div>

              {/* Hızlı İşlemler */}
              <div className="space-y-3">
                <Link
                  href={`/shop/${shopId}/inventory/${productId}/edit`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
                >
                  <Edit className="mr-2" size={18} />
                  Ürünü Düzenle
                </Link>
                <button
                  onClick={handleShare}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg flex items-center justify-center"
                >
                  <Share2 className="mr-2" size={18} />
                  Paylaş
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/product/${productId}`;
                    window.open(url, '_blank');
                  }}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg flex items-center justify-center"
                >
                  <Eye className="mr-2" size={18} />
                  Canlı Önizleme
                </button>
              </div>
            </div>

            {/* Mağaza Bilgileri */}
            {shop && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-gray-900 mb-4">🏪 Mağaza Bilgileri</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{shop.shop_name}</p>
                    <p className="text-sm text-gray-600">{shop.city}</p>
                  </div>
                  {shop.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email:</p>
                      <p className="font-medium">{shop.email}</p>
                    </div>
                  )}
                  {shop.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Telefon:</p>
                      <p className="font-medium">{shop.phone}</p>
                    </div>
                  )}
                  <Link
                    href={`/shop/${shopId}`}
                    className="inline-block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Mağazayı Görüntüle →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                💎 Spot ile Satın Al
              </h2>

              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <div className="text-lg">
                  <p className="text-gray-600 mb-2">Ürün:</p>
                  <p className="font-bold text-gray-900 mb-4">{product?.title}</p>

                  <p className="text-gray-600 mb-2">Fiyat:</p>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {product?.price.toLocaleString('tr-TR')} {product?.price_currency}
                  </p>

                  <p className="text-gray-600 mb-2">Spot İndirimi:</p>
                  <p className="text-2xl font-bold text-purple-600">
                    💎 {product?.spot_discount} Spot
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Spot Miktarı Seç:</p>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedSpotAmount(amount)}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                        selectedSpotAmount === amount
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {amount} Spot
                    </button>
                  ))}
                </div>
                {selectedSpotAmount !== product?.spot_discount && (
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ {product?.spot_discount} Spot'tan farklı miktar seçtiniz
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-lg">
                💰 Satın alma işlemi tamamlandığında Spot'unuz düşülecek ve satıcıya aktarılacaktır.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={purchasing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2" size={18} />
                      Satın Al
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}