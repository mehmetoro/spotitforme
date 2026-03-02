// app/product/[id]/page.tsx - KULLANICILAR İÇİN ÜRÜN DETAY
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, Heart, Share2, ShoppingCart, MessageCircle,
  MapPin, Truck, Star, Shield, Clock, Package,
  CheckCircle, XCircle, Phone, Mail, Instagram, Globe
} from 'lucide-react';
import Link from 'next/link';
import SimpleShareButtons from '@/components/SimpleShareButtons';
import NativeAd from '@/components/NativeAd';

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
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [productId]);

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

  const handleContact = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`, '_blank');
    } else if (shop?.email) {
      window.open(`mailto:${shop.email}`, '_blank');
    } else {
      alert('Mağaza iletişim bilgileri bulunamadı');
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
            {/* Satın Alma İşlemleri */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Satın Alma</h3>
              
              <div className="space-y-4">
                {/* Miktar Seçimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miktar
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg hover:bg-gray-100"
                    >
                      -
                    </button>
                    <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Toplam Fiyat */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Toplam:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {(product.price * quantity).toLocaleString('tr-TR')} {product.price_currency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {quantity} adet × {product.price.toLocaleString('tr-TR')} {product.price_currency}
                  </div>
                </div>
                
                {/* Butonlar */}
                <div className="space-y-3">
                  <button
                    onClick={handleContact}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center"
                  >
                    <MessageCircle className="mr-2" size={20} />
                    Mağaza ile İletişime Geç
                  </button>
                  
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
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      <Globe size={20} className="text-gray-600" />
                    </a>
                  )}
                  
                  {shop.instagram && (
                    <a
                      href={`https://instagram.com/${shop.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
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
    </div>
  );
}