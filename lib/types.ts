// lib/types.ts
export interface Spot {
  id: string
  user_id: string
  title: string
  description: string
  category: string | null
  location: string | null
  image_url: string | null
  status: 'active' | 'found'
  views: number
  helps: number
  created_at: string
  updated_at: string
}

export interface Sighting {
  id: string
  spot_id: string
  spotter_id: string
  image_url: string | null
  location_description: string
  price: number | null
  notes: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Shop {
  id: string
  owner_id: string
  shop_name: string
  description: string | null
  address: string | null
  city: string | null
  phone: string | null
  website: string | null
  free_images_used: number
  total_images: number
  product_limit: number
  subscription_type: 'free' | 'pro' | 'business' | 'enterprise'
  created_at: string
}

export interface SpotWallet {
  user_id: string
  balance: number
  lifetime_earned: number
  lifetime_spent: number
  created_at: string
  updated_at: string
}

export type SpotTransactionType =
  | 'earn'
  | 'spend'
  | 'transfer'
  | 'upgrade'
  | 'discount_purchase'
  | 'discount_sale'
  | 'adjustment'

export type SpotTransactionStatus = 'pending' | 'completed' | 'cancelled' | 'reversed'

export interface SpotLedgerEntry {
  id: string
  from_user_id: string | null
  to_user_id: string | null
  amount: number
  transaction_type: SpotTransactionType
  reason: string
  reference_type: string | null
  reference_id: string | null
  status: SpotTransactionStatus
  metadata: Record<string, any>
  created_at: string
  created_by: string | null
}