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
  Route,
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
        label: 'Nadir Seyahat',
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
    title: 'Haritalar',
    items: [
      {
        href: '/rare-map',
        icon: MapPin,
        label: 'Nadir Ürün Haritası',
        description: 'Fiziksel nadir urun paylasimlari',
        isPinned: true,
      },
      {
        href: '/rare-travel-map',
        icon: MapPin,
        label: 'Nadir Seyahat Haritası',
        description: 'Discovery sosyal paylasimlari',
        isPinned: true,
      },
      {
        href: '/rare-travel-plan',
        icon: MapPin,
        label: 'Nadir Seyahat Planı',
        description: 'Rota ustu akilli nadir planlayici',
        isPinned: true,
      },
    ],
  },
  {
    title: 'Kesif',
    items: [
      { href: '/', icon: Home, label: 'Ana Sayfa' },
      { href: '/sightings', icon: HelpCircle, label: 'Yardımlar' },
      { href: '/virtual-sightings', icon: HelpCircle, label: 'Sanal Yardımlar' },
      { href: '/discovery', icon: Eye, label: 'Nadir Seyahat' },
      {
        href: '/seyahat-rotalari',
        icon: Route,
        label: 'Nadir Rotalar',
        description: 'Canli seyahatten uretilen rota paylasimlari',
      },
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