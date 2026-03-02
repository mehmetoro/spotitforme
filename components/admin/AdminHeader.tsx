// components/admin/AdminHeader.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">spotitforme.com yönetimi</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium text-gray-900">Admin</p>
            <p className="text-sm text-gray-600">Yönetici</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  )
}