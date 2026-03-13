'use client'
// components/Header.tsx - PWA + İkonlar + Hamburger Menü
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Home,
  HelpCircle,
  Eye,
  MapPin,
  Building2,
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Plus,
} from 'lucide-react'
import UserMenu from './UserMenu'

const navItems = [
  { href: '/',             icon: Home,          label: 'Ana Sayfa'  },
  { href: '/sightings',    icon: HelpCircle,    label: 'Yardımlar'  },
  { href: '/discovery',    icon: Eye,           label: 'Keşfet'     },
  { href: '/spots',        icon: MapPin,        label: "Spot'lar"   },
  { href: '/for-business', icon: Building2,     label: 'İşletmeler' },
  { href: '/products',     icon: ShoppingBag,   label: 'Ürünler'    },
  { href: '/messages',     icon: MessageCircle, label: 'Mesajlar'   },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  // Mobil menü açıkken arka plan kaydırmasını kilitle
  useEffect(() => {
    if (!mobileOpen) return

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [mobileOpen])

  return (
    <header
      ref={menuRef}
      className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 min-w-0">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <span className="text-white font-extrabold text-lg leading-none">S</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors block">
                SpotItForMe
              </span>
              <span className="text-[11px] text-gray-400">Toplulukla bul</span>
            </div>
          </Link>

          {/* ── Desktop Nav (lg+) ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* ── Sağ Butonlar ── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <UserMenu />

            <Link
              href="/create-spot"
              className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Spot Oluştur</span>
            </Link>

            {/* Hamburger — lg altında görünür */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobil Dropdown ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="container-custom py-3 space-y-3">
            <div className="grid grid-cols-2 gap-1">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/create-spot"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-colors w-full shadow-sm"
                onClick={() => setMobileOpen(false)}
              >
                <Plus className="w-4 h-4" />
                Spot Oluştur
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}