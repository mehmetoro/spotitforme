


"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/types";
import { useCurrentLocale } from "@/hooks/useCurrentLocale";

const sdText = {
  tr: { title: 'Mağazaları Keşfet', desc: 'Kayıtlı mağazaları kategoriye veya popülerliğe göre filtreleyerek keşfet.', popularTitle: 'Popüler Mağazalar', allTitle: 'Tüm Mağazalar', noPopular: 'Popüler mağaza bulunamadı.', loading: 'Mağazalar yükleniyor...', noShops: 'Seçili kategoriye ait mağaza bulunamadı.', category: 'Kategori:', products: 'Ürün:', opening: 'Açılış:', other: 'Diğer', cats: ['Tümü','Antika','Elektronik','Oyuncak','Kitap','Müzik','Diğer'] },
  en: { title: 'Discover Shops', desc: 'Filter and discover registered shops by category or popularity.', popularTitle: 'Popular Shops', allTitle: 'All Shops', noPopular: 'No popular shops found.', loading: 'Loading shops...', noShops: 'No shops found for the selected category.', category: 'Category:', products: 'Products:', opening: 'Opened:', other: 'Other', cats: ['All','Antique','Electronics','Toy','Book','Music','Other'] },
  de: { title: 'Geschäfte entdecken', desc: 'Registrierte Geschäfte nach Kategorie oder Popularität filtern und entdecken.', popularTitle: 'Beliebte Geschäfte', allTitle: 'Alle Geschäfte', noPopular: 'Keine beliebten Geschäfte gefunden.', loading: 'Geschäfte werden geladen...', noShops: 'Keine Geschäfte in der ausgewählten Kategorie gefunden.', category: 'Kategorie:', products: 'Produkte:', opening: 'Eröffnung:', other: 'Sonstige', cats: ['Alle','Antiquitäten','Elektronik','Spielzeug','Buch','Musik','Sonstige'] },
  fr: { title: 'Découvrir les boutiques', desc: 'Filtrez et découvrez les boutiques enregistrées par catégorie ou popularité.', popularTitle: 'Boutiques populaires', allTitle: 'Toutes les boutiques', noPopular: 'Aucune boutique populaire trouvée.', loading: 'Chargement des boutiques...', noShops: 'Aucune boutique trouvée pour la catégorie sélectionnée.', category: 'Catégorie :', products: 'Produits :', opening: 'Ouverture :', other: 'Autre', cats: ['Tous','Antiquité','Électronique','Jouet','Livre','Musique','Autre'] },
  es: { title: 'Descubrir tiendas', desc: 'Filtra y descubre tiendas registradas por categoría o popularidad.', popularTitle: 'Tiendas populares', allTitle: 'Todas las tiendas', noPopular: 'No se encontraron tiendas populares.', loading: 'Cargando tiendas...', noShops: 'No se encontraron tiendas en la categoría seleccionada.', category: 'Categoría:', products: 'Productos:', opening: 'Apertura:', other: 'Otro', cats: ['Todo','Antigüedad','Electrónica','Juguete','Libro','Música','Otro'] },
  ru: { title: 'Открыть магазины', desc: 'Фильтруйте и открывайте зарегистрированные магазины по категории или популярности.', popularTitle: 'Популярные магазины', allTitle: 'Все магазины', noPopular: 'Популярных магазинов не найдено.', loading: 'Загрузка магазинов...', noShops: 'Магазинов в выбранной категории не найдено.', category: 'Категория:', products: 'Товары:', opening: 'Открытие:', other: 'Другое', cats: ['Все','Антиквариат','Электроника','Игрушки','Книга','Музыка','Другое'] },
} as const


export default function ShopsDiscoveryPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useCurrentLocale();
  const t = sdText[locale as keyof typeof sdText] ?? sdText.tr;
  const [selectedCategory, setSelectedCategory] = useState<string>(t.cats[0]);

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

  const allCat = t.cats[0] as string
  const filteredShops = selectedCategory === allCat
    ? shops
    : shops.filter((shop) =>
        (shop.category || t.other) === selectedCategory
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
          <h1 className="text-4xl font-bold text-center text-emerald-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">{t.desc}</p>
          {/* Kategori Filtreleri */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {t.cats.map((cat) => (
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
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">{t.popularTitle}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {popularShops.length === 0 && !loading && (
                <div className="text-gray-500 col-span-2 text-center">{t.noPopular}</div>
              )}
              {popularShops.map((shop) => (
                <div key={shop.id} className="bg-emerald-50 border-l-4 border-emerald-400 rounded-xl p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏪</span>
                    <span className="font-bold text-lg text-emerald-900">{shop.shop_name}</span>
                  </div>
                  <div className="text-sm text-gray-600">{t.category} {shop.category || t.other}</div>
                  <div className="text-sm text-gray-600">{t.products} {shop.total_images ?? 0}</div>
                  <div className="text-sm text-yellow-700">{t.opening} {new Date(shop.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All Shops */}
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-4">{t.allTitle}</h2>
            {loading ? (
              <div className="text-center text-gray-400 py-12">{t.loading}</div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center text-gray-400 py-12">{t.noShops}</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredShops.map((shop) => (
                  <div key={shop.id} className="bg-white border rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏪</span>
                      <span className="font-bold text-lg text-emerald-900">{shop.shop_name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{t.category} {shop.category || t.other}</div>
                    <div className="text-sm text-gray-600">{t.products} {shop.total_images ?? 0}</div>
                    <div className="text-sm text-yellow-700">{t.opening} {new Date(shop.created_at).toLocaleDateString()}</div>
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
