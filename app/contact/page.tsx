
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminThreadLoader from '@/components/messaging/AdminThreadLoader';

export default function ContactPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const authId = data.user?.id;
      console.log('auth.users.id:', authId);
      if (!authId) {
        setUserId(null);
        setLoading(false);
        return;
      }
      // user_profiles tablosundan id'yi çek
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authId)
        .single();
      if (profiles && profiles.id) {
        setUserId(profiles.id);
        console.log('user_profiles.id:', profiles.id);
      } else {
        setUserId(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-cyan-700 mb-6">İletişim</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Sorularınız, önerileriniz veya destek talepleriniz için bize ulaşabilirsiniz. Doğrudan <a href="mailto:help@spotitforme.com" className="text-cyan-600 underline">help@spotitforme.com</a> adresine mail atın.
          </p>
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : userId ? (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-4 text-center">Admin ile Mesajlaş</h2>
              <AdminThreadLoader userId={userId} />
            </div>
          ) : (
            <div className="text-center text-red-600 py-8">Mesajlaşmak için giriş yapmalısınız.</div>
          )}
          <div className="mt-10 text-center text-sm text-gray-500">
            {/* Diğer iletişim bilgileri veya açıklamalar buraya eklenebilir */}
          </div>
        </div>
      </main>
    </div>
  );
}
