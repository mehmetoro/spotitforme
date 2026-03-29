"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function formatNumber(n: number | null | undefined) {
  if (n == null) return '-';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

export default function Stats() {
  console.log("Stats bileşeni render oldu");
    // Supabase sorgu sonuçlarını doğrudan logla
    // useEffect dışında, render sırasında undefined olur ama useEffect içinde tekrar loglanacak
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeSpots: 0,
    userCount: 0,
    helpedSpots: 0,
    cityCount: 0,
    avgResponse: '...',
    activeSearchers: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        // Aktif spotlar: status='active' olan tüm spotlar (count ile)
        const { count: activeSpotsCount, data: activeSpotsRows, error: activeSpotsErr } = await supabase
          .from('spots')
          .select('id, location', { count: 'exact' }) // head: true kaldırıldı
          .eq('status', 'active');

        // Supabase'den dönen veri ve hatayı logla
        console.log('activeSpotsRows:', activeSpotsRows);
        console.log('activeSpotsErr:', activeSpotsErr);
        if (activeSpotsErr) console.error('Aktif spotlar hata:', activeSpotsErr);
        if (activeSpotsRows) console.log('Aktif spotlar örnek:', activeSpotsRows.slice(0,3));

        // Yardım edilen spotlar: helps>0
        const { count: helpedSpots, error: helpedSpotsErr } = await supabase
          .from('spots')
          .select('id', { count: 'exact', head: true })
          .gt('total_helps', 0);

        // Topluluk üyesi
        const { count: userCount, error: userErr } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true });

        // Şehir: aktif spotların şehirleri
        let cityCount = 0;
        if (!activeSpotsErr && activeSpotsRows) {
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-console
            console.log('activeSpotsRows:', activeSpotsRows);
          }
          const invalids = ['Türkiye Geneli', 'Yurt Dışı', 'Yurtdışı', ''];
          const cityList = activeSpotsRows
            .map((row: any) => (row.location || '').trim())
            .filter(city => city && !invalids.includes(city));
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line no-console
            console.log('Şehirler ve uzunlukları:', cityList.map(c => [c, c.length]));
          }
          const uniqueCities = new Set(cityList);
          cityCount = uniqueCities.size;
        }

        // Ortalama yanıt süresi: spot açıldıktan sonra ilk sighting ile arasındaki ortalama süre
        let avgResponse = '...';
        try {
          // Son 100 yardım edilen spotu çek
          const { data: recentHelpedSpots } = await supabase
            .from('spots')
            .select('id, created_at')
            .gt('total_helps', 0)
            .order('created_at', { ascending: false })
            .limit(100);
          if (recentHelpedSpots && recentHelpedSpots.length > 0) {
            // Her spot için ilk sighting'i bul
            let totalMs = 0;
            let counted = 0;
            for (const spot of recentHelpedSpots) {
              const { data: firstSighting } = await supabase
                .from('sightings')
                .select('created_at')
                .eq('spot_id', spot.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();
              if (firstSighting && firstSighting.created_at) {
                const spotTime = new Date(spot.created_at).getTime();
                const sightingTime = new Date(firstSighting.created_at).getTime();
                if (sightingTime > spotTime) {
                  totalMs += (sightingTime - spotTime);
                  counted++;
                }
              }
            }
            if (counted > 0) {
              const avgMs = totalMs / counted;
              // 1dk altı ise sn, 1 saat altı ise dk, üstü ise saat olarak göster
              if (avgMs < 60000) avgResponse = Math.round(avgMs / 1000) + ' sn';
              else if (avgMs < 3600000) avgResponse = (avgMs / 60000).toFixed(1).replace('.0','') + ' dk';
              else avgResponse = (avgMs / 3600000).toFixed(1).replace('.0','') + ' sa';
            }
          }
        } catch {}

        setStats({
          activeSpots: activeSpotsCount || 0,
          userCount: userCount || 0,
          helpedSpots: helpedSpots || 0,
          cityCount,
          avgResponse,
          activeSearchers: activeSpotsCount || 0,
        });
      } catch (e: any) {
        setError('İstatistikler yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statList = [
    { value: formatNumber(stats.activeSpots), label: 'Aktif Spot', icon: '📝', color: 'from-blue-500 to-blue-600' },
    { value: formatNumber(stats.userCount), label: 'Topluluk Üyesi', icon: '👥', color: 'from-purple-500 to-purple-600' },
    { value: formatNumber(stats.helpedSpots), label: 'Yardım Edilen Spot', icon: '🤝', color: 'from-green-500 to-green-600' },
    { value: formatNumber(stats.cityCount), label: 'Şehir', icon: '📍', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            SpotItForMe İstatistikleri
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Türkiye'nin en büyük kayıp ürün bulma topluluğu olarak her gün binlerce kişiye yardım ediyoruz
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse h-32" />
            ))
          ) : error ? (
            <div className="col-span-6 text-center text-red-500 font-semibold">{error}</div>
          ) : (
            statList.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl text-white mx-auto mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Canlı aktivite */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Şu Anda Aktif Aramalar</h3>
              <p className="text-gray-600">
                <span className="font-bold text-blue-600">{loading ? '...' : formatNumber(stats.activeSearchers) + ' kişi'}</span> şu anda topluluğumuzdan yardım bekliyor
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">+ daha fazlası yardım ediyor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}