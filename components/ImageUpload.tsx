// components/ImageUpload.tsx
'use client'

import { useRef, useState } from 'react'

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void
  maxImages?: number
}

export default function ImageUpload({ 
  onImagesSelected, 
  maxImages = 10 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.slice(0, maxImages - previews.length)
    
    if (validFiles.length === 0) return
    
    // Preview oluştur
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])
    
    onImagesSelected(validFiles)
  }

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="grid grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm"
            >
              ×
            </button>
          </div>
        ))}
        
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition"
          >
            <div className="text-2xl mb-2">+</div>
            <div className="text-sm text-gray-600">Resim Ekle</div>
          </button>
        )}
      </div>
    </div>
  )
}