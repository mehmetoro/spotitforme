// Basit bir test komponenti oluştur
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function StorageTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testStorage = async () => {
    setLoading(true)
    try {
      // 1. Bucket listesi
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      console.log('📦 Buckets:', buckets)
      
      // 2. spot-images bucket detayı
      const spotImagesBucket = buckets?.find(b => b.id === 'spot-images')
      console.log('🎯 spot-images bucket:', spotImagesBucket)
      
      // 3. Bucket'a dosya yükleme testi (küçük bir test dosyası)
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('spot-images')
        .upload(`test-${Date.now()}.txt`, testFile)
      
      console.log('📤 Upload sonucu:', { uploadData, uploadError })
      
      // 4. Yüklenen dosyayı sil
      if (uploadData) {
        await supabase.storage
          .from('spot-images')
          .remove([uploadData.path])
      }
      
      setResult({
        buckets,
        spotImagesBucket,
        uploadResult: uploadError ? { error: uploadError.message } : { success: true, path: uploadData?.path },
        timestamp: new Date().toISOString()
      })
      
    } catch (error: any) {
      console.error('❌ Storage test hatası:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🛠️ Storage Test</h1>
      <button
        onClick={testStorage}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Storage Test Çalıştır'}
      </button>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Sonuçlar:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}