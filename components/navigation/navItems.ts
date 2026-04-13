import {
  Home,
  HelpCircle,
  Eye,
  Landmark,
  Gem,
  MapPin,
  Building2,
  ShoppingBag,
  MessageCircle,
  PlusCircle,
} from 'lucide-react'

export interface NavItem {
  href: string
  icon: typeof Home
  label: string
  matchPath?: string
  description?: string
  isPinned?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    title: 'Paylasim',
    items: [
      {
        href: '/create-spot',
        icon: PlusCircle,
        label: 'Spot Aç',
        description: 'Yardım talebi ac ve topluluktan cevap al',
        isPinned: true,
      },
      {
        href: '/share/rare',
        icon: Eye,
        label: 'Nadir Gördüm',
        description: 'Nadir urun gorumunu hizlica duyur',
        isPinned: true,
      },
      {
        href: '/discovery?compose=1',
        icon: MessageCircle,
        label: 'Nadir Paylaş',
        matchPath: '/discovery',
        description: 'Topluluga gorsel ve hikaye paylas',
      },
      {
        href: '/share/collection',
        icon: Gem,
        label: 'Koleksiyon Ekle',
        matchPath: '/share/collection',
        description: 'Fiziki koleksiyon parcanizi yayinla',
      },
    ],
  },
  {
    title: 'Kesif',
    items: [
      { href: '/', icon: Home, label: 'Ana Sayfa' },
      { href: '/sightings', icon: HelpCircle, label: 'Yardımlar' },
      { href: '/virtual-sightings', icon: HelpCircle, label: 'Sanal Yardımlar' },
      { href: '/discovery', icon: Eye, label: 'Nadir' },
      { href: '/rare-map', icon: MapPin, label: 'Nadir Haritası' },
      { href: '/museum', icon: Landmark, label: 'Müze' },
      { href: '/collection', icon: Gem, label: 'Koleksiyon' },
      { href: '/spots', icon: MapPin, label: "Spot'lar" },
    ],
  },
  {
    title: 'Ticaret',
    items: [
      { href: '/for-business', icon: Building2, label: 'İşletmeler' },
      { href: '/products', icon: ShoppingBag, label: 'Ürünler' },
    ],
  },
  {
    title: 'Hesap',
    items: [
      { href: '/messages', icon: MessageCircle, label: 'Mesajlar' },
    ],
  },
]

export const navItems = navSections.flatMap((section) => section.items)