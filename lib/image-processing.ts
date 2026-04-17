export interface ImageProcessingOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: 'image/webp' | 'image/jpeg'
}

export const IMAGE_UPLOAD_STANDARD: Required<ImageProcessingOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.82,
  mimeType: 'image/webp',
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Dosya okunamadi'))
    reader.readAsDataURL(file)
  })

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Resim islenemedi'))
    img.src = src
  })

const buildOutputFileName = (originalName: string, mimeType: string) => {
  const baseName = originalName.replace(/\.[^/.]+$/, '') || 'image'
  const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'webp'
  return `${safeBaseName}.${ext}`
}

export async function optimizeImageFile(
  file: File,
  options: ImageProcessingOptions = {}
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Sadece resim dosyasi yuklenebilir')
  }

  const { maxWidth, maxHeight, quality, mimeType } = {
    ...IMAGE_UPLOAD_STANDARD,
    ...options,
  }

  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const targetWidth = Math.max(1, Math.round(img.width * scale))
  const targetHeight = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Resim isleme basarisiz oldu')
  }

  context.drawImage(img, 0, 0, targetWidth, targetHeight)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality)
  })

  if (!blob) {
    throw new Error('Resim optimize edilirken hata olustu')
  }

  return new File([blob], buildOutputFileName(file.name, mimeType), {
    type: mimeType,
    lastModified: Date.now(),
  })
}

export async function getImagePreviewDataUrl(file: File): Promise<string> {
  return fileToDataUrl(file)
}
