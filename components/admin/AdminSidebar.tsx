// components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Kullanıcılar', href: '/admin/users', icon: '👥' },
    { name: 'Spot\'lar', href: '/admin/spots', icon: '📍' },
    { name: 'Mağazalar', href: '/admin/shops', icon: '🏪' },
    { name: 'Mesajlaşma', href: '/admin/messaging', icon: '💬' },
    { name: 'Sosyal İçerik', href: '/admin/social', icon: '📱' },
    { name: 'Stok Kontrolü', href: '/admin/product-checks', icon: '🔍' },
    { name: 'Saatlik Kontrol', href: '/admin/hourly-checks', icon: '⏱️' },
    { name: 'Kullanıcı Ürün Bildirimleri', href: '/admin/product-reports', icon: '🧾' },
    { name: 'Cron Yöneticisi', href: '/admin/cron-manager', icon: '⚙️' },
    { name: 'Ödemeler', href: '/admin/payments', icon: '💳' },
    { name: 'Bildirimler', href: '/admin/notifications', icon: '🔔' },
    { name: 'AdSense', href: '/admin/adsense', icon: '💰' },
    { name: 'Sistem Logları', href: '/admin/logs', icon: '📋' },
    { name: 'Ayarlar', href: '/admin/settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-gray-400 text-sm mt-1">SpotItForMe Yönetim</p>
      </div>

      <div className="px-4 pb-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <span>←</span>
          <span>Siteye Dön</span>
        </Link>
      </div>

      <div className="border-t border-gray-800 mx-4" />

      <nav className="mt-3 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-6 py-3 hover:bg-gray-800 ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}