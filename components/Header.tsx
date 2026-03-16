'use client'
// components/Header.tsx - PWA + İkonlar + Hamburger Menü
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Plus,
} from 'lucide-react'
import BrandMark from './BrandMark'
import UserMenu from './UserMenu'
import { navSections } from '@/components/navigation/navItems'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerDragOffset, setDrawerDragOffset] = useState(0)
  const [isDrawerDragging, setIsDrawerDragging] = useState(false)
  const [drawerOpenSwipeOffset, setDrawerOpenSwipeOffset] = useState(0)
  const [isDrawerOpeningSwipe, setIsDrawerOpeningSwipe] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(390)
  const menuRef = useRef<HTMLDivElement>(null)
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const edgeTouchStartXRef = useRef<number | null>(null)
  const edgeTouchStartYRef = useRef<number | null>(null)
  const shareSection = navSections.find((section) => section.title === 'Paylasim')
  const pinnedShareItems = shareSection?.items.filter((item) => item.isPinned) || []
  const mobileSections = navSections
    .map((section) => {
      if (section.title !== 'Paylasim') return section
      return {
        ...section,
        items: section.items.filter((item) => !item.isPinned),
      }
    })
    .filter((section) => section.items.length > 0)

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth)

    updateViewportWidth()
    window.addEventListener('resize', updateViewportWidth)

    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

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
    const prevBodyPaddingRight = document.body.style.paddingRight

    const isDesktop = window.innerWidth >= 1024
    const scrollbarWidth = isDesktop
      ? window.innerWidth - document.documentElement.clientWidth
      : 0

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.body.style.paddingRight = prevBodyPaddingRight
    }
  }, [mobileOpen])

  const drawerWidthEstimate = Math.min(viewportWidth * 0.86, 384)
  const edgeSwipeZoneWidth = clamp(Math.round(viewportWidth * 0.055), 18, 30)
  const openThreshold = clamp(Math.round(drawerWidthEstimate * 0.24), 56, 104)
  const closeThreshold = clamp(Math.round(drawerWidthEstimate * 0.22), 56, 108)
  const maxOverlayOpacity = viewportWidth < 390 ? 0.42 : viewportWidth < 768 ? 0.5 : 0.56

  const handleEdgeTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mobileOpen) return

    const touch = e.touches[0]
    edgeTouchStartXRef.current = touch.clientX
    edgeTouchStartYRef.current = touch.clientY
    setIsDrawerOpeningSwipe(false)
    setDrawerOpenSwipeOffset(0)
  }

  const handleEdgeTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mobileOpen || edgeTouchStartXRef.current === null || edgeTouchStartYRef.current === null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - edgeTouchStartXRef.current
    const deltaY = touch.clientY - edgeTouchStartYRef.current

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (deltaX <= 0) {
      if (isDrawerOpeningSwipe || drawerOpenSwipeOffset !== 0) {
        setIsDrawerOpeningSwipe(false)
        setDrawerOpenSwipeOffset(0)
      }
      return
    }

    setIsDrawerOpeningSwipe(true)
    setDrawerOpenSwipeOffset(Math.min(deltaX, drawerWidthEstimate))
  }

  const handleEdgeTouchEnd = () => {
    const shouldOpen = drawerOpenSwipeOffset >= openThreshold

    edgeTouchStartXRef.current = null
    edgeTouchStartYRef.current = null
    setIsDrawerOpeningSwipe(false)
    setDrawerOpenSwipeOffset(0)

    if (shouldOpen) {
      setMobileOpen(true)
    }
  }

  const drawerVisible = mobileOpen || isDrawerOpeningSwipe
  const openSwipeProgress = Math.min(drawerOpenSwipeOffset / drawerWidthEstimate, 1)
  const overlayOpacity = mobileOpen ? maxOverlayOpacity : openSwipeProgress * maxOverlayOpacity
  const drawerTransform = mobileOpen
    ? `translateX(${drawerDragOffset}px)`
    : isDrawerOpeningSwipe
      ? `translateX(calc(-100% + ${drawerOpenSwipeOffset}px))`
      : 'translateX(-100%)'

  const handleDrawerTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    setIsDrawerDragging(false)
    setDrawerDragOffset(0)
  }

  const handleDrawerTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    if (!mobileOpen || touchStartXRef.current === null || touchStartYRef.current === null) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartXRef.current
    const deltaY = touch.clientY - touchStartYRef.current

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (deltaX >= 0) {
      if (isDrawerDragging || drawerDragOffset !== 0) {
        setIsDrawerDragging(false)
        setDrawerDragOffset(0)
      }
      return
    }

    setIsDrawerDragging(true)
    setDrawerDragOffset(deltaX)
  }

  const handleDrawerTouchEnd = () => {
    const shouldClose = drawerDragOffset <= -closeThreshold
    touchStartXRef.current = null
    touchStartYRef.current = null
    setIsDrawerDragging(false)
    setDrawerDragOffset(0)

    if (shouldClose) {
      setMobileOpen(false)
    }
  }

  return (
    <header
      ref={menuRef}
      className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 min-w-0">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <BrandMark className="h-10 w-[154px] transition-transform duration-300 group-hover:scale-[1.02]" />
          </Link>

          <div className="hidden lg:flex flex-1 px-6">
            <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">
              Menü solda. Paylasim, Kesif, Ticaret ve Hesap olarak grupladik.
            </div>
          </div>

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

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-[65] ${mobileOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}
        onTouchStart={handleEdgeTouchStart}
        onTouchMove={handleEdgeTouchMove}
        onTouchEnd={handleEdgeTouchEnd}
        onTouchCancel={handleEdgeTouchEnd}
        style={{ width: edgeSwipeZoneWidth }}
        aria-hidden="true"
      />

      {/* ── Mobil Drawer ── */}
      <div
        aria-hidden={!drawerVisible}
        className={`lg:hidden fixed inset-0 z-[70] transition-opacity duration-200 ${
          drawerVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(2, 6, 23, ${drawerVisible ? overlayOpacity : 0})` }}
        />

        <aside
          onTouchStart={handleDrawerTouchStart}
          onTouchMove={handleDrawerTouchMove}
          onTouchEnd={handleDrawerTouchEnd}
          onTouchCancel={handleDrawerTouchEnd}
          className={`absolute inset-y-0 left-0 w-[86%] max-w-sm bg-white shadow-2xl border-r border-gray-200 overflow-y-auto transform ease-out ${
            isDrawerDragging || isDrawerOpeningSwipe ? 'transition-none' : 'transition-transform duration-300'
          }`}
          style={{
            transform: drawerTransform,
          }}
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Menü</p>
              <p className="text-sm font-bold text-gray-900">Navigasyon</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Menüyü kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            {pinnedShareItems.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-2">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">
                  Hızlı Paylaşım
                </p>
                <div className="space-y-1">
                  {pinnedShareItems.map(({ href, icon: Icon, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block rounded-xl px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {label}
                      </div>
                      {description && (
                        <p className="mt-1 pl-6 text-xs text-gray-500">{description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {mobileSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  {section.title}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {section.items.map(({ href, icon: Icon, label, description }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {label}
                      </div>
                      {description && (
                        <p className="text-xs text-gray-500">{description}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </header>
  )
}