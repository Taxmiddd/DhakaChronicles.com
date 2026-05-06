'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  value: string
  onChange: (url: string) => void
}

async function convertToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not available')); return }
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(objectUrl)
      resolve(canvas.toDataURL('image/webp', 0.88))
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

export function ImageDropZone({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file.')
      return
    }
    setIsUploading(true)
    try {
      const webpBase64 = await convertToWebP(file)
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: webpBase64, folder: 'dhaka_chronicles/articles' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.media.file_url)
    } catch (err: any) {
      alert(err.message ?? 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [onChange])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-[120px] ${
          isDragging
            ? 'border-[#00A651] bg-[#00A651]/10'
            : 'border-white/15 hover:border-white/30 bg-black/20'
        }`}
      >
        {isUploading ? (
          <Loader2 className="w-7 h-7 animate-spin text-[#00A651]" />
        ) : value ? (
          <img
            src={value}
            alt="Featured"
            className="w-full max-h-[180px] object-cover rounded-lg"
          />
        ) : (
          <>
            <Upload className="w-7 h-7 text-gray-500" />
            <p className="text-xs text-gray-500 text-center px-4">
              Drop an image here or <span className="text-[#00A651] font-semibold">click to browse</span>
              <br />
              <span className="text-gray-600">Any format → auto-converted to WebP</span>
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* URL field + clear button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input text-sm pl-8 font-mono text-xs"
            placeholder="https://res.cloudinary.com/..."
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-lg bg-dc-surface hover:bg-dc-surface-2 text-gray-400 hover:text-red-400 transition-colors shrink-0"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">Used for OpenGraph SEO and Article Header</p>
    </div>
  )
}
