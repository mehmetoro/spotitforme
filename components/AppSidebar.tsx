'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navSections } from '@/components/navigation/navItems'

export default function AppSidebar() {
  const pathname = usePathname()

  const isActivePath = (href: string, matchPath?: string) => {
    const comparePath = matchPath || href.split('?')[0]
    return comparePath === '/' ? pathname === '/' : pathname.startsWith(comparePath)
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 px-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Navigasyon</p>
        <h2 className="mt-1 text-lg font-bold text-gray-900">Sol Menü</h2>
      </div>

      <nav className="space-y-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              {section.title}
            </p>

            {section.title === 'Paylasim' && (
              <div className="mb-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-2">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-500">
                  Hızlı Paylaşım
                </p>
                <div className="space-y-1">
                  {section.items
                    .filter((item) => item.isPinned)
                    .map(({ href, icon: Icon, label, description, matchPath }) => {
                      const isActive = isActivePath(href, matchPath)

                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`block rounded-xl px-3 py-2 transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-800'
                              : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="text-sm font-semibold">{label}</span>
                          </div>
                          {description && (
                            <p className="mt-1 pl-6 text-xs text-gray-500">{description}</p>
                          )}
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {section.items
                .filter((item) => section.title !== 'Paylasim' || !item.isPinned)
                .map(({ href, icon: Icon, label, matchPath, description }) => {
                  const isActive = isActivePath(href, matchPath)

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{label}</p>
                        {description && (
                          <p className="mt-0.5 text-xs text-gray-500">{description}</p>
                        )}
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}