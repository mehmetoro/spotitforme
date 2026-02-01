// hooks/useMobileDetection.ts
'use client'

import { useState, useEffect } from 'react'

interface UseMobileDetectionReturn {
  isMobile: boolean
  os: 'ios' | 'android' | 'other'
  browser: 'safari' | 'chrome' | 'firefox' | 'other'
}

export default function useMobileDetection(): UseMobileDetectionReturn {
  const [isMobile, setIsMobile] = useState(false)
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other')
  const [browser, setBrowser] = useState<'safari' | 'chrome' | 'firefox' | 'other'>('other')

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    // Mobil kontrol
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    setIsMobile(mobile)
    
    // OS kontrol
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios')
    } else if (/android/.test(userAgent)) {
      setOs('android')
    } else {
      setOs('other')
    }
    
    // Tarayıcı kontrol
    if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      setBrowser('safari')
    } else if (/chrome/.test(userAgent)) {
      setBrowser('chrome')
    } else if (/firefox/.test(userAgent)) {
      setBrowser('firefox')
    } else {
      setBrowser('other')
    }
  }, [])

  return { isMobile, os, browser }
}