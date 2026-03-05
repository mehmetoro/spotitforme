'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Tüm tanıtım kategorileri
const PROMO_CATEGORIES = [
  // SOSYAL PAYLAŞIM - Nadir Gördüm Teması
  {
    id: 'rare-sightings',
    icon: '👁️',
    title: 'Nadir Gördüm!',
    description: 'Sen de gördüğün nadir anı binlerce kişiyle paylaş',
    link: '/info/rare-sightings',
    colors: 'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
    buttonColor: 'text-purple-600'
  },
  {
    id: 'share-moment',
    icon: '📸',
    title: 'Anını Paylaş',
    description: 'Karşılaştığın ilginç şeyi görmeyenler için anlat!',
    link: '/info/share-moment',
    colors: 'from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
    buttonColor: 'text-pink-600'
  },
  {
    id: 'social-discovery',
    icon: '🌟',
    title: 'Keşfet & Keşfettir',
    description: 'Senin keşfin, başkalarının ilhamı olabilir',
    link: '/info/social-discovery',
    colors: 'from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
    buttonColor: 'text-cyan-600'
  },
  
  // TOPLULUK GÜCÜ - Spot/Yardımlaşma Teması
  {
    id: 'create-spots',
    icon: '🎯',
    title: 'Birlikte Bulalım',
    description: 'Aradığını söyle, 50.000 kişi senin için arasın',
    link: '/info/create-spots',
    colors: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
    buttonColor: 'text-red-600'
  },
  {
    id: 'community-power',
    icon: '🤝',
    title: 'Topluluk Gücü',
    description: 'Sen ararken yoruldun mu? 50.000 göz senin için bakıyor!',
    link: '/info/community-power',
    colors: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    buttonColor: 'text-blue-600'
  },
  {
    id: 'help-others',
    icon: '💝',
    title: 'Yardım Et, Mutlu Ol',
    description: 'Birinin aradığını buldun mu? Mutluluğunu paylaş!',
    link: '/info/help-others',
    colors: 'from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
    buttonColor: 'text-rose-600'
  },
  {
    id: 'success-stories',
    icon: '🏆',
    title: 'Başarı Hikayeleri',
    description: '10.000+ kişi aradığını burada buldu!',
    link: '/info/success-stories',
    colors: 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    buttonColor: 'text-yellow-600'
  },
  
  // ÜRÜN KATEGORİLERİ
  {
    id: 'antique-items',
    icon: '🏺',
    title: 'Antika Eşyalar',
    description: 'Deden atölyede kullanıyordu, sen nerede bulacaksın?',
    link: '/info/antique-items',
    colors: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    buttonColor: 'text-amber-600'
  },
  {
    id: 'local-products',
    icon: '🏔️',
    title: 'Yöresel Ürünler',
    description: 'O lezzet sadece orada! Birisi senin için bulabilir',
    link: '/info/local-products',
    colors: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    buttonColor: 'text-green-600'
  },
  {
    id: 'discontinued-products',
    icon: '⚙️',
    title: 'Artık Üretilmiyor',
    description: 'Üretimi bitti diye umutsuz olma, biri mutlaka biliyordur',
    link: '/info/discontinued-products',
    colors: 'from-gray-600 to-slate-700 hover:from-gray-700 hover:to-slate-800',
    buttonColor: 'text-gray-700'
  },
  {
    id: 'rare-books',
    icon: '📚',
    title: 'Nadir Kitaplar',
    description: 'İlk baskısını arıyorsan, koleksiyoncu topluluğu yardımcı olur',
    link: '/info/rare-books',
    colors: 'from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700',
    buttonColor: 'text-indigo-600'
  },
  {
    id: 'collectors-items',
    icon: '💎',
    title: 'Koleksiyon Parçası',
    description: 'Koleksiyonunu tamamla! Diğer koleksiyoncular sana yardım etsin',
    link: '/info/collectors-items',
    colors: 'from-violet-500 to-purple-700 hover:from-violet-600 hover:to-purple-800',
    buttonColor: 'text-violet-600'
  }
]

interface PromoCardProps {
  variant?: 'rare-sightings' | 'share-moment' | 'social-discovery' | 'create-spots' | 'community-power' | 'help-others' | 'success-stories' | 'antique-items' | 'local-products' | 'discontinued-products' | 'rare-books' | 'collectors-items' | 'random'
  className?: string
}

export default function PromoCard({ variant = 'random', className = '' }: PromoCardProps) {
  const [promo, setPromo] = useState(PROMO_CATEGORIES[0])

  useEffect(() => {
    if (variant === 'random') {
      // Random seç
      const randomIndex = Math.floor(Math.random() * PROMO_CATEGORIES.length)
      setPromo(PROMO_CATEGORIES[randomIndex])
    } else {
      // Belirtilen kategoriyi seç
      const selected = PROMO_CATEGORIES.find(cat => cat.id === variant)
      if (selected) {
        setPromo(selected)
      }
    }
  }, [variant])

  return (
    <Link href={promo.link}>
      <div className={`bg-gradient-to-r ${promo.colors} rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-4xl mb-2">{promo.icon}</div>
            <h3 className="font-bold text-lg mb-2">{promo.title}</h3>
            <p className="text-sm opacity-90">
              {promo.description}
            </p>
            <div className={`mt-3 inline-block bg-white ${promo.buttonColor} px-4 py-1 rounded-full text-sm font-bold`}>
              Daha Fazla →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Sayfa banner'ları için component (Desktop 728x90)
export function PromoBanner({ variant = 'random', className = '' }: PromoCardProps) {
  const [promo, setPromo] = useState(PROMO_CATEGORIES[0])

  useEffect(() => {
    if (variant === 'random') {
      const randomIndex = Math.floor(Math.random() * PROMO_CATEGORIES.length)
      setPromo(PROMO_CATEGORIES[randomIndex])
    } else {
      const selected = PROMO_CATEGORIES.find(cat => cat.id === variant)
      if (selected) {
        setPromo(selected)
      }
    }
  }, [variant])

  return (
    <Link href={promo.link}>
      <div className={`bg-gradient-to-r ${promo.colors} rounded-lg shadow p-4 text-white cursor-pointer hover:shadow-lg transition-all ${className}`}
        style={{ minHeight: '90px' }}>
        <div className="flex items-center gap-4 h-full">
          <div className="text-5xl">{promo.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-1">{promo.title}</h3>
            <p className="text-sm opacity-90">{promo.description}</p>
          </div>
          <div className={`bg-white ${promo.buttonColor} px-6 py-2 rounded-full font-bold whitespace-nowrap`}>
            Keşfet →
          </div>
        </div>
      </div>
    </Link>
  )
}
