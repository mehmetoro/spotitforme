// app/admin/users/page.tsx - DÜZELTİLMİŞ
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
  total_spots: number;
  total_helps: number;
}

interface UserWithStats extends UserProfile {
  total_spots: number;
  total_helps: number;
}

interface SupabaseUserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_admin: boolean;
  avatar_url?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Arama sorgusu
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      // Pagination
      const { data, count, error } = await query
        .range((page - 1) * 20, page * 20 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Kullanıcı istatistiklerini getir
      const usersWithStats = await Promise.all(
        (data || []).map(async (user: SupabaseUserProfile) => {
          const [spotsRes, sightingsRes] = await Promise.all([
            supabase.from('spots').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('sightings').select('id', { count: 'exact', head: true }).eq('spotter_id', user.id)
          ]);

          return {
            ...user,
            total_spots: spotsRes.count || 0,
            total_helps: sightingsRes.count || 0
          } as UserWithStats;
        })
      );

      setUsers(usersWithStats);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Admin yetkisini kaldırmak' : 'Admin yetkisi vermek'} istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Listeyi güncelle
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentStatus }
          : user
      ));

      alert('Kullanıcı yetkisi güncellendi!');
    } catch (error) {
      console.error('Yetki güncellenemedi:', error);
      alert('Yetki güncellenirken bir hata oluştu');
    }
  };

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      // Önce ilişkili verileri sil
      await supabase.from('spots').delete().eq('user_id', userId);
      await supabase.from('sightings').delete().eq('spotter_id', userId);
      await supabase.from('user_profiles').delete().eq('id', userId);

      // Auth kullanıcısını sil (admin yetkisi gerektirir)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      // Listeden kaldır
      setUsers(users.filter(user => user.id !== userId));
      
      alert('Kullanıcı başarıyla silindi!');
    } catch (error) {
      console.error('Kullanıcı silinemedi:', error);
      alert('Kullanıcı silinirken bir hata oluştu. Supabase dashboard üzerinden deneyin.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">Tüm kullanıcıları görüntüleyin ve yönetin</p>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Email veya isim ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Ara
          </button>
        </div>

        {/* Kullanıcı Listesi */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Kullanıcılar yükleniyor...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Kullanıcı</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Kayıt Tarihi</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Spot'lar</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Yardım</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Yetki</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user: UserWithStats) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{user.name || 'İsimsiz Kullanıcı'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {user.total_spots}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {user.total_helps}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_admin
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {user.is_admin ? 'Admin' : 'Kullanıcı'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200"
                          >
                            Sil
                          </button>
                          <button
                            onClick={() => {
                              // Kullanıcı detay sayfasına git
                              window.open(`/profile?user=${user.id}`, '_blank');
                            }}
                            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200"
                          >
                            Görüntüle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > 20 && (
              <div className="mt-6 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 border rounded-lg disabled:opacity-50"
                  >
                    ← Önceki
                  </button>
                  <span className="px-4 py-2">
                    Sayfa {page} / {Math.ceil(totalCount / 20)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(totalCount / 20)}
                    className="px-3 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Sonraki →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'Arama kriterlerinize uygun kullanıcı bulunamadı' : 'Henüz kullanıcı kaydı yok'}
          </div>
        )}
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-2">Toplam Kullanıcı</h3>
          <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
          <p className="text-sm text-gray-600 mt-1">Kayıtlı toplam kullanıcı</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-2">Admin Sayısı</h3>
          <p className="text-3xl font-bold text-purple-600">
            {users.filter(u => u.is_admin).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Yönetici yetkisine sahip</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-2">Aktif Bugün</h3>
          <p className="text-3xl font-bold text-green-600">
            {users.filter(u => {
              const userDate = new Date(u.created_at);
              const today = new Date();
              return userDate.toDateString() === today.toDateString();
            }).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Bugün kayıt olanlar</p>
        </div>
      </div>
    </div>
  );
}