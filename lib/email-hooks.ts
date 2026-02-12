// lib/email-hooks.ts
import { emailService } from './email-service'
import { supabase } from './supabase'

// 1. Kullanıcı kayıt olduğunda
export async function onUserRegistered(userId: string) {
  try {
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    
    if (user?.user?.email) {
      await emailService.sendWelcomeEmail(
        user.user.email,
        user.user.user_metadata?.name || 'Kullanıcı'
      )
    }
  } catch (error) {
    console.error('Kullanıcı kayıt email hatası:', error)
  }
}

// 2. Spot oluşturulduğunda
export async function onSpotCreated(spotId: string) {
  try {
    // Spot bilgilerini getir
    const { data: spot } = await supabase
      .from('spots')
      .select('*, user:user_id(email)')
      .eq('id', spotId)
      .single()

    if (spot?.user?.email && spot.title) {
      await emailService.sendSpotCreatedEmail(
        spot.user.email,
        spot.title,
        spotId
      )
    }
  } catch (error) {
    console.error('Spot oluşturma email hatası:', error)
  }
}

// 3. Yardım bildirimi geldiğinde
export async function onSightingCreated(sightingId: string) {
  try {
    // Sightings ve spot bilgilerini getir
    const { data: sighting } = await supabase
      .from('sightings')
      .select(`
        *,
        spot:spots!inner(title, user_id),
        spotter:spotter_id(email, user_metadata)
      `)
      .eq('id', sightingId)
      .single()

    if (sighting?.spot?.user_id && sighting.spotter?.email) {
      // Spot sahibinin email'ini al
      const { data: spotOwner } = await supabase.auth.admin.getUserById(sighting.spot.user_id)
      
      if (spotOwner?.user?.email && sighting.spot.title) {
        await emailService.sendSightingNotification(
          spotOwner.user.email,
          sighting.spot.title,
          sighting.spotter.user_metadata?.name || sighting.spotter.email,
          sighting.spot_id,
          sighting.notes,
          sighting.price?.toString(),
          sighting.location_description
        )
      }
    }
  } catch (error) {
    console.error('Yardım bildirimi email hatası:', error)
  }
}

// 4. Spot bulunduğunda
export async function onSpotFound(spotId: string) {
  try {
    const { data: spot } = await supabase
      .from('spots')
      .select('*, user:user_id(email)')
      .eq('id', spotId)
      .single()

    if (spot?.user?.email && spot.title) {
      // Kullanıcının toplam spot sayısını getir
      const { count: totalSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', spot.user_id)

      const { count: foundSpots } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', spot.user_id)
        .eq('status', 'found')

      await emailService.sendSpotFoundEmail(
        spot.user.email,
        spot.title,
        spotId,
        undefined, // foundBy (opsiyonel)
        totalSpots || 0,
        foundSpots || 0
      )
    }
  } catch (error) {
    console.error('Spot bulundu email hatası:', error)
  }
}

// 5. İşletme kaydı olduğunda
export async function onBusinessRegistered(shopId: string) {
  try {
    const { data: shop } = await supabase
      .from('shops')
      .select('*, owner:owner_id(email, user_metadata)')
      .eq('id', shopId)
      .single()

    if (shop?.owner?.email && shop.shop_name) {
      await emailService.sendBusinessWelcomeEmail(
        shop.owner.email,
        shop.shop_name,
        shop.owner.user_metadata?.name || 'İşletme Sahibi',
        shop.subscription_type || 'free',
        `${shop.free_images_used || 0}/${shop.total_images || 20}`
      )
    }
  } catch (error) {
    console.error('İşletme kayıt email hatası:', error)
  }
}

// 6. Şifre sıfırlama
export async function onPasswordResetRequested(email: string, resetLink: string) {
  try {
    await emailService.sendPasswordResetEmail(email, resetLink)
  } catch (error) {
    console.error('Şifre sıfırlama email hatası:', error)
  }
}

// 7. Admin alert
export async function sendSystemAlert(title: string, details: any) {
  try {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@spotitforme.com']
    
    await emailService.sendAdminAlert(
      title,
      details,
      adminEmails
    )
  } catch (error) {
    console.error('Admin alert email hatası:', error)
  }
}