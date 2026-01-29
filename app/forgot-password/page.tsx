// app/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    setLoading(false)
    if (!error) setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow">
          <h1 className="text-2xl font-bold mb-4">Şifremi Unuttum</h1>
          {success ? (
            <p className="text-green-600">Şifre sıfırlama linki gönderildi!</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border rounded mb-4"
                required
              />
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white p-2 rounded"
                disabled={loading}
              >
                {loading ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}