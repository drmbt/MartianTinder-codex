"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "./button"
import { ImageGallery } from "./image-gallery"

interface UploadedFile {
  fileName: string
  url: string
  thumbUrl?: string
  largeUrl?: string
  originalName: string
  size: number
  type: string
}

interface ImageUploadProps {
  onUpload?: (files: UploadedFile[]) => void
  onRemove?: (fileName: string) => void
  maxFiles?: number
  subDir?: string
  existingImages?: string[]
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  onRemove,
  maxFiles = 5,
  subDir = '',
  existingImages = [],
  className = "",
  disabled = false
}: ImageUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allImages = [...existingImages, ...uploadedFiles.map(f => f.url)]

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (disabled) return

    const fileArray = Array.from(files)
    const totalFiles = uploadedFiles.length + existingImages.length + fileArray.length

    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    setError("")
    setIsUploading(true)

    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append('files', file)
      })
      if (subDir) {
        formData.append('subDir', subDir)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const newFiles = result.files as UploadedFile[]
        setUploadedFiles(prev => [...prev, ...newFiles])
        onUpload?.(newFiles)
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [uploadedFiles.length, existingImages.length, maxFiles, subDir, onUpload, disabled])

  const handleRemoveFile = (fileName: string) => {
    if (disabled) return
    
    setUploadedFiles(prev => prev.filter(f => f.fileName !== fileName))
    onRemove?.(fileName)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect, disabled])

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const remainingSlots = maxFiles - (uploadedFiles.length + existingImages.length)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Gallery Preview */}
      {allImages.length > 0 && (
        <div className="relative group">
          <ImageGallery 
            images={allImages}
            className="w-full h-64"
            alt="Uploaded images"
          />
        </div>
      )}

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-muted hover:border-muted-foreground'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 5MB ({remainingSlots} slots remaining)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm status-error p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uploadedFiles.map((file) => (
              <div key={file.fileName} className="relative group">
                <img
                  src={file.thumbUrl || file.url}
                  alt={file.originalName}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveFile(file.fileName)}
                  disabled={disabled}
                >
                  <X size={12} />
                </Button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  {Math.round(file.size / 1024)}KB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      <div className="text-xs text-gray-500">
        {allImages.length} of {maxFiles} images
      </div>
    </div>
  )
} 