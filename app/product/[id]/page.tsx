// app/product/[id]/page.tsx - KULLANICILAR İÇİN ÜRÜN DETAY
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Heart, Share2, MessageCircle,
  MapPin, Truck, Star, Shield, Clock, Package,
  CheckCircle, XCircle, Phone, Mail, Instagram, Globe, X
} from 'lucide-react';
import Link from 'next/link';
import SimpleShareButtons from '@/components/SimpleShareButtons';
import NativeAd from '@/components/NativeAd';

interface MyDiscountRequest {
  id: string;
  spot_amount: number;
  discount_amount_usd: number;
  discount_amount_local: number;
  original_price: number;
  final_price: number;
  currency: string;
  exchange_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  responded_at?: string | null;
  updated_at?: string | null;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestingDiscount, setRequestingDiscount] = useState(false);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState<number>(1);
  const [customSpots, setCustomSpots] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [exchangeRateSource, setExchangeRateSource] = useState<'live' | 'fallback'>('fallback');
  const [loadingRate, setLoadingRate] = useState(false);
  const [myDiscountRequest, setMyDiscountRequest] = useState<MyDiscountRequest | null>(null);
  const [loadingMyDiscountRequest, setLoadingMyDiscountRequest] = useState(false);
  const [availableSpots, setAvailableSpots] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
    };

    loadCurrentUser();
  }, []);

  // Döviz kurunu fetch et
  useEffect(() => {
    const fetchExchangeRate = async () => {
      if (!product?.price_currency || product.price_currency === 'USD') {
        setExchangeRate(1);
        return;
      }

      try {
        setLoadingRate(true);
        const res = await fetch(`/api/exchange-rates?from=USD&to=${product.price_currency}`);
        const data = await res.json();
        if (data.rate) {
          setExchangeRate(data.rate);
          setExchangeRateSource(data.source === 'live' ? 'live' : 'fallback');
        }
      } catch (error) {
        console.error('Exchange rate fetch error:', error);
        setExchangeRate(1); // Fallback
      } finally {
        setLoadingRate(false);
      }
    };

    if (product) {
      fetchExchangeRate();
    }
  }, [product?.price_currency]);

  useEffect(() => {
    if (product?.shop_id && product?.id) {
      fetchMyDiscountRequest(product.shop_id, product.id);
    }
  }, [product?.shop_id, product?.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Ürün bilgilerini getir
      const { data: productData, error } = await supabase
        .from('shop_inventory')
        .select('*')
        .eq('id', productId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setProduct(productData);

      // Mağaza bilgilerini getir
      if (productData.shop_id) {
        const { data: shopData } = await supabase
          .from('shops')
          .select('*')
          .eq('id', productData.shop_id)
          .eq('is_active', true)
          .single();
        
        setShop(shopData);
      }

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
          .eq('category', productData.category)
          .eq('status', 'active')
          .neq('id', productId)
          .limit(4);

        setSimilarProducts(similar || []);
      }

    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDiscountRequest = async (shopId: string, inventoryProductId: string) => {
    try {
      setLoadingMyDiscountRequest(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setMyDiscountRequest(null);
        setAvailableSpots(0);
        return;
      }

      const response = await fetch(`/api/shop/${shopId}/inventory/${inventoryProductId}/discount-request`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Discount request status fetch failed:', result?.error || 'unknown error');
        return;
      }

      setMyDiscountRequest(result.request || null);
      setAvailableSpots(result.availableSpots || 0);
    } catch (error) {
      console.error('Discount request status error:', error);
    } finally {
      setLoadingMyDiscountRequest(false);
    }
  };

  const handleContact = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`, '_blank');
    } else if (shop?.email) {
      window.open(`mailto:${shop.email}`, '_blank');
    } else {
      alert('Mağaza iletişim bilgileri bulunamadı');
    }
  };

  const handleMessageRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Mesaj talebi için giriş yapmanız gerekir');
        router.push('/auth/login');
        return;
      }

      if (!shop?.owner_id) {
        alert('Mağaza sahibi bilgisi bulunamadı');
        return;
      }

      if (shop.owner_id === user.id) {
        alert('Kendi mağazanıza mesaj talebi gönderemezsiniz.');
        return;
      }

      const draft = `Merhaba, \"${product?.title || 'ürün'}\" ürünü hakkında bilgi almak istiyorum. Uygun olunca dönüş yapabilir misiniz?`;
      const params = new URLSearchParams({
        receiver: shop.owner_id,
        type: 'shop',
        draft,
      });

      router.push(`/messages?${params.toString()}`);
    } catch (error) {
      console.error('Message request navigation error:', error);
      alert('Mesaj talebi başlatılamadı');
    }
  };

  const handleRequestSpotDiscount = async () => {
    // Kaç Spot talep ettiğini belirle
    const spotAmount = customSpots ? parseInt(customSpots, 10) : selectedSpots;

    if (!spotAmount || spotAmount < 1) {
      alert('Lütfen geçerli bir Spot miktarı seçin');
      return;
    }

    try {
      setRequestingDiscount(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert('İndirim talebi için giriş yapmanız gerekir');
        router.push('/auth/login');
        return;
      }

      // İndirim hesaplaması: 1 Spot = 1 USD
      const discountAmountUsd = spotAmount * 1;
      const discountAmountLocal = discountAmountUsd * exchangeRate;
      const finalPrice = Math.max(0, (product.price || 0) - discountAmountLocal);

      const response = await fetch(`/api/shop/${product.shop_id}/inventory/${product.id}/discount-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          spotAmount,
          discountAmountUsd,
          discountAmountLocal,
          originalPrice: product.price,
          finalPrice,
          currency: product.price_currency,
          exchangeRate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'İndirim talebi oluşturulamadı');
        return;
      }

      await fetchMyDiscountRequest(product.shop_id, product.id);

      const isExistingPending = typeof result.message === 'string' && result.message.toLowerCase().includes('bekleyen');

      if (isExistingPending) {
        alert(`ℹ️ ${result.message}`);
      } else {
        setMyDiscountRequest({
          id: result.request_id,
          spot_amount: spotAmount,
          discount_amount_usd: discountAmountUsd,
          discount_amount_local: discountAmountLocal,
          original_price: Number(product.price) || 0,
          final_price: finalPrice,
          currency: product.price_currency || 'TRY',
          exchange_rate: exchangeRate,
          status: 'pending',
          created_at: new Date().toISOString(),
          responded_at: null,
          updated_at: new Date().toISOString(),
        });

        // availableSpots API'den gelen güncel değerle güncelle (1 spot bloke edildi)
        setAvailableSpots(result.availableSpots || Math.max(0, availableSpots - 1));

        alert(`✅ İndirim talebiniz mağazaya iletildi.\n\n${spotAmount} Spot İndirim Talebiniz:\n${discountAmountLocal.toFixed(2)} ${product.price_currency} indirim\nYeni Fiyat: ${finalPrice.toFixed(2)} ${product.price_currency}\n\n🔒 1 Spot bloke edilmiştir.`);
      }

      setShowSpotModal(false);
      setSelectedSpots(1);
      setCustomSpots('');
    } catch (error) {
      console.error('Discount request error:', error);
      alert('İndirim talebi sırasında hata oluştu');
    } finally {
      setRequestingDiscount(false);
    }
  };

  const handleAddToFavorites = async () => {
    // TODO: Favorilere ekleme işlemi
    setIsFavorite(!isFavorite);
    alert(isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  };

  const parseShippingOptions = (options: any) => {
    if (!options) return { shipping: false, local_pickup: false };
    
    if (typeof options === 'string') {
      try {
        return JSON.parse(options);
      } catch (error) {
        return { shipping: false, local_pickup: false };
      }
    }
    
    return options;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h1>
            <p className="text-gray-600 mb-8">Bu ürün silinmiş veya mevcut değil.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shippingOptions = parseShippingOptions(product.shipping_options);
  const discountPercent = product.discount_percent 
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;
  const spotAmountPreviewRaw = customSpots ? parseInt(customSpots, 10) : selectedSpots;
  const spotAmountPreview = Number.isFinite(spotAmountPreviewRaw) && spotAmountPreviewRaw > 0
    ? spotAmountPreviewRaw
    : 1;
  const discountAmountUsdPreview = spotAmountPreview;
  const discountAmountLocalPreview = discountAmountUsdPreview * exchangeRate;
  const finalPricePreview = Math.max(0, (product?.price || 0) - discountAmountLocalPreview);
  const isPendingRequest = myDiscountRequest?.status === 'pending';
  const requestStatusLabel =
    myDiscountRequest?.status === 'pending'
      ? 'Beklemede'
      : myDiscountRequest?.status === 'approved'
        ? 'Onaylandı'
        : myDiscountRequest?.status === 'rejected'
          ? 'Reddedildi'
          : myDiscountRequest?.status === 'completed'
            ? 'Tamamlandı'
            : myDiscountRequest?.status === 'cancelled'
              ? 'İptal'
              : null;
  const requestStatusClass =
    myDiscountRequest?.status === 'pending'
      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
      : myDiscountRequest?.status === 'approved'
        ? 'bg-green-50 border-green-200 text-green-800'
        : myDiscountRequest?.status === 'rejected'
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-gray-50 border-gray-200 text-gray-700';
  const canSendMessageRequest = !!shop?.owner_id && shop.owner_id !== currentUserId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Üst Navigasyon */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ArrowLeft className="mr-2" size={20} />
            Geri Dön
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Kolon - Ürün Resimleri */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Resimler */}
              {product.images && product.images.length > 0 ? (
                <div>
                  {/* Büyük Resim */}
                  <div className="relative h-96 bg-gray-100">
                    <img
                      src={product.images[activeImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Favori Butonu */}
                    <button
                      onClick={handleAddToFavorites}
                      className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <Heart 
                        size={24} 
                        className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} 
                      />
                    </button>
                    
                    {/* İndirim Badge */}
                    {discountPercent && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                        -%{discountPercent}
                      </div>
                    )}
                  </div>
                  
                  {/* Küçük Resimler */}
                  {product.images.length > 1 && (
                    <div className="p-4 border-t">
                      <div className="flex space-x-2 overflow-x-auto">
                        {product.images.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                              activeImageIndex === index 
                                ? 'ring-2 ring-blue-500' 
                                : 'opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.title} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  <Package className="text-gray-400" size={64} />
                </div>
              )}
              
              {/* Ürün Bilgileri */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {product.category || 'Diğer'}
                    </span>
                    {product.brand && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {product.brand}
                      </span>
                    )}
                    {product.condition && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {product.condition === 'new' ? 'Sıfır' : 
                         product.condition === 'like_new' ? 'Az Kullanılmış' : 
                         product.condition === 'used' ? 'Kullanılmış' : 'Fabrika Çıkışlı'}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {product.title}
                  </h1>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={`${
                            i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">(4.0)</span>
                    </div>
                    <span className="text-gray-500">
                      {product.view_count || 0} görüntülenme
                    </span>
                  </div>
                </div>
                
                {/* Fiyat */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-end">
                    <div className="mr-6">
                      <div className="text-4xl font-bold text-gray-900">
                        {product.price.toLocaleString('tr-TR')} {product.price_currency}
                      </div>
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-xl text-gray-500 line-through">
                          {product.original_price.toLocaleString('tr-TR')} {product.price_currency}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-2">Stok Durumu:</div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${
                        product.quantity > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.quantity > 0 
                          ? `✅ ${product.quantity} adet stokta` 
                          : '❌ Stokta yok'}
                      </div>
                    </div>
                  </div>

                  {product.spot_discount && (
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="font-semibold text-purple-800">
                        💎 {product.spot_discount} Spot indirim fırsatı
                      </div>
                      <p className="text-sm text-purple-700 mt-1">
                        Bu bir anlık satın alma değildir. İndirim, mağaza ile iletişim sonrası tamamlanan alışverişte uygulanır.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Açıklama */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Açıklaması</h2>
                  <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-6 rounded-lg">
                    {product.description || 'Açıklama eklenmemiş.'}
                  </div>
                </div>
                
                {/* Detaylar */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="text-gray-400 mr-3" size={20} />
                      <div>
                        <div className="text-sm text-gray-600">Konum</div>
                        <div className="font-medium">{product.location || shop?.city || 'Belirtilmemiş'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Truck className="text-gray-400 mr-3" size={20} />
                      <div>
                        <div className="text-sm text-gray-600">Kargo Seçenekleri</div>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            {shippingOptions.shipping ? (
                              <>
                                <CheckCircle className="text-green-500 mr-2" size={16} />
                                <span className="font-medium">Kargo ile gönderim</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-red-500 mr-2" size={16} />
                                <span className="text-gray-500">Kargo yok</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center">
                            {shippingOptions.local_pickup ? (
                              <>
                                <CheckCircle className="text-green-500 mr-2" size={16} />
                                <span className="font-medium">Yerinden teslim</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="text-red-500 mr-2" size={16} />
                                <span className="text-gray-500">Yerinden teslim yok</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {product.year && (
                      <div className="flex items-center">
                        <Clock className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm text-gray-600">Üretim Yılı</div>
                          <div className="font-medium">{product.year}</div>
                        </div>
                      </div>
                    )}
                    
                    {product.dimensions && (
                      <div className="flex items-center">
                        <Package className="text-gray-400 mr-3" size={20} />
                        <div>
                          <div className="text-sm text-gray-600">Boyutlar</div>
                          <div className="font-medium">{product.dimensions}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benzer Ürünler */}
            {similarProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarProducts.map((similar) => (
                    <Link
                      key={similar.id}
                      href={`/product/${similar.id}`}
                      className="bg-white rounded-xl shadow hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {similar.images && similar.images.length > 0 ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={similar.images[0]}
                            alt={similar.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                          <Package className="text-gray-400" size={40} />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                          {similar.title}
                        </h3>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600">
                            {similar.price.toLocaleString('tr-TR')} {similar.price_currency}
                          </span>
                          <span className="text-sm text-gray-500">
                            {similar.view_count || 0} görüntüleme
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reklam */}
            <div className="mt-8">
              <NativeAd />
            </div>
          </div>
          
          {/* Sağ Kolon - İşlemler ve Mağaza */}
          <div className="space-y-6">
            {/* İletişim ve İndirim Talebi */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">İletişim ve İndirim Talebi</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">Liste Fiyatı:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {product.price.toLocaleString('tr-TR')} {product.price_currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Nihai ödeme ve teslimat detayları mağaza ile iletişim sonrası netleşir.
                  </p>
                </div>

                {myDiscountRequest && (
                  <div className={`border rounded-lg p-4 ${requestStatusClass}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold">Son İndirim Talebiniz</span>
                      {requestStatusLabel && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/70">
                          {requestStatusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs">
                      {myDiscountRequest.spot_amount} Spot ≈ {Number(myDiscountRequest.discount_amount_local || 0).toFixed(2)} {myDiscountRequest.currency || product.price_currency}
                    </p>
                    <p className="text-xs mt-1 opacity-90">
                      {myDiscountRequest.status === 'pending'
                        ? 'Mağaza yanıtı bekleniyor. Yanıt gelene kadar yeni talep açılamaz.'
                        : myDiscountRequest.status === 'approved'
                          ? 'Talebiniz onaylandı. Mağaza ile iletişime geçebilirsiniz.'
                          : myDiscountRequest.status === 'rejected'
                            ? 'Talep reddedildi. İsterseniz yeni bir miktarla tekrar deneyebilirsiniz.'
                            : 'Talep geçmişinizde kayıtlı.'}
                    </p>
                  </div>
                )}
                
                {/* Butonlar */}
                <div className="space-y-3">
                  {availableSpots < 1 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="font-bold text-red-900">Yeterli Spot'unuz Yok</p>
                          <p className="text-sm text-red-700 mt-1">
                            İndirim talebi vermek için en az 1 Spot'a ihtiyacınız var.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowSpotModal(true)}
                    disabled={loadingMyDiscountRequest || isPendingRequest || availableSpots < 1}
                    className={`w-full text-white py-4 rounded-xl font-bold flex items-center justify-center ${
                      loadingMyDiscountRequest || isPendingRequest || availableSpots < 1
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    <MessageCircle className="mr-2" size={20} />
                    {loadingMyDiscountRequest
                      ? 'Durum Kontrol Ediliyor...'
                      : isPendingRequest
                        ? '⏳ Talebiniz Beklemede'
                        : availableSpots < 1
                          ? '❌ Spotu Yok'
                          : '💎 İndirim Talep Et'}
                  </button>

                  {availableSpots >= 1 && !isPendingRequest && (
                    <p className="text-xs text-gray-600 px-2">
                      ℹ️ Bu teklifi verirken <span className="font-bold text-amber-700">1 Spot bloke</span> edilecektir. 
                      Talep onaylanırsa veya reddedilirse spot serbest bırakılacaktır.
                    </p>
                  )}

                  <button
                    onClick={handleContact}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center"
                  >
                    <MessageCircle className="mr-2" size={20} />
                    Mağaza ile İletişime Geç
                  </button>

                  {canSendMessageRequest && (
                    <button
                      onClick={handleMessageRequest}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center"
                    >
                      <MessageCircle className="mr-2" size={18} />
                      Mesaj Talebi Gönder
                    </button>
                  )}

                  <p className="text-xs text-purple-700 bg-purple-50 rounded-lg p-3">
                    Spot indirimi anlık satın alma değildir. Talep sonrası alışveriş gerçekleşirse, mağaza onayıyla Spot transferi yapılır.
                  </p>
                  
                  <button
                    onClick={handleAddToFavorites}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center ${
                      isFavorite
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="mr-2" size={20} />
                    {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </button>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1">
                    <SimpleShareButtons 
                        url={`/product/${productId}`}
                        title={product.title}
                    />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Güvenlik Bilgileri */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="text-green-500" size={20} />
                  <span>Güvenli alışveriş</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600 mt-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span>SpotItForMe garantisi</span>
                </div>
              </div>
            </div>
            
            {/* Mağaza Bilgileri */}
            {shop && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                    {shop.shop_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{shop.shop_name}</h3>
                    <p className="text-gray-600">{shop.city}</p>
                    {shop.is_verified && (
                      <div className="flex items-center mt-1">
                        <Shield className="text-green-500 mr-1" size={14} />
                        <span className="text-xs text-green-600">Doğrulanmış Mağaza</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {shop.description && (
                    <p className="text-gray-700 text-sm">{shop.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {shop.phone && (
                      <div className="flex items-center">
                        <Phone className="text-gray-400 mr-3" size={16} />
                        <a 
                          href={`tel:${shop.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {shop.phone}
                        </a>
                      </div>
                    )}
                    
                    {shop.email && (
                      <div className="flex items-center">
                        <Mail className="text-gray-400 mr-3" size={16} />
                        <a 
                          href={`mailto:${shop.email}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {shop.email}
                        </a>
                      </div>
                    )}
                    
                    {shop.address && (
                      <div className="flex items-center">
                        <MapPin className="text-gray-400 mr-3" size={16} />
                        <span className="text-gray-700">{shop.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sosyal Medya */}
                <div className="flex space-x-3 mb-6">
                  {shop.website && (
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="nofollow ugc noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <Globe size={20} className="text-gray-600" />
                    </a>
                  )}
                  
                  {shop.instagram && (
                    <a
                      href={`https://instagram.com/${shop.instagram}`}
                      target="_blank"
                      rel="nofollow ugc noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <Instagram size={20} className="text-gray-600" />
                    </a>
                  )}
                </div>
                
                <Link
                  href={`/shop/${shop.id}`}
                  className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-center py-3 rounded-xl font-medium"
                >
                  Mağazayı Ziyaret Et
                </Link>
              </div>
            )}
            
            {/* İstatistikler */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Ürün İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Görüntülenme:</span>
                  <span className="font-bold">{product.view_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favorilere Ekleme:</span>
                  <span className="font-bold">{product.wishlist_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Son Görüntülenme:</span>
                  <span className="font-bold text-sm">
                    {product.last_viewed_at 
                      ? new Date(product.last_viewed_at).toLocaleDateString('tr-TR')
                      : 'Yeni'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Oluşturulma:</span>
                  <span className="font-bold text-sm">
                    {new Date(product.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spot Seçim Modal */}
      {showSpotModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowSpotModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  💎 Kaç Spot İndirim Talep Etmek İstiyorsunuz?
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>1 Spot = 1 USD indirim</strong> anlamına gelir. Mağaza sahibi kabul edebilir veya farklı bir miktar önerebilir.
                </p>
              </div>
              <button
                onClick={() => setShowSpotModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Kapat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Hazır Seçenekler */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Hızlı Seçim</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((spot) => (
                    <button
                      key={spot}
                      onClick={() => {
                        setSelectedSpots(spot);
                        setCustomSpots('');
                      }}
                      className={`py-3 rounded-lg font-bold text-lg transition-all ${
                        selectedSpots === spot && !customSpots
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {spot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Özel Miktar */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase">Özel Miktar</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customSpots}
                  onChange={(e) => {
                    setCustomSpots(e.target.value);
                    if (e.target.value) setSelectedSpots(0);
                  }}
                  placeholder="5, 10, 15..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* İndirim Hesaplaması */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Talep Edilen İndirim:</span>
                    <span className="text-lg font-bold text-purple-600">{spotAmountPreview} Spot</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">= {discountAmountUsdPreview} USD indirim</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Kur: 1 USD = {exchangeRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {product?.price_currency}
                    {loadingRate ? ' (güncelleniyor...)' : exchangeRateSource === 'live' ? ' (canlı kur)' : ' (yedek kur)'}
                  </p>
                </div>

                <div className="border-t border-purple-200 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Orijinal Fiyat:</span>
                    <span className="font-bold text-gray-900">
                      {product?.price?.toLocaleString('tr-TR') || '0'} {product?.price_currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-red-600">- İndirim:</span>
                    <span className="font-bold text-red-600">
                      -{discountAmountLocalPreview.toFixed(2)} {product?.price_currency}
                    </span>
                  </div>
                  <div className="border-t-2 border-purple-300 pt-3 flex justify-between items-center bg-white rounded px-2 py-2">
                    <span className="text-sm font-bold text-gray-900">Tahmini Fiyat:</span>
                    <span className="text-xl font-bold text-green-600">
                      {finalPricePreview.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {product?.price_currency}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 bg-white rounded p-2">
                  💡 <strong>Not:</strong> Bu hesaplama güncel döviz kuruna dayalıdır. Nihai indirim mağaza sahibi tarafından onaylandığında uygulanır.
                </p>
              </div>

              {/* Bilgilendirme */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📋 Akış:</strong>
                  <br />
                  1️⃣ Spot miktarını seçersiniz<br />
                  2️⃣ Mağaza sahibi talebi görür (tahmini fiyatla)<br />
                  3️⃣ Mağaza onaylar veya sayıyı değiştirmeyi teklif eder<br />
                  4️⃣ İletişim başlar (mesaj/telefon/ziyaret)<br />
                  5️⃣ Alışveriş tamamlandığında Spot transferi gerçekleşir
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3 bg-white">
              <button
                onClick={() => {
                  setShowSpotModal(false);
                  setSelectedSpots(1);
                  setCustomSpots('');
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-colors"
              >
                Kapat
              </button>

              <button
                onClick={handleRequestSpotDiscount}
                disabled={requestingDiscount}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
              >
                <MessageCircle className="mr-2" size={18} />
                {requestingDiscount ? 'Gönderiliyor...' : 'Talep Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
