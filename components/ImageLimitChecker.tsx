// components/ImageLimitChecker.tsx
'use client'

import { useState, useEffect } from 'react'
import { checkImageLimit, ImageLimitStatus } from '@/lib/imageLimiter'

interface ImageLimitCheckerProps {
  userId: string
  children: (props: {
    canUpload: boolean
    limitInfo: string
    isPremium: boolean
    openUpgradeModal: () => void
    loading: boolean
  }) => React.ReactNode
}

export default function ImageLimitChecker({ userId, children }: ImageLimitCheckerProps) {
  const [limitStatus, setLimitStatus] = useState<ImageLimitStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLimit = async () => {
      setLoading(true)
      const status = await checkImageLimit(userId)
      setLimitStatus(status)
      setLoading(false)
    }
    
    loadLimit()
  }, [userId])

  if (loading) {
    return children({
      canUpload: true,
      limitInfo: 'Yükleniyor...',
      isPremium: false,
      openUpgradeModal: () => {},
      loading: true
    })
  }

  if (!limitStatus) {
    return children({
      canUpload: true,
      limitInfo: 'Limit kontrol edilemedi',
      isPremium: false,
      openUpgradeModal: () => {},
      loading: false
    })
  }

  const limitInfo = `${limitStatus.freeImagesUsed}/${limitStatus.freeImagesTotal} resim kullanıldı`

  return children({
    canUpload: limitStatus.canUpload,
    limitInfo,
    isPremium: limitStatus.isPremium,
    openUpgradeModal: () => {
      // Premium upgrade modal'ını aç
      console.log('Premium upgrade modal aç')
      // Burada modal açma işlemi yapılacak
    },
    loading: false
  })
}