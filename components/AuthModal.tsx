// components/AuthModal.tsx - CLIENT SIDE (nodemailer olmadan)
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email-server' // SERVER ACTION

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (isLogin) {
        // GİRİŞ YAP
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        setSuccessMessage('Başarıyla giriş yaptınız!')
        
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
        
      } else {
        // KAYIT OL
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        })
        
        if (error) throw error
        
        // KAYIT BAŞARILI - SERVER ACTION İLE EMAIL GÖNDER
        if (data.user) {
          try {
            const result = await sendWelcomeEmail(email, name)
            
            if (result.success) {
              setSuccessMessage(`🎉 Hoş geldiniz ${name}! Kaydınız başarıyla oluşturuldu.`)
            } else {
              setSuccessMessage(`✅ Kaydınız başarıyla oluşturuldu ${name}! (Email gönderilemedi)`)
            }
          } catch (emailError) {
            console.warn('⚠️ Email gönderilemedi:', emailError)
            setSuccessMessage(`✅ Kaydınız başarıyla oluşturuldu ${name}!`)
          }
          
          setTimeout(() => {
            onClose()
            window.location.href = '/profile'
          }, 2000)
        }
      }

    } catch (err: any) {
      console.error('Auth error:', err)
      
      let errorMessage = err.message || 'Bir hata oluştu'
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Geçersiz email veya şifre'
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Lütfen email adresinizi doğrulayın'
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Bu email adresi zaten kayıtlı'
      } else if (errorMessage.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır'
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Geçersiz email adresi'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
    setSuccessMessage('')
    onClose()
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccessMessage('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'Spot oluşturmak ve yardım etmek için giriş yapın' 
              : 'Topluluğumuza katılın, kayıp ürünleri birlikte bulalım'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ahmet Yılmaz"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ornek@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Şifreniz en az 6 karakter olmalıdır
              </p>
            )}
          </div>

          {/* Başarı Mesajı */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                İşleniyor...
              </>
            ) : (
              isLogin ? 'Giriş Yap' : 'Hesap Oluştur'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t p-6 text-center">
          <p className="text-gray-600">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button
              onClick={switchMode}
              disabled={loading}
              className="text-blue-600 hover:text-blue-800 font-medium ml-2 disabled:opacity-50"
            >
              {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}