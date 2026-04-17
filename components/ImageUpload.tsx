// components/ImageUpload.tsx
'use client'

import { useRef, useState } from 'react'
import { getImagePreviewDataUrl, optimizeImageFile } from '@/lib/image-processing'

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void
  maxImages?: number
}

export default function ImageUpload({ 
  onImagesSelected, 
  maxImages = 1 
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    try {
      const optimizedFile = await optimizeImageFile(selectedFile)
      const preview = await getImagePreviewDataUrl(optimizedFile)
      setPreviews([preview])
      onImagesSelected([optimizedFile])
    } catch {
      alert('Resim optimize edilirken bir hata olustu.')
    }

    e.target.value = ''
  }

  const removeImage = () => {
    setPreviews([])
    onImagesSelected([])
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
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
              onClick={removeImage}
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