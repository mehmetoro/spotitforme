// app/shop/[id]/inventory/page.tsx - DÜZELTİLMİŞ VERSİYON
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [shopId]);

  const loadData = async () => {
    try {
      // Mağaza bilgilerini getir
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();
      
      if (shopData) {
        setShop(shopData);
      }

      // Ürünleri getir
      await loadProducts();
      
      // Kategorileri getir - DÜZELTİLMİŞ KISIM
      const { data: categoriesData } = await supabase
        .from('shop_inventory')
        .select('category')
        .eq('shop_id', shopId)
        .not('category', 'is', null);

      if (categoriesData) {
        // ESKİ: const uniqueCategories = [...new Set(categoriesData.map(item => item.category))] as string[];
        // YENİ: Set yerine object kullan
        const categoryMap: Record<string, boolean> = {};
        categoriesData.forEach((item: { category: string | null }) => {
          if (item.category) {
            categoryMap[item.category] = true;
          }
        });
        const uniqueCategories = Object.keys(categoryMap);
        setCategories(uniqueCategories);
      }

    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
      alert('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('shop_inventory')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      // Filtreler
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeletingId(productId);
    try {
      const { error } = await supabase
        .from('shop_inventory')
        .delete()
        .eq('id', productId)
        .eq('shop_id', shopId);

      if (error) throw error;

      // Ürün resim sayacını güncelle
      const product = products.find(p => p.id === productId);
      if (product && product.images && shop) {
        const imageCount = product.images.length;
        await supabase
          .from('shops')
          .update({ free_images_used: Math.max(0, shop.free_images_used - imageCount) })
          .eq('id', shopId);
      }

      // Listeyi yenile
      await loadProducts();
      alert('Ürün başarıyla silindi');
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      alert('Ürün silinirken bir hata oluştu');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/shop/${shopId}/inventory/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/shop/${shopId}/inventory/${productId}/edit`);
  };

  const handleAddProduct = () => {
    router.push(`/shop/${shopId}/inventory/add`);
  };

  const handleUpgradePackage = () => {
    router.push('/for-business?upgrade=true');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-gray-600">Envanter yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Başlık ve İstatistikler */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ürün Envanteri</h1>
              <p className="text-gray-600">
                {shop?.shop_name} mağazanızın tüm ürünleri
              </p>
            </div>
            <button
              onClick={handleAddProduct}
              className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Yeni Ürün Ekle
            </button>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Ürün</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center">
                <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktif Ürün</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center">
                <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taslak Ürün</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'draft').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center">
                <div className="bg-red-100 text-red-600 p-3 rounded-lg mr-4">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Satılan Ürün</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'sold').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Arama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Ara
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
                  placeholder="Ürün adı, marka, açıklama..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="draft">Taslak</option>
                <option value="inactive">Pasif</option>
                <option value="sold">Satıldı</option>
              </select>
            </div>

            {/* Kategori Filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={loadProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center"
            >
              <Filter className="mr-2" size={20} />
              Filtrele
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
                loadProducts();
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz ürün eklenmemiş</h3>
              <p className="text-gray-600 mb-6">
                Mağazanıza ilk ürününüzü ekleyerek başlayın
              </p>
              <button
                onClick={handleAddProduct}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                İlk Ürünü Ekle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Ürün</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Kategori</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Durum</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Fiyat</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Stok</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Görüntülenme</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tarih</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <Package className="text-gray-400" size={20} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.title.length > 50 
                                ? product.title.substring(0, 50) + '...' 
                                : product.title}
                            </div>
                            {product.brand && (
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-700">{product.category || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">
                          {product.price.toLocaleString('tr-TR')} {product.price_currency}
                        </div>
                        {product.discount_percent && (
                          <div className="text-sm text-green-600">
                            %{product.discount_percent} indirim
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.quantity > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.quantity} adet
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-700">{product.view_count || 0}</div>
                        <div className="text-xs text-gray-500">görüntülenme</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500">
                          {new Date(product.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Görüntüle"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            title="Sil"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resim Limiti Uyarısı */}
        {shop && shop.free_images_used >= shop.total_images && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="text-yellow-800">
                ⚠️ Resim limitiniz doldu ({shop.free_images_used}/{shop.total_images}). 
                Yeni ürün eklemek için resim yükleyemezsiniz.
              </div>
              <button
                onClick={handleUpgradePackage}
                className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Paket Yükselt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}