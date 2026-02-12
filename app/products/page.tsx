// app/products/page.tsx - DÜZELTİLMİŞ
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ShopProductCard from '@/components/ShopProductCard';
import { Search, Filter, Loader2 } from 'lucide-react';

// Type tanımlamaları
interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  price_currency: string;
  images: string[];
  status: string;
  shop_id: string;
  // Diğer alanlar...
}

interface CategoryItem {
  category: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('shop_inventory')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);

      // Kategorileri al
      const { data: categoriesData } = await supabase
        .from('shop_inventory')
        .select('category')
        .not('category', 'is', null);

      if (categoriesData) {
        const categoryMap: Record<string, boolean> = {};
        categoriesData.forEach((item: CategoryItem) => {  // DÜZELTME BURADA
          if (item.category) {
            categoryMap[item.category] = true;
          }
        });
        setCategories(Object.keys(categoryMap));
      }

    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tüm Ürünler</h1>
          <p className="text-gray-600">Mağazalarımızın sunduğu tüm ürünleri keşfedin</p>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
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
                  placeholder="Ne aradınız?"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Kategori */}
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

            {/* Filtre Butonu */}
            <div className="flex items-end">
              <button
                onClick={loadProducts}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center"
              >
                <Filter className="mr-2" size={20} />
                Filtrele
              </button>
            </div>
          </div>
        </div>

        {/* Ürünler */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-4" size={48} />
            <p className="text-gray-600">Ürünler yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinize uygun ürün bulunamadı.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {products.length} ürün bulundu
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}