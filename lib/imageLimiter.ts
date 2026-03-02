// lib/imageLimiter.ts (GÜNCELLENMİŞ - React hooks olmadan)
import { supabase } from './supabase'

export interface ImageLimitStatus {
  canUpload: boolean
  freeImagesUsed: number
  freeImagesTotal: number
  isPremium: boolean
  message?: string
}

export async function checkImageLimit(userId: string): Promise<ImageLimitStatus> {
  try {
    // 1. Kullanıcının mağazasını kontrol et
    const { data: shop } = await supabase
      .from('shops')
      .select('free_images_used, total_images, subscription_type')
      .eq('owner_id', userId)
      .single()

    // 2. Eğer mağaza kaydı yoksa, temel kullanıcı limiti
    if (!shop) {
      const { data: userSpots } = await supabase
        .from('spots')
        .select('image_url')
        .eq('user_id', userId)
        .not('image_url', 'is', null)

      const freeImagesUsed = userSpots?.length || 0
      const freeImagesTotal = 20 // Temel kullanıcı limiti

      return {
        canUpload: freeImagesUsed < freeImagesTotal,
        freeImagesUsed,
        freeImagesTotal,
        isPremium: false,
        message: freeImagesUsed >= freeImagesTotal 
          ? `Resim limitiniz doldu. ${freeImagesUsed}/${freeImagesTotal} resim kullandınız.`
          : undefined
      }
    }

    // 3. Mağaza için limit kontrolü
    const { free_images_used, total_images, subscription_type } = shop
    const isPremium = subscription_type !== 'free'
    
    return {
      canUpload: isPremium || free_images_used < total_images,
      freeImagesUsed: free_images_used,
      freeImagesTotal: total_images,
      isPremium,
      message: !isPremium && free_images_used >= total_images
        ? `Ücretsiz resim hakkınız doldu. ${free_images_used}/${total_images} resim kullandınız. Premium paketlere yükselin.`
        : undefined
    }

  } catch (error) {
    console.error('Resim limit kontrol hatası:', error)
    return {
      canUpload: true, // Hata durumunda upload'a izin ver
      freeImagesUsed: 0,
      freeImagesTotal: 20,
      isPremium: false
    }
  }
}

export async function incrementImageCount(userId: string): Promise<void> {
  try {
    // Mağaza kaydı var mı?
    const { data: shop } = await supabase
      .from('shops')
      .select('id, free_images_used')
      .eq('owner_id', userId)
      .single()

    if (shop) {
      // Mağaza resim sayacını artır
      await supabase
        .from('shops')
        .update({ free_images_used: (shop.free_images_used || 0) + 1 })
        .eq('id', shop.id)
    }
    // Temel kullanıcılar için sayacı tutmuyoruz
  } catch (error) {
    console.error('Resim sayacı artırma hatası:', error)
  }
}

export async function decrementImageCount(userId: string): Promise<void> {
  try {
    const { data: shop } = await supabase
      .from('shops')
      .select('id, free_images_used')
      .eq('owner_id', userId)
      .single()

    if (shop && shop.free_images_used > 0) {
      await supabase
        .from('shops')
        .update({ free_images_used: Math.max(0, shop.free_images_used - 1) })
        .eq('id', shop.id)
    }
  } catch (error) {
    console.error('Resim sayacı azaltma hatası:', error)
  }
}

// Resim limit kontrolü için React component'i ayrı bir dosyada olsun
// components/ImageLimitChecker.tsx olarak oluşturalım