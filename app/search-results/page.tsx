import React from 'react';
import { headers, cookies } from 'next/headers';

const searchText = {
  tr: { title: 'Arama Sonuçları', placeholder: 'Ne aramıştınız?', btn: 'Ara', noResult: 'Sonuç bulunamadı.', noDesc: 'Açıklama yok', category: 'Kategori', price: 'Fiyat' },
  en: { title: 'Search Results', placeholder: 'What were you looking for?', btn: 'Search', noResult: 'No results found.', noDesc: 'No description', category: 'Category', price: 'Price' },
  de: { title: 'Suchergebnisse', placeholder: 'Wonach haben Sie gesucht?', btn: 'Suchen', noResult: 'Keine Ergebnisse gefunden.', noDesc: 'Keine Beschreibung', category: 'Kategorie', price: 'Preis' },
  fr: { title: 'Résultats de recherche', placeholder: 'Que recherchiez-vous ?', btn: 'Rechercher', noResult: 'Aucun résultat trouvé.', noDesc: 'Pas de description', category: 'Catégorie', price: 'Prix' },
  es: { title: 'Resultados de búsqueda', placeholder: '¿Qué estabas buscando?', btn: 'Buscar', noResult: 'No se encontraron resultados.', noDesc: 'Sin descripción', category: 'Categoría', price: 'Precio' },
  ru: { title: 'Результаты поиска', placeholder: 'Что вы искали?', btn: 'Поиск', noResult: 'Результатов не найдено.', noDesc: 'Нет описания', category: 'Категория', price: 'Цена' },
} as const
type SearchLocale = keyof typeof searchText

// Sunucu tarafı arama fonksiyonu (mutlak URL ile)
async function fetchSearchResults(search: string, host: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const baseUrl = `http://${host}`;
  const res = await fetch(`${baseUrl}/api/search-results?${params.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { results } = await res.json();
  return results || [];
}

export default async function SearchResultsPage({ searchParams }: { searchParams: { search?: string } }) {
  const search = searchParams?.search || '';
  const h = headers()
  const host = h.get('host') || '';
  const rawLocale = h.get('x-locale') || cookies().get('NEXT_LOCALE')?.value || 'tr'
  const locale = (rawLocale in searchText ? rawLocale : 'tr') as SearchLocale
  const t = searchText[locale]
  const results = await fetchSearchResults(search, host);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <form action="/search-results" method="GET" className="mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder={t.placeholder}
          className="border px-4 py-2 rounded-l"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">{t.btn}</button>
      </form>
      {results.length === 0 ? (
        <p>{t.noResult}</p>
      ) : (
        <ul className="space-y-4">
          {results.map((item: any) => (
            <li key={item.id} className="border rounded p-4">
              <div className="font-semibold">{item.description || item.location_name || t.noDesc}</div>
              <div className="text-sm text-gray-500">{item.city} {item.district}</div>
              <div className="text-sm">{t.category}: {item.category}</div>
              {item.price && <div className="text-sm">{t.price}: {item.price} {item.currency}</div>}
              <div className="text-xs text-gray-400">{item.created_at && new Date(item.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-US')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
