


"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/types";

const categories = [
  "Tümü",
  "Antika",
  "Elektronik",
  "Oyuncak",
  "Kitap",
  "Müzik",
  "Diğer"
];

export default function ShopsDiscoveryPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("shops")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setShops(data as Shop[]);
    }
    setLoading(false);
  };

  const filteredShops = selectedCategory === "Tümü"
    ? shops
    : shops.filter((shop) =>
        (shop.category || "Diğer") === selectedCategory
      );

  // Popüler mağazalar örneği: en çok ürünü olan ilk 4 mağaza
  const popularShops = [...shops]
    .sort((a, b) => (b.total_images || 0) - (a.total_images || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header layouttan gelmektedir */}
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-emerald-700 mb-6">Mağazaları Keşfet</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Kayıtlı mağazaları kategoriye veya popülerliğe göre filtreleyerek keşfet. Her mağazanın ürünlerini ve puanını inceleyebilirsin.
          </p>
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Popüler Mağazalar */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">Popüler Mağazalar</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {popularShops.length === 0 && !loading && (
                <div className="text-gray-500 col-span-2 text-center">Popüler mağaza bulunamadı.</div>
              )}
              {popularShops.map((shop) => (
                <div key={shop.id} className="bg-emerald-50 border-l-4 border-emerald-400 rounded-xl p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏪</span>
                    <span className="font-bold text-lg text-emerald-900">{shop.shop_name}</span>
                  </div>
                  <div className="text-sm text-gray-600">Kategori: {shop.category || "Diğer"}</div>
                  <div className="text-sm text-gray-600">Ürün: {shop.total_images ?? 0}</div>
                  <div className="text-sm text-yellow-700">Açılış: {new Date(shop.created_at).toLocaleDateString("tr-TR")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tüm Mağazalar */}
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">Tüm Mağazalar</h2>
            {loading ? (
              <div className="text-center text-gray-400 py-12">Mağazalar yükleniyor...</div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center text-gray-400 py-12">Seçili kategoriye ait mağaza bulunamadı.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredShops.map((shop) => (
                  <div key={shop.id} className="bg-white border rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏪</span>
                      <span className="font-bold text-lg text-emerald-900">{shop.shop_name}</span>
                    </div>
                    <div className="text-sm text-gray-600">Kategori: {shop.category || "Diğer"}</div>
                    <div className="text-sm text-gray-600">Ürün: {shop.total_images ?? 0}</div>
                    <div className="text-sm text-yellow-700">Açılış: {new Date(shop.created_at).toLocaleDateString("tr-TR")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Footer layouttan gelmektedir */}
    </div>
  );
}
