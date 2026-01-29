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
  subscription_type: 'free' | 'pro' | 'business' | 'enterprise'
  created_at: string
}