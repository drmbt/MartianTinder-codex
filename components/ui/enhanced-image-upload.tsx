"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2, Eye } from "lucide-react"
import { Button } from "./button"
import { NextImageGallery } from "./next-image-gallery"
import { ThumbnailImage } from "./responsive-image"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import Image from "next/image"

interface UploadedFile {
  fileName: string
  url: string
  originalName: string
  size: number
  type: string
}

interface EnhancedImageUploadProps {
  onUpload?: (files: UploadedFile[]) => void
  onRemove?: (fileName: string) => void
  maxFiles?: number
  subDir?: string
  existingImages?: string[]
  uploadedImages?: string[] // Add prop for uploaded images from parent
  className?: string
  disabled?: boolean
}

export function EnhancedImageUpload({
  onUpload,
  onRemove,
  maxFiles = 5,
  subDir = '',
  existingImages = [],
  uploadedImages = [],
  className = "",
  disabled = false
}: EnhancedImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allImages = [...existingImages, ...uploadedImages]
  
  // Debug logging
  console.log('EnhancedImageUpload render:', {
    existingImages: existingImages.length,
    uploadedImages: uploadedImages.length,
    allImages: allImages.length,
    uploadedImagesData: uploadedImages
  })
  


  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (disabled) return

    const fileArray = Array.from(files)
    const totalFiles = uploadedImages.length + existingImages.length + fileArray.length

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
        console.log('Upload successful, new files:', newFiles)
        console.log('File details:', newFiles.map(f => ({
          fileName: f.fileName,
          url: f.url,
          originalName: f.originalName
        })))
        
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
  }, [uploadedImages.length, existingImages.length, maxFiles, subDir, onUpload, disabled])



  const handleRemoveExistingImage = (imageUrl: string) => {
    if (disabled) return
    
    // Extract filename from URL for removal
    const fileName = imageUrl.split('/').pop() || imageUrl

    onRemove?.(fileName)
  }

  const handleRemoveUploadedImage = (imageUrl: string) => {
    if (disabled) return
    
    // Extract filename from URL for removal
    const fileName = imageUrl.split('/').pop() || imageUrl

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

  const remainingSlots = maxFiles - (uploadedImages.length + existingImages.length)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Gallery Preview - Only show if there are images */}
      {allImages.length > 0 && (
        <div className="relative group">
          <NextImageGallery 
            images={allImages}
            className="w-full h-64"
            alt="Uploaded images"
          />

        </div>
      )}

      {/* Individual Image Thumbnails with Always-Visible Controls */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Existing Images */}
          {existingImages.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="relative">
              <div 
                className="cursor-pointer relative overflow-hidden rounded-lg"
                onClick={() => setFullScreenImage(imageUrl)}
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    fill
                    className="object-cover hover:opacity-90 transition-opacity"
                    sizes="96px"
                  />
                </div>
                {/* Always visible overlay with controls */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye size={16} className="text-white" />
                </div>
              </div>
              
              {/* Always visible remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={() => handleRemoveExistingImage(imageUrl)}
                disabled={disabled}
              >
                <X size={12} />
              </Button>
            </div>
          ))}

          {/* Uploaded Files */}
          {uploadedImages.map((imageUrl, index) => (
            <div key={`uploaded-${index}`} className="relative">
              <div 
                className="cursor-pointer relative overflow-hidden rounded-lg"
                onClick={() => setFullScreenImage(imageUrl)}
              >
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover hover:opacity-90 transition-opacity"
                    sizes="96px"
                  />
                </div>
                {/* Always visible overlay with controls */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye size={16} className="text-white" />
                </div>
              </div>
              
              {/* Always visible remove button */}
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={() => handleRemoveUploadedImage(imageUrl)}
                disabled={disabled}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {remainingSlots > 0 && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 cursor-pointer'
          }`}
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
          
          <div className="space-y-2">
            {isUploading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p>PNG, JPG, WebP up to 5MB ({remainingSlots} slots remaining)</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Full Screen Image Viewer */}
      <Dialog open={!!fullScreenImage} onOpenChange={() => setFullScreenImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Full screen image view</DialogTitle>
          {fullScreenImage && (
                         <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center bg-black">
               <Image
                 src={fullScreenImage}
                 alt="Full screen view"
                 fill
                 className="object-contain"
                 sizes="90vw"
                 quality={100}
               />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                onClick={() => setFullScreenImage(null)}
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 