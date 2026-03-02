// components/shop/QuickActions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Share2, BarChart, Loader2 } from 'lucide-react';

interface QuickActionsProps {
  shopId: string;
  onActionComplete?: () => void;
}

export default function QuickActions({ shopId, onActionComplete }: QuickActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const actions = [
    {
      id: 'add-product',
      title: 'Ürün Ekle',
      description: 'Satışa sunacağınız ürünü envantere ekleyin',
      icon: <Plus size={24} />,
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      path: `/shop/${shopId}/inventory/add`
    },
    {
      id: 'create-search',
      title: 'Arama Oluştur',
      description: 'Aradığınız ürünleri belirleyin',
      icon: <Search size={24} />,
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      path: `/shop/${shopId}/searches/add`
    },
    {
      id: 'create-post',
      title: 'Paylaşım Yap',
      description: 'Mağazanızı tanıtan içerik paylaşın',
      icon: <Share2 size={24} />,
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      path: `/shop/${shopId}/social/create`
    },
    {
      id: 'get-report',
      title: 'Rapor Al',
      description: 'Performans raporlarını görüntüleyin',
      icon: <BarChart size={24} />,
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      path: `/shop/${shopId}/analytics`
    }
  ];

  const handleAction = async (action: typeof actions[0]) => {
    setLoading(action.id);
    
    try {
      // Eğer yol varsa yönlendir
      if (action.path) {
        router.push(action.path);
      }
      
      // Callback çağır
      if (onActionComplete) {
        setTimeout(() => {
          onActionComplete();
        }, 500);
      }
    } catch (error) {
      console.error(`${action.title} işlemi başarısız:`, error);
      alert(`${action.title} işlemi sırasında bir hata oluştu.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">⚡ Hızlı Eylemler</h3>
          <p className="text-gray-600 text-sm">Mağazanızı hızlıca yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={loading === action.id}
            className={`p-4 rounded-xl border ${action.color} transition-all duration-200 flex flex-col items-center justify-center h-full min-h-[140px] disabled:opacity-50`}
          >
            <div className="mb-3">
              {loading === action.id ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                action.icon
              )}
            </div>
            <div className="text-center">
              <h4 className="font-bold mb-1">{action.title}</h4>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}