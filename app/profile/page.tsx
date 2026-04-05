// app/profile/page.tsx - DÜZELTMİŞ VERSİYON
'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { buildSeoImageFileName } from '@/lib/content-seo'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { buildCollectionPath, buildRareSightingPath, buildSightingPath, buildSpotPath } from '@/lib/sighting-slug'

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

interface UserSpot {
  id: string
  title: string
  status: string
  created_at: string
  helps: number
  views: number
  category: string | null
}

interface UserShop {
  id: string
  shop_name: string
  city: string
  subscription_type: string
  is_verified: boolean
}

interface SocialStats {
  totalPosts: number
  totalLikesReceived: number
  totalCommentsReceived: number
  spotsFound: number
}

interface NoktaConversionHistoryItem {
  id: string
  amount: number
  created_at: string
  metadata: {
    converted_nokta?: number
  } | null
}

interface UserHelpItem {
  id: string
  spot_id: string
  title: string | null
  link_preview_title: string | null
  location_description: string
  notes: string | null
  price: string | null
  link_preview_currency: string | null
  created_at: string
  spot_title: string
}

interface UserRareItem {
  id: string
  description: string
  category: string | null
  location_name: string
  city: string | null
  price: number | null
  points_earned: number
  is_in_museum: boolean
  created_at: string
}

interface UserCollectionItem {
  id: string
  title: string
  description: string
  category: string | null
  photo_url: string | null
  estimated_price: number | null
  city: string | null
  district: string | null
  is_public: boolean
  status: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userSpots, setUserSpots] = useState<UserSpot[]>([])
  const [userShop, setUserShop] = useState<UserShop | null>(null)
  const [socialStats, setSocialStats] = useState<SocialStats>({
    totalPosts: 0,
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    spotsFound: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'helps' | 'spots' | 'rare' | 'museum' | 'collection' | 'shop' | 'settings'>('spots')
  const [spotBalance, setSpotBalance] = useState<number>(0)
  const [noktaBalance, setNoktaBalance] = useState<number>(0)
  const [blockedSpots, setBlockedSpots] = useState<number>(0)
  const [noktaConversionHistory, setNoktaConversionHistory] = useState<NoktaConversionHistoryItem[]>([])
  const [userHelps, setUserHelps] = useState<UserHelpItem[]>([])
  const [userRares, setUserRares] = useState<UserRareItem[]>([])
  const [userCollectionItems, setUserCollectionItems] = useState<UserCollectionItem[]>([])
  const [collectionSaving, setCollectionSaving] = useState(false)
  const [collectionActionId, setCollectionActionId] = useState<string | null>(null)
  const [collectionEditingId, setCollectionEditingId] = useState<string | null>(null)
  const [spotActionId, setSpotActionId] = useState<string | null>(null)
  const [helpActionId, setHelpActionId] = useState<string | null>(null)
  const [helpEditingId, setHelpEditingId] = useState<string | null>(null)
  const [rareActionId, setRareActionId] = useState<string | null>(null)
  const [rareEditingId, setRareEditingId] = useState<string | null>(null)
  const [collectionPhotoFile, setCollectionPhotoFile] = useState<File | null>(null)
  const [collectionPhotoPreview, setCollectionPhotoPreview] = useState<string | null>(null)
  const [collectionEditPhotoFile, setCollectionEditPhotoFile] = useState<File | null>(null)
  const [collectionEditPhotoPreview, setCollectionEditPhotoPreview] = useState<string | null>(null)
  const [collectionForm, setCollectionForm] = useState({
    title: '',
    description: '',
    category: '',
    photo_url: '',
    estimated_price: '',
    city: '',
    district: '',
    is_public: true,
  })
  const [collectionEditForm, setCollectionEditForm] = useState({
    title: '',
    description: '',
    category: '',
    photo_url: '',
    estimated_price: '',
    city: '',
    district: '',
    is_public: true,
    status: 'active',
  })
  const [rareEditForm, setRareEditForm] = useState({
    description: '',
    category: '',
    location_name: '',
    city: '',
    price: '',
    is_in_museum: false,
  })
  const [helpEditForm, setHelpEditForm] = useState({
    location_description: '',
    notes: '',
    price: '',
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (!tab) return

    const allowedTabs: Array<'helps' | 'spots' | 'rare' | 'museum' | 'collection' | 'settings'> = ['helps', 'spots', 'rare', 'museum', 'collection', 'settings']

    if (tab === 'shop' && userShop) {
      setActiveTab('shop')
      return
    }

    if (allowedTabs.includes(tab as any)) {
      setActiveTab(tab as 'helps' | 'spots' | 'rare' | 'museum' | 'collection' | 'settings')
    }
  }, [searchParams, userShop])

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/')
      return
    }
    
    fetchUserData(authUser.id)
  }

  const fetchUserData = async (userId: string) => {
    try {
      // Kullanıcı bilgileri
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Kullanıcının spot'ları
      const { data: spotsData } = await supabase
        .from('spots')
        .select('id, title, status, created_at, helps, views, category')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Kullanıcının mağazası
      const { data: shopData } = await supabase
        .from('shops')
        .select('id, shop_name, city, subscription_type, is_verified')
        .eq('owner_id', userId)
        .single()

      // Spot cüzdanı bilgileri
      const { data: walletData } = await supabase
        .from('spot_wallets')
        .select('balance, nokta_balance')
        .eq('user_id', userId)
        .maybeSingle()

      // Bloke edilen Spot'lar: Her talep = 1 Spot
      const { data: blockedRequests } = await supabase
        .from('shop_product_discount_requests')
        .select('id')
        .eq('buyer_id', userId)
        .in('status', ['pending', 'approved'])

      const blocked = blockedRequests?.length || 0 // 1 spot per request

      // Kullanıcının spot yardımları
      const { data: helpsData } = await supabase
        .from('sightings')
        .select('id, spot_id, title, link_preview_title, location_description, notes, price, link_preview_currency, created_at')
        .eq('spotter_id', userId)
        .order('created_at', { ascending: false })

      const helpRows = helpsData || []
      const helpSpotIds = Array.from(new Set(helpRows.map((row: any) => row.spot_id).filter(Boolean)))
      let helpSpotMap: Record<string, string> = {}
      if (helpSpotIds.length > 0) {
        const { data: helpSpots } = await supabase
          .from('spots')
          .select('id, title')
          .in('id', helpSpotIds)

        helpSpotMap = Object.fromEntries((helpSpots || []).map((spot: any) => [spot.id, spot.title || 'Spot']))
      }

      setUserHelps(
        helpRows.map((row: any) => ({
          ...row,
          spot_title: helpSpotMap[row.spot_id] || 'Spot',
        }))
      )

      // Kullanıcının nadir paylaşımları
      const { data: rareData } = await supabase
        .from('quick_sightings')
        .select('id, description, category, location_name, city, price, points_earned, is_in_museum, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setUserRares((rareData || []) as UserRareItem[])

      // Kullanıcının koleksiyon paylaşımları
      const { data: collectionData, error: collectionError } = await supabase
        .from('collection_posts')
        .select('id, title, description, category, photo_url, estimated_price, city, district, is_public, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (collectionError) {
        console.warn('collection_posts query warning:', collectionError.message)
      }

      setUserCollectionItems((collectionData || []) as UserCollectionItem[])

      // Son Nokta -> Spot dönüşümleri
      const { data: conversionHistoryData } = await supabase
        .from('spot_ledger')
        .select('id, amount, created_at, metadata')
        .eq('to_user_id', userId)
        .eq('reason', 'nokta_conversion')
        .order('created_at', { ascending: false })
        .limit(5)

      // Sosyal istatistikleri
      const [
        { data: postsData },
        { data: likesData },
        { data: commentsData },
        { data: foundData }
      ] = await Promise.all([
        // Kullanıcının postları
        supabase
          .from('social_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        // Kullanıcının postlarına aldığı beğeniler
        supabase
          .from('social_likes')
          .select('id', { count: 'exact' })
          .in('post_id', (await supabase
            .from('social_posts')
            .select('id')
            .eq('user_id', userId)).data?.map((p: any) => p.id) || []),
        // Kullanıcının postlarına aldığı yorumlar
        supabase
          .from('social_comments')
          .select('id', { count: 'exact' })
          .in('post_id', (await supabase
            .from('social_posts')
            .select('id')
            .eq('user_id', userId)).data?.map((p: any) => p.id) || []),
        // Kullanıcının bulduğu spot'lar
        supabase
          .from('social_posts')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('post_type', 'found')
      ])

      setSocialStats({
        totalPosts: postsData?.length || 0,
        totalLikesReceived: likesData?.length || 0,
        totalCommentsReceived: commentsData?.length || 0,
        spotsFound: foundData?.length || 0
      })

      setSpotBalance(walletData?.balance || 0)
      setNoktaBalance(walletData?.nokta_balance || 0)
      setBlockedSpots(blocked)
      setNoktaConversionHistory((conversionHistoryData || []) as NoktaConversionHistoryItem[])

      setUser({
        id: userId,
        email: userData?.email || '',
        name: userData?.name || 'Kullanıcı',
        avatar_url: userData?.avatar_url || null,
        created_at: userData?.created_at || new Date().toISOString()
      })
      
      setUserSpots(spotsData || [])
      setUserShop(shopData || null)

    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrencyPrefix = (currency: string | null | undefined) => {
    const code = (currency || 'TRY').toUpperCase()
    if (code === 'TRY') return '₺'
    if (code === 'USD') return '$'
    if (code === 'EUR') return '€'
    if (code === 'GBP') return '£'
    if (code === 'JPY') return '¥'
    return `${code} `
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCreateSpot = () => {
    router.push('/create-spot')
  }

  const handleOpenShopDashboard = () => {
    if (userShop) {
      router.push('/shop/dashboard')
    } else {
      router.push('/for-business')
    }
  }

  const handleToggleRareMuseum = async (rare: UserRareItem) => {
    setRareActionId(rare.id)
    const nextStatus = !rare.is_in_museum
    const { error } = await supabase
      .from('quick_sightings')
      .update({ is_in_museum: nextStatus })
      .eq('id', rare.id)

    if (error) {
      setRareActionId(null)
      alert(error.message || 'Müze durumu güncellenemedi')
      return
    }

    setUserRares((prev) => prev.map((item) => (item.id === rare.id ? { ...item, is_in_museum: nextStatus } : item)))
    setRareActionId(null)
  }

  const handleToggleSpotStatus = async (spot: UserSpot) => {
    try {
      setSpotActionId(spot.id)
      const nextStatus = spot.status === 'active' ? 'found' : 'active'

      const { error } = await supabase
        .from('spots')
        .update({ status: nextStatus })
        .eq('id', spot.id)

      if (error) throw error

      setUserSpots((prev) => prev.map((item) => (item.id === spot.id ? { ...item, status: nextStatus } : item)))
    } catch (err: any) {
      alert(err?.message || 'Spot durumu güncellenemedi')
    } finally {
      setSpotActionId(null)
    }
  }

  const handleDeleteSpot = async (spot: UserSpot) => {
    const confirmed = window.confirm(`"${spot.title}" spotunu silmek istediğinize emin misiniz?`)
    if (!confirmed) return

    try {
      setSpotActionId(spot.id)

      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', spot.id)

      if (error) throw error

      setUserSpots((prev) => prev.filter((item) => item.id !== spot.id))
    } catch (err: any) {
      alert(err?.message || 'Spot silinemedi')
    } finally {
      setSpotActionId(null)
    }
  }

  const handleDeleteHelp = async (help: UserHelpItem) => {
    const confirmed = window.confirm('Bu yardım paylaşımını silmek istediğinize emin misiniz?')
    if (!confirmed) return

    try {
      setHelpActionId(help.id)

      const { error } = await supabase
        .from('sightings')
        .delete()
        .eq('id', help.id)

      if (error) throw error

      setUserHelps((prev) => prev.filter((item) => item.id !== help.id))
      if (helpEditingId === help.id) {
        setHelpEditingId(null)
      }
    } catch (err: any) {
      alert(err?.message || 'Yardım paylaşımı silinemedi')
    } finally {
      setHelpActionId(null)
    }
  }

  const handleStartHelpEdit = (help: UserHelpItem) => {
    setHelpEditingId(help.id)
    setHelpEditForm({
      location_description: help.location_description,
      notes: help.notes || '',
      price: help.price || '',
    })
  }

  const handleCancelHelpEdit = () => {
    setHelpEditingId(null)
  }

  const handleSaveHelpEdit = async (help: UserHelpItem) => {
    if (!helpEditForm.location_description.trim()) {
      alert('Konum alanı zorunludur.')
      return
    }

    try {
      setHelpActionId(help.id)

      const payload = {
        location_description: helpEditForm.location_description.trim(),
        notes: helpEditForm.notes.trim() || null,
        price: helpEditForm.price ? Number(helpEditForm.price) : null,
      }

      const { data, error } = await supabase
        .from('sightings')
        .update(payload)
        .eq('id', help.id)
        .select('id, spot_id, location_description, notes, price, created_at')
        .single()

      if (error || !data) throw error || new Error('Yardım paylaşımı güncellenemedi')

      setUserHelps((prev) => prev.map((item) => (
        item.id === help.id
          ? {
              ...item,
              location_description: data.location_description,
              notes: data.notes,
              price: data.price != null ? String(data.price) : null,
            }
          : item
      )))

      setHelpEditingId(null)
    } catch (err: any) {
      alert(err?.message || 'Yardım paylaşımı güncellenemedi')
    } finally {
      setHelpActionId(null)
    }
  }

  const handleDeleteRare = async (rare: UserRareItem) => {
    const confirmed = window.confirm('Bu nadir paylaşımını silmek istediğinize emin misiniz?')
    if (!confirmed) return

    try {
      setRareActionId(rare.id)

      const { error } = await supabase
        .from('quick_sightings')
        .delete()
        .eq('id', rare.id)

      if (error) throw error

      setUserRares((prev) => prev.filter((item) => item.id !== rare.id))
      if (rareEditingId === rare.id) {
        setRareEditingId(null)
      }
    } catch (err: any) {
      alert(err?.message || 'Nadir paylaşımı silinemedi')
    } finally {
      setRareActionId(null)
    }
  }

  const handleStartRareEdit = (rare: UserRareItem) => {
    setRareEditingId(rare.id)
    setRareEditForm({
      description: rare.description,
      category: rare.category || '',
      location_name: rare.location_name,
      city: rare.city || '',
      price: rare.price != null ? String(rare.price) : '',
      is_in_museum: rare.is_in_museum,
    })
  }

  const handleCancelRareEdit = () => {
    setRareEditingId(null)
  }

  const handleSaveRareEdit = async (rare: UserRareItem) => {
    if (!rareEditForm.description.trim() || !rareEditForm.location_name.trim()) {
      alert('Açıklama ve konum alanı zorunludur.')
      return
    }

    try {
      setRareActionId(rare.id)

      const payload = {
        description: rareEditForm.description.trim(),
        category: rareEditForm.category || null,
        location_name: rareEditForm.location_name.trim(),
        city: rareEditForm.city || null,
        price: rareEditForm.price ? Number(rareEditForm.price) : null,
        is_in_museum: rareEditForm.is_in_museum,
      }

      const { data, error } = await supabase
        .from('quick_sightings')
        .update(payload)
        .eq('id', rare.id)
        .select('id, description, category, location_name, city, price, points_earned, is_in_museum, created_at')
        .single()

      if (error || !data) throw error || new Error('Nadir paylaşımı güncellenemedi')

      setUserRares((prev) => prev.map((item) => (item.id === rare.id ? data as UserRareItem : item)))
      setRareEditingId(null)
    } catch (err: any) {
      alert(err?.message || 'Nadir paylaşımı güncellenemedi')
    } finally {
      setRareActionId(null)
    }
  }

  const extractSpotImagePath = (publicUrl: string): string | null => {
    const marker = '/storage/v1/object/public/spot-images/'
    const markerIndex = publicUrl.indexOf(marker)

    if (markerIndex === -1) return null

    const pathWithQuery = publicUrl.slice(markerIndex + marker.length)
    const path = decodeURIComponent(pathWithQuery.split('?')[0] || '')

    return path || null
  }

  const handleStartCollectionEdit = (item: UserCollectionItem) => {
    setCollectionEditingId(item.id)
    setCollectionEditPhotoFile(null)
    setCollectionEditPhotoPreview(null)
    setCollectionEditForm({
      title: item.title,
      description: item.description,
      category: item.category || '',
      photo_url: item.photo_url || '',
      estimated_price: item.estimated_price != null ? String(item.estimated_price) : '',
      city: item.city || '',
      district: item.district || '',
      is_public: item.is_public,
      status: item.status,
    })
  }

  const handleCancelCollectionEdit = () => {
    setCollectionEditingId(null)
    setCollectionEditPhotoFile(null)
    setCollectionEditPhotoPreview(null)
  }

  const handleCollectionEditPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Koleksiyon fotoğrafı 5MB\'dan küçük olmalıdır.')
      return
    }

    setCollectionEditPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCollectionEditPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveCollectionEdit = async (item: UserCollectionItem) => {
    if (!user?.id) {
      alert('Kullanıcı bulunamadı')
      return
    }

    if (!collectionEditForm.title.trim() || !collectionEditForm.description.trim()) {
      alert('Başlık ve açıklama zorunludur.')
      return
    }

    try {
      setCollectionActionId(item.id)
      const previousPhotoUrl = item.photo_url
      let updatedPhotoUrl: string | null = collectionEditForm.photo_url || null

      if (collectionEditPhotoFile) {
        const fileName = buildSeoImageFileName({
          folder: 'collection',
          userId: user.id,
          title: collectionEditForm.title,
          originalName: collectionEditPhotoFile.name,
        })

        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, collectionEditPhotoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)

        updatedPhotoUrl = publicUrl
      }

      const payload = {
        title: collectionEditForm.title.trim(),
        description: collectionEditForm.description.trim(),
        category: collectionEditForm.category || null,
        photo_url: updatedPhotoUrl,
        estimated_price: collectionEditForm.estimated_price ? Number(collectionEditForm.estimated_price) : null,
        city: collectionEditForm.city || null,
        district: collectionEditForm.district || null,
        is_public: collectionEditForm.is_public,
        status: collectionEditForm.status,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('collection_posts')
        .update(payload)
        .eq('id', item.id)
        .select('id, title, description, category, photo_url, estimated_price, city, district, is_public, status, created_at')
        .single()

      if (error || !data) throw error || new Error('Koleksiyon paylaşımı güncellenemedi')

      const updatedItem = data as UserCollectionItem
      setUserCollectionItems((prev) => prev.map((entry) => (entry.id === item.id ? updatedItem : entry)))

      if (previousPhotoUrl && previousPhotoUrl !== updatedItem.photo_url) {
        const oldStoragePath = extractSpotImagePath(previousPhotoUrl)
        if (oldStoragePath && oldStoragePath.startsWith(`${user.id}/`)) {
          const { error: removeError } = await supabase.storage
            .from('spot-images')
            .remove([oldStoragePath])

          if (removeError) {
            console.warn('Old collection image cleanup warning:', removeError.message)
          }
        }
      }

      handleCancelCollectionEdit()
    } catch (err: any) {
      alert(err?.message || 'Koleksiyon paylaşımı güncellenemedi')
    } finally {
      setCollectionActionId(null)
    }
  }

  const handleDeleteCollectionItem = async (item: UserCollectionItem) => {
    if (!user?.id) {
      alert('Kullanıcı bulunamadı')
      return
    }

    const confirmed = window.confirm(`"${item.title}" koleksiyon paylaşımını silmek istediğinize emin misiniz?`)
    if (!confirmed) return

    try {
      setCollectionActionId(item.id)

      const { error } = await supabase
        .from('collection_posts')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      if (item.photo_url) {
        const oldStoragePath = extractSpotImagePath(item.photo_url)
        if (oldStoragePath && oldStoragePath.startsWith(`${user.id}/`)) {
          const { error: removeError } = await supabase.storage
            .from('spot-images')
            .remove([oldStoragePath])

          if (removeError) {
            console.warn('Deleted collection image cleanup warning:', removeError.message)
          }
        }
      }

      setUserCollectionItems((prev) => prev.filter((entry) => entry.id !== item.id))
      if (collectionEditingId === item.id) {
        handleCancelCollectionEdit()
      }
    } catch (err: any) {
      alert(err?.message || 'Koleksiyon paylaşımı silinemedi')
    } finally {
      setCollectionActionId(null)
    }
  }

  const handleCreateCollectionItem = async () => {
    if (!collectionForm.title.trim() || !collectionForm.description.trim()) {
      alert('Koleksiyon paylaşımı için başlık ve açıklama zorunludur.')
      return
    }

    if (!user?.id) {
      alert('Kullanıcı bulunamadı')
      return
    }

    try {
      setCollectionSaving(true)

      let uploadedPhotoUrl: string | null = collectionForm.photo_url || null

      if (collectionPhotoFile) {
        const fileName = buildSeoImageFileName({
          folder: 'collection',
          userId: user.id,
          title: collectionForm.title,
          originalName: collectionPhotoFile.name,
        })

        const { error: uploadError } = await supabase.storage
          .from('spot-images')
          .upload(fileName, collectionPhotoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('spot-images')
          .getPublicUrl(fileName)

        uploadedPhotoUrl = publicUrl
      }

      const payload = {
        user_id: user.id,
        title: collectionForm.title.trim(),
        description: collectionForm.description.trim(),
        category: collectionForm.category || null,
        photo_url: uploadedPhotoUrl,
        estimated_price: collectionForm.estimated_price ? Number(collectionForm.estimated_price) : null,
        city: collectionForm.city || null,
        district: collectionForm.district || null,
        is_public: collectionForm.is_public,
        status: 'active',
      }

      const { data, error } = await supabase
        .from('collection_posts')
        .insert(payload)
        .select('id, title, description, category, photo_url, estimated_price, city, district, is_public, status, created_at')
        .single()

      if (error) throw error

      setUserCollectionItems((prev) => [data as UserCollectionItem, ...prev])
      setCollectionForm({
        title: '',
        description: '',
        category: '',
        photo_url: '',
        estimated_price: '',
        city: '',
        district: '',
        is_public: true,
      })
      setCollectionPhotoFile(null)
      setCollectionPhotoPreview(null)
    } catch (err: any) {
      alert(err?.message || 'Koleksiyon paylaşımı kaydedilemedi')
    } finally {
      setCollectionSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container-custom py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const noktaProgress = ((noktaBalance % 10) + 10) % 10
  const noktaRemainingForNextSpot = 10 - noktaProgress

  const handleCollectionPhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Koleksiyon fotoğrafı 5MB\'dan küçük olmalıdır.')
      return
    }

    setCollectionPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCollectionPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-custom py-8">
        {/* Profil Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mr-6">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.name || 'Kullanıcı'}</h1>
                <p className="text-blue-100">{user.email}</p>
                <p className="text-blue-100 text-sm mt-2">
                  Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateSpot}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg"
              >
                📝 Yeni Spot Oluştur
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg"
              >
                🚪 Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {userSpots.length}
            </div>
            <div className="text-gray-600">Spot'larım</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {userSpots.filter(s => s.status === 'found').length}
            </div>
            <div className="text-gray-600">Bulunan</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {userSpots.reduce((sum, spot) => sum + spot.views, 0)}
            </div>
            <div className="text-gray-600">Görüntülenme</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {userSpots.reduce((sum, spot) => sum + spot.helps, 0)}
            </div>
            <div className="text-gray-600">Yardım</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl p-4 shadow text-center hover:shadow-md transition md:col-span-2">
            <div className="text-3xl font-bold text-white mb-1">
              💎 {spotBalance}
            </div>
            <div className="text-yellow-900 font-medium">Mevcut Spot Bakiyesi</div>
            <div className="text-sm text-yellow-900 mt-2">
              💠 {noktaBalance} Nokta (10 Nokta = 1 Spot)
            </div>
            <div className="mt-2 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-yellow-900">
              🎯 Sonraki Spot için {noktaRemainingForNextSpot} Nokta kaldı
            </div>
            {blockedSpots > 0 && (
              <div className="text-xs text-yellow-900 mt-2 opacity-80">
                🔒 {blockedSpots} Spot taleplerde bloke
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">🔄 Son Nokta → Spot Dönüşümleri</h3>
            <span className="text-xs text-gray-500">Son 5 işlem</span>
          </div>

          {noktaConversionHistory.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz dönüşüm yok. 10 Nokta biriktirdiğinizde burada görünecek.</p>
          ) : (
            <div className="space-y-2">
              {noktaConversionHistory.map((item) => {
                const convertedNokta = Number(item.metadata?.converted_nokta ?? item.amount * 10)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-green-700">+{item.amount} Spot</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span>-{convertedNokta} Nokta</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleString('tr-TR')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sosyal Aktivite İstatistikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {socialStats.totalPosts}
            </div>
            <div className="text-gray-600">Paylaşım</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-pink-600 mb-1">
              {socialStats.totalLikesReceived}
            </div>
            <div className="text-gray-600">Beğeni Aldı</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {socialStats.totalCommentsReceived}
            </div>
            <div className="text-gray-600">Yorum Aldı</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {socialStats.spotsFound}
            </div>
            <div className="text-gray-600">Spot Buldu</div>
          </div>
        </div>

        {/* Mağaza Kartı */}
        {userShop && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 bg-white text-green-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  🏪
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userShop.shop_name}</h3>
                  <p className="text-green-100">
                    {userShop.city} • {userShop.subscription_type === 'free' ? 'Ücretsiz Paket' : 'Premium'}
                    {userShop.is_verified && ' • ✓ Doğrulanmış'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenShopDashboard}
                className="bg-white text-green-600 hover:bg-green-50 font-bold px-6 py-3 rounded-lg"
              >
                Mağaza Paneline Git
              </button>
            </div>
          </div>
        )}

        {!userShop && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2">🏪 Mağaza Sahibi misiniz?</h3>
                <p className="text-yellow-100">
                  Ücretsiz mağaza açın, müşterilerinizi artırın ve satışlarınızı büyütün!
                </p>
              </div>
              <button
                onClick={() => router.push('/for-business')}
                className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-lg"
              >
                Ücretsiz Mağaza Aç
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('spots')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'spots'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Spotlarım ({userSpots.length})
            </button>
            <button
              onClick={() => setActiveTab('rare')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'rare'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💎 Nadirlerim ({userRares.length})
            </button>
            <button
              onClick={() => setActiveTab('museum')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'museum'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🏛️ Nadir Müzem ({userRares.filter((item) => item.is_in_museum).length})
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'collection'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              💼 Koleksiyonum ({userCollectionItems.length})
            </button>
            <button
              onClick={() => setActiveTab('helps')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'helps'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🤝 Yardımlarım ({userHelps.length})
            </button>
            {userShop && (
              <button
                onClick={() => setActiveTab('shop')}
                className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                  activeTab === 'shop'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏪 Mağazam
              </button>
            )}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 px-6 py-4 text-center font-medium whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Ayarlar
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'spots' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Spotlarım</h3>
                  <button
                    onClick={handleCreateSpot}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    + Yeni Spot
                  </button>
                </div>
                
                {userSpots.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Henüz spot oluşturmadınız</h4>
                    <p className="text-gray-600 mb-6">İlk spot'unuzu oluşturun ve topluluğumuzdan yardım alın</p>
                    <button
                      onClick={handleCreateSpot}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                    >
                      İlk Spot'u Oluşturun
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Başlık</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Kategori</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Durum</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Görüntülenme</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Yardım</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tarih</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userSpots.map((spot) => (
                          <tr key={spot.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <Link
                                href={buildSpotPath(spot.id, spot.title)}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                {spot.title.length > 40 ? spot.title.substring(0, 40) + '...' : spot.title}
                              </Link>
                            </td>
                            <td className="py-3 px-4">
                              {spot.category ? (
                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                                  {spot.category}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                spot.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {spot.status === 'active' ? 'Aktif' : 'Bulundu'}
                              </span>
                            </td>
                            <td className="py-3 px-4">{spot.views}</td>
                            <td className="py-3 px-4">{spot.helps}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">
                              {new Date(spot.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href={buildSpotPath(spot.id, spot.title)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Görüntüle
                                </Link>
                                <button
                                  onClick={() => handleToggleSpotStatus(spot)}
                                  disabled={spotActionId === spot.id}
                                  className="text-amber-600 hover:text-amber-800 text-sm disabled:opacity-60"
                                >
                                  {spotActionId === spot.id
                                    ? 'Güncelleniyor...'
                                    : spot.status === 'active'
                                      ? 'Bulundu Yap'
                                      : 'Aktife Al'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSpot(spot)}
                                  disabled={spotActionId === spot.id}
                                  className="text-red-600 hover:text-red-800 text-sm disabled:opacity-60"
                                >
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'helps' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <h4 className="font-semibold text-amber-900 mb-1">💡 Yardımlarınızı farklı amaçlarla kullanabilirsiniz</h4>
                  <p className="text-sm text-amber-800">
                    Bu paylaşımları sosyal yardımlaşma için yapabileceğiniz gibi, profesyonel aracılık modeli olarak da değerlendirebilirsiniz.
                    Ürün sahibi ile iletişim kuran kullanıcılardan, anlaşmaya göre ürün fiyatı üstüne %15 yardım komisyonu talep edebilirsiniz.
                  </p>
                </div>

                {userHelps.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">🤝</div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Henüz yardım paylaşımınız yok</h4>
                    <p className="text-gray-600">Spotlarda yardımcı olduğunuz kayıtlar burada listelenecek.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Spot</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Konum</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Fiyat</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Tarih</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userHelps.map((help) => (
                          <tr key={help.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{help.spot_title}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {helpEditingId === help.id ? (
                                <input
                                  value={helpEditForm.location_description}
                                  onChange={(e) => setHelpEditForm({ ...helpEditForm, location_description: e.target.value })}
                                  className="w-full min-w-[180px] px-3 py-2 border border-amber-200 rounded-lg"
                                />
                              ) : (
                                help.location_description
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {helpEditingId === help.id ? (
                                <input
                                  value={helpEditForm.price}
                                  onChange={(e) => setHelpEditForm({ ...helpEditForm, price: e.target.value })}
                                  placeholder="Fiyat"
                                  className="w-full min-w-[110px] px-3 py-2 border border-amber-200 rounded-lg"
                                />
                              ) : help.price ? (
                                `${getCurrencyPrefix(help.link_preview_currency)}${help.price}`
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{new Date(help.created_at).toLocaleDateString('tr-TR')}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-2 items-center">
                                {helpEditingId === help.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveHelpEdit(help)}
                                      disabled={helpActionId === help.id}
                                      className="text-emerald-600 hover:text-emerald-800 text-sm disabled:opacity-60"
                                    >
                                      {helpActionId === help.id ? 'Kaydediliyor...' : 'Kaydet'}
                                    </button>
                                    <button
                                      onClick={handleCancelHelpEdit}
                                      disabled={helpActionId === help.id}
                                      className="text-gray-600 hover:text-gray-800 text-sm disabled:opacity-60"
                                    >
                                      Vazgeç
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <Link href={buildSightingPath(help.id, help.title || help.link_preview_title || help.location_description)} className="text-blue-600 hover:text-blue-800 text-sm">
                                      Görüntüle
                                    </Link>
                                    <button
                                      onClick={() => handleStartHelpEdit(help)}
                                      disabled={helpActionId === help.id}
                                      className="text-amber-600 hover:text-amber-800 text-sm disabled:opacity-60"
                                    >
                                      Düzenle
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHelp(help)}
                                      disabled={helpActionId === help.id}
                                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-60"
                                    >
                                      {helpActionId === help.id ? 'Siliniyor...' : 'Sil'}
                                    </button>
                                  </>
                                )}
                              </div>
                              {helpEditingId === help.id && (
                                <textarea
                                  value={helpEditForm.notes}
                                  onChange={(e) => setHelpEditForm({ ...helpEditForm, notes: e.target.value })}
                                  rows={2}
                                  placeholder="Notlar"
                                  className="mt-3 w-full min-w-[220px] px-3 py-2 border border-amber-200 rounded-lg"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rare' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nadir Paylaşımlarım</h3>
                {userRares.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">💎</div>
                    <p className="text-gray-600">Henüz nadir paylaşımınız yok.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userRares.map((rare) => (
                      <div key={rare.id} className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        {rareEditingId === rare.id ? (
                          <div className="w-full space-y-3">
                            <input
                              value={rareEditForm.description}
                              onChange={(e) => setRareEditForm({ ...rareEditForm, description: e.target.value })}
                              placeholder="Nadir açıklaması"
                              className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                value={rareEditForm.category}
                                onChange={(e) => setRareEditForm({ ...rareEditForm, category: e.target.value })}
                                placeholder="Kategori"
                                className="px-3 py-2 border border-purple-200 rounded-lg"
                              />
                              <input
                                value={rareEditForm.price}
                                onChange={(e) => setRareEditForm({ ...rareEditForm, price: e.target.value })}
                                placeholder="Fiyat"
                                className="px-3 py-2 border border-purple-200 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                value={rareEditForm.location_name}
                                onChange={(e) => setRareEditForm({ ...rareEditForm, location_name: e.target.value })}
                                placeholder="Konum adı"
                                className="px-3 py-2 border border-purple-200 rounded-lg"
                              />
                              <input
                                value={rareEditForm.city}
                                onChange={(e) => setRareEditForm({ ...rareEditForm, city: e.target.value })}
                                placeholder="Şehir"
                                className="px-3 py-2 border border-purple-200 rounded-lg"
                              />
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={rareEditForm.is_in_museum}
                                onChange={(e) => setRareEditForm({ ...rareEditForm, is_in_museum: e.target.checked })}
                              />
                              Nadir müzemde göster
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleSaveRareEdit(rare)}
                                disabled={rareActionId === rare.id}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-60"
                              >
                                {rareActionId === rare.id ? 'Kaydediliyor...' : 'Kaydet'}
                              </button>
                              <button
                                onClick={handleCancelRareEdit}
                                disabled={rareActionId === rare.id}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg disabled:opacity-60"
                              >
                                Vazgeç
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{rare.description}</p>
                              <p className="text-sm text-gray-600">📍 {rare.location_name}{rare.city ? `, ${rare.city}` : ''}</p>
                              <p className="text-xs text-gray-500 mt-1">{new Date(rare.created_at).toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={buildRareSightingPath(rare.id, rare.title || rare.link_preview_title || rare.description)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
                                Detay
                              </Link>
                              <button
                                onClick={() => handleStartRareEdit(rare)}
                                disabled={rareActionId === rare.id}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-60"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleToggleRareMuseum(rare)}
                                disabled={rareActionId === rare.id}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${rare.is_in_museum ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                              >
                                {rareActionId === rare.id ? 'Güncelleniyor...' : rare.is_in_museum ? 'Müzeden Çıkar' : 'Müzeye Ekle'}
                              </button>
                              <button
                                onClick={() => handleDeleteRare(rare)}
                                disabled={rareActionId === rare.id}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60"
                              >
                                Sil
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'museum' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Nadir Müzem</h3>
                {userRares.filter((item) => item.is_in_museum).length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">🏛️</div>
                    <p className="text-gray-600">Müzenizde henüz paylaşım yok. Nadirlerim sekmesinden ekleyebilirsiniz.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRares
                      .filter((item) => item.is_in_museum)
                      .map((rare) => (
                        <div key={rare.id} className="border border-gray-100 rounded-xl p-4">
                          <p className="font-semibold text-gray-900 mb-1">{rare.description}</p>
                          <p className="text-sm text-gray-600">📍 {rare.location_name}{rare.city ? `, ${rare.city}` : ''}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Link href={buildRareSightingPath(rare.id, rare.title || rare.link_preview_title || rare.description)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
                              Detay
                            </Link>
                            <button
                              onClick={() => handleToggleRareMuseum(rare)}
                              disabled={rareActionId === rare.id}
                              className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm disabled:opacity-60"
                            >
                              {rareActionId === rare.id ? 'Güncelleniyor...' : 'Müzeden Çıkar'}
                            </button>
                            <button
                              onClick={() => handleDeleteRare(rare)}
                              disabled={rareActionId === rare.id}
                              className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm disabled:opacity-60"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collection' && (
              <div className="space-y-6">
                <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">➕ Koleksiyon Paylaşımı Oluştur</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      value={collectionForm.title}
                      onChange={(e) => setCollectionForm({ ...collectionForm, title: e.target.value })}
                      placeholder="Parça başlığı"
                      className="px-3 py-2 border border-blue-200 rounded-lg"
                    />
                    <input
                      value={collectionForm.category}
                      onChange={(e) => setCollectionForm({ ...collectionForm, category: e.target.value })}
                      placeholder="Kategori (opsiyonel)"
                      className="px-3 py-2 border border-blue-200 rounded-lg"
                    />
                    <div className="md:col-span-2 rounded-lg border border-blue-200 bg-white p-3">
                      <p className="text-sm font-medium text-blue-900 mb-2">Koleksiyon Fotoğrafı</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCollectionPhotoUpload}
                        className="w-full text-sm text-gray-700"
                      />
                      {collectionPhotoPreview && (
                        <div className="mt-3">
                          <img src={collectionPhotoPreview} alt="Koleksiyon önizleme" className="w-full max-h-56 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => {
                              setCollectionPhotoFile(null)
                              setCollectionPhotoPreview(null)
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Fotoğrafı Kaldır
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">İsterseniz aşağıya harici foto URL de girebilirsiniz.</p>
                    </div>
                    <input
                      value={collectionForm.photo_url}
                      onChange={(e) => setCollectionForm({ ...collectionForm, photo_url: e.target.value })}
                      placeholder="Harici Foto URL (opsiyonel)"
                      className="px-3 py-2 border border-blue-200 rounded-lg md:col-span-2"
                    />
                    <input
                      value={collectionForm.estimated_price}
                      onChange={(e) => setCollectionForm({ ...collectionForm, estimated_price: e.target.value })}
                      placeholder="Tahmini değer (opsiyonel)"
                      type="number"
                      className="px-3 py-2 border border-blue-200 rounded-lg"
                    />
                    <input
                      value={collectionForm.city}
                      onChange={(e) => setCollectionForm({ ...collectionForm, city: e.target.value })}
                      placeholder="Şehir (opsiyonel)"
                      className="px-3 py-2 border border-blue-200 rounded-lg"
                    />
                    <textarea
                      value={collectionForm.description}
                      onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                      placeholder="Koleksiyon açıklaması"
                      rows={3}
                      className="px-3 py-2 border border-blue-200 rounded-lg md:col-span-2"
                    />
                    <label className="flex items-center gap-2 text-sm text-blue-900 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={collectionForm.is_public}
                        onChange={(e) => setCollectionForm({ ...collectionForm, is_public: e.target.checked })}
                      />
                      Herkese açık paylaş
                    </label>
                  </div>
                  <button
                    onClick={handleCreateCollectionItem}
                    disabled={collectionSaving}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                  >
                    {collectionSaving ? 'Kaydediliyor...' : 'Koleksiyona Ekle'}
                  </button>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Koleksiyon Paylaşımlarım</h4>
                  {userCollectionItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <div className="text-4xl mb-4">💼</div>
                      <p className="text-gray-600">Henüz koleksiyon paylaşımı eklemediniz.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userCollectionItems.map((item) => (
                        <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                          {collectionEditingId === item.id ? (
                            <div className="space-y-3">
                              <input
                                value={collectionEditForm.title}
                                onChange={(e) => setCollectionEditForm({ ...collectionEditForm, title: e.target.value })}
                                placeholder="Başlık"
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
                              />
                              <textarea
                                value={collectionEditForm.description}
                                onChange={(e) => setCollectionEditForm({ ...collectionEditForm, description: e.target.value })}
                                rows={3}
                                placeholder="Açıklama"
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  value={collectionEditForm.category}
                                  onChange={(e) => setCollectionEditForm({ ...collectionEditForm, category: e.target.value })}
                                  placeholder="Kategori"
                                  className="px-3 py-2 border border-blue-200 rounded-lg"
                                />
                                <input
                                  value={collectionEditForm.estimated_price}
                                  onChange={(e) => setCollectionEditForm({ ...collectionEditForm, estimated_price: e.target.value })}
                                  placeholder="Tahmini değer"
                                  className="px-3 py-2 border border-blue-200 rounded-lg"
                                />
                              </div>
                              <div className="rounded-lg border border-blue-200 bg-white p-3">
                                <p className="text-sm font-medium text-blue-900 mb-2">Fotoğrafı Güncelle</p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCollectionEditPhotoUpload}
                                  className="w-full text-sm text-gray-700"
                                />
                                {(collectionEditPhotoPreview || collectionEditForm.photo_url) && (
                                  <div className="mt-3">
                                    <img
                                      src={collectionEditPhotoPreview || collectionEditForm.photo_url}
                                      alt="Koleksiyon düzenleme önizleme"
                                      className="w-full max-h-48 object-cover rounded-lg"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCollectionEditPhotoFile(null)
                                        setCollectionEditPhotoPreview(null)
                                        setCollectionEditForm({ ...collectionEditForm, photo_url: '' })
                                      }}
                                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                                    >
                                      Fotoğrafı Kaldır
                                    </button>
                                  </div>
                                )}
                              </div>
                              <input
                                value={collectionEditForm.photo_url}
                                onChange={(e) => setCollectionEditForm({ ...collectionEditForm, photo_url: e.target.value })}
                                placeholder="Harici Foto URL"
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  value={collectionEditForm.city}
                                  onChange={(e) => setCollectionEditForm({ ...collectionEditForm, city: e.target.value })}
                                  placeholder="Şehir"
                                  className="px-3 py-2 border border-blue-200 rounded-lg"
                                />
                                <input
                                  value={collectionEditForm.district}
                                  onChange={(e) => setCollectionEditForm({ ...collectionEditForm, district: e.target.value })}
                                  placeholder="İlçe"
                                  className="px-3 py-2 border border-blue-200 rounded-lg"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={collectionEditForm.is_public}
                                    onChange={(e) => setCollectionEditForm({ ...collectionEditForm, is_public: e.target.checked })}
                                  />
                                  Herkese açık paylaş
                                </label>
                                <select
                                  value={collectionEditForm.status}
                                  onChange={(e) => setCollectionEditForm({ ...collectionEditForm, status: e.target.value })}
                                  className="px-3 py-2 border border-blue-200 rounded-lg"
                                >
                                  <option value="active">Yayında</option>
                                  <option value="archived">Arşivde</option>
                                </select>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleSaveCollectionEdit(item)}
                                  disabled={collectionActionId === item.id}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                                >
                                  {collectionActionId === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                                <button
                                  onClick={handleCancelCollectionEdit}
                                  disabled={collectionActionId === item.id}
                                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg disabled:opacity-60"
                                >
                                  Vazgeç
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {item.photo_url && (
                                <img src={item.photo_url} alt={item.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                              )}
                              <p className="font-semibold text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {item.is_public ? 'Herkese Açık' : 'Özel'} • {item.status === 'active' ? 'Yayında' : 'Arşivde'} • {new Date(item.created_at).toLocaleDateString('tr-TR')}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-3">
                                <Link href={buildCollectionPath(item.id, item.title)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Detay Sayfasına Git
                                </Link>
                                <button
                                  onClick={() => handleStartCollectionEdit(item)}
                                  disabled={collectionActionId === item.id}
                                  className="text-sm text-amber-600 hover:text-amber-800 font-medium disabled:opacity-60"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDeleteCollectionItem(item)}
                                  disabled={collectionActionId === item.id}
                                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-60"
                                >
                                  {collectionActionId === item.id ? 'Siliniyor...' : 'Sil'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'shop' && userShop && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Mağaza Bilgilerim</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Mağaza Detayları</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Mağaza Adı</p>
                        <p className="font-medium">{userShop.shop_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Şehir</p>
                        <p className="font-medium">{userShop.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Paket</p>
                        <p className="font-medium">
                          {userShop.subscription_type === 'free' ? 'Ücretsiz Başlangıç' : 'Premium'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Durum</p>
                        <p className="font-medium">
                          {userShop.is_verified ? '✓ Doğrulanmış' : 'Doğrulanmamış'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleOpenShopDashboard}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Mağaza Paneline Git
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/for-business?edit=true')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg"
                      >
                        📝 Mağaza Bilgilerini Düzenle
                      </button>
                      <button
                        onClick={handleCreateSpot}
                        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-3 rounded-lg"
                      >
                        🏪 Mağaza İçin Spot Oluştur
                      </button>
                      <button
                        onClick={() => router.push(`/shop/${userShop.id}`)}
                        className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-3 rounded-lg"
                      >
                        👁️ Mağazayı Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Hesap Ayarları</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Profil Bilgileri</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad
                        </label>
                        <p className="font-medium">{user.name || 'Belirtilmemiş'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Üyelik Tarihi
                        </label>
                        <p className="font-medium">
                          {new Date(user.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">Bildirimler</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Yeni spot cevapları</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Spot durum değişiklikleri</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm">Kampanya ve duyurular</span>
                      </label>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-bold text-gray-900 mb-3">Güvenlik</h4>
                      <button
                        onClick={() => router.push('/forgot-password')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg"
                      >
                        🔐 Şifre Değiştir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}