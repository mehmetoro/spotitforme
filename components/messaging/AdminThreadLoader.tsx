import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// import { ADMIN_USER_ID } from '@/lib/admin';
import { ADMIN_USER_ID } from '@/lib/admin';
import MessageThread from '@/components/messaging/MessageThread';

interface AdminThreadLoaderProps {
  userId: string;
}

export default function AdminThreadLoader({ userId }: AdminThreadLoaderProps) {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function getOrCreateThread() {
      setLoading(true);
      setError('');
      // Debug: id'leri kontrol et
      console.log("participant1_id:", userId);
      console.log("participant2_id:", ADMIN_USER_ID);
      try {
        // Sadece admin ve ilgili kullanıcı arasında thread var mı kontrol et
        const { data: existingThreads, error: fetchError } = await supabase
          .from('message_threads')
          .select('id')
          .or(`and(participant1_id.eq.${userId},participant2_id.eq.${ADMIN_USER_ID}),and(participant1_id.eq.${ADMIN_USER_ID},participant2_id.eq.${userId})`)
          .eq('thread_type', 'general')
          .limit(1);
        if (fetchError) {
          if (isMounted) setError('Thread sorgulanamadı: ' + fetchError.message);
          return;
        }
        if (existingThreads && existingThreads.length > 0) {
          if (isMounted) setThreadId(existingThreads[0].id);
        } else {
          // Yeni thread oluştur (her zaman admin id'si doğru şekilde atanıyor)
          const { data: newThread, error: threadError } = await supabase
            .from('message_threads')
            .insert({
              participant1_id: userId,
              participant2_id: ADMIN_USER_ID,
              thread_type: 'general',
              request_status: 'accepted',
            })
            .select('id')
            .single();
          if (threadError || !newThread) {
            if (isMounted) setError('Mesajlaşma başlatılamadı: ' + (threadError?.message || ''));
            return;
          }
          if (isMounted) setThreadId(newThread.id);
        }
      } catch (err) {
        if (isMounted) setError('Bir hata oluştu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    getOrCreateThread();
    return () => { isMounted = false; };
  }, [userId]);

  if (loading) return <div className="text-center py-8">Yükleniyor...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!threadId) return null;
  return <MessageThread threadId={threadId} userId={userId} onBack={() => {}} />;
}
