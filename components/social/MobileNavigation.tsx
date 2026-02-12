// components/social/MobileNavigation.tsx
'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function MobileNavigation() {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  const navItems = [
    { path: '/discovery', label: 'Keşfet', icon: '🔍' },
    { path: '/discovery?tab=following', label: 'Takip', icon: '👥' },
    { path: '/discovery/create', label: 'Oluştur', icon: '➕', highlight: true },
    { path: '/discovery/notifications', label: 'Bildirim', icon: '🔔' },
    { path: '/discovery/profile', label: 'Profil', icon: '👤' },
  ]

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <div className={`text-2xl ${item.highlight ? 'text-blue-600' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile için ekstra padding */}
      <div className="pb-16 md:pb-0"></div>
    </>
  )
}