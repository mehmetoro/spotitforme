export default function TestImagePage() {
  const testUrl = 'https://gobzxreumkbgaohvzoef.supabase.co/storage/v1/object/public/spot-images/7f4b4b19-992c-47b6-a1ba-29d339dade1b/1769311004662.png'
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resim Test Sayfası</h1>
      
      <div className="space-y-8">
        {/* Test 1: Direkt img tag */}
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Direkt img tag:</h2>
          <img 
            src={testUrl} 
            alt="Test" 
            className="w-64 h-64 object-cover border"
          />
          <p className="mt-2 text-sm">URL: {testUrl}</p>
        </div>
        
        {/* Test 2: Background image */}
        <div>
          <h2 className="text-xl font-semibold mb-2">2. Background image:</h2>
          <div 
            className="w-64 h-64 border bg-cover bg-center"
            style={{ backgroundImage: `url(${testUrl})` }}
          ></div>
        </div>
        
        {/* Test 3: Next.js Image */}
        <div>
          <h2 className="text-xl font-semibold mb-2">3. Next.js Image (config gerekli):</h2>
          {/* <Image src={testUrl} alt="Test" width={256} height={256} /> */}
          <p className="text-gray-600">next.config.js ayarlı değilse çalışmaz</p>
        </div>
      </div>
    </div>
  )
}