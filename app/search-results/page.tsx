import React from 'react';


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


import { headers } from 'next/headers';

export default async function SearchResultsPage({ searchParams }: { searchParams: { search?: string } }) {
  const search = searchParams?.search || '';
  const host = headers().get('host') || '';
  const results = await fetchSearchResults(search, host);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Arama Sonuçları</h1>
      <form action="/search-results" method="GET" className="mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Ne aramıştınız?"
          className="border px-4 py-2 rounded-l"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">Ara</button>
      </form>
      {results.length === 0 ? (
        <p>Sonuç bulunamadı.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((item: any) => (
            <li key={item.id} className="border rounded p-4">
              <div className="font-semibold">{item.description || item.location_name || 'Açıklama yok'}</div>
              <div className="text-sm text-gray-500">{item.city} {item.district}</div>
              <div className="text-sm">Kategori: {item.category}</div>
              {item.price && <div className="text-sm">Fiyat: {item.price} {item.currency}</div>}
              <div className="text-xs text-gray-400">{item.created_at && new Date(item.created_at).toLocaleString('tr-TR')}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
