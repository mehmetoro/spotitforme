// components/StorageTest.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StorageTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testStorage = async () => {
    setTesting(true);
    setResult('Test başlıyor...');
    
    try {
      // 1. Bucket listesini kontrol et
      setResult('Bucket listesi alınıyor...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setResult(`Bucket listeleme hatası: ${bucketsError.message}`);
        return;
      }
      
      setResult(`Bucket'lar: ${buckets.map(b => b.name).join(', ')}`);
      
      // 2. product-images bucket'ını kontrol et
      const hasProductImagesBucket = buckets.some(b => b.name === 'product-images');
      
      if (!hasProductImagesBucket) {
        setResult('ERROR: "product-images" bucket bulunamadı!');
        return;
      }
      
      setResult('✅ "product-images" bucket mevcut');
      
      // 3. Test dosyası yükle
      setResult('Test dosyası yükleniyor...');
      const testContent = 'test';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload('test/test.txt', testFile);
      
      if (uploadError) {
        setResult(`Test yükleme hatası: ${uploadError.message}`);
        return;
      }
      
      setResult('✅ Test dosyası başarıyla yüklendi');
      
      // 4. Test dosyasını oku
      setResult('Test dosyası okunuyor...');
      const { data: readData, error: readError } = await supabase.storage
        .from('product-images')
        .download('test/test.txt');
      
      if (readError) {
        setResult(`Test okuma hatası: ${readError.message}`);
        return;
      }
      
      const text = await readData.text();
      setResult(`✅ Test dosyası okundu: "${text}"`);
      
      // 5. Temizle
      await supabase.storage
        .from('product-images')
        .remove(['test/test.txt']);
        
      setResult('✅ Tüm testler başarılı! Storage çalışıyor.');
      
    } catch (error: any) {
      setResult(`HATA: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testStorage}
        disabled={testing}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        {testing ? 'Testing...' : '🧪 Test Storage'}
      </button>
      {result && (
        <div className="mt-2 p-3 bg-white rounded-lg shadow-lg max-w-xs">
          <pre className="text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}