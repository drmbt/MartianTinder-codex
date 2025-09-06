import { mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

// Upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  uploadDir: join(process.cwd(), 'public/uploads'),
  maxImagesPerUpload: 5,
  // Image optimization settings
  optimization: {
    // Main display image (for cards, galleries)
    main: { width: 800, height: 600, quality: 80 },
    // Thumbnail for lists and previews
    thumb: { width: 300, height: 200, quality: 70 },
    // Large for full-screen viewing
    large: { width: 1200, height: 900, quality: 85 }
  }
} as const

export interface UploadResult {
  success: boolean
  fileName?: string
  url?: string
  thumbUrl?: string
  largeUrl?: string
  error?: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

// Validate file type and size
export function validateFile(file: File): ValidationResult {
  // Check file size
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`
    }
  }

  // Check file type
  const mimeType = file.type as typeof UPLOAD_CONFIG.allowedTypes[number]
  if (!UPLOAD_CONFIG.allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`
    }
  }

  // Check file extension
  const extension = ('.' + file.name.split('.').pop()?.toLowerCase()) as typeof UPLOAD_CONFIG.allowedExtensions[number]
  if (!UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} not allowed. Allowed extensions: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`
    }
  }

  return { valid: true }
}

// Generate unique filename
export function generateFileName(originalName: string): string {
  const extension = '.' + originalName.split('.').pop()?.toLowerCase()
  const uuid = randomUUID()
  const timestamp = Date.now()
  return `${timestamp}-${uuid}${extension}`
}

// Optimize image and create multiple sizes
async function optimizeImage(buffer: Buffer, baseName: string, uploadPath: string): Promise<{
  main: string
  thumb: string
  large: string
}> {
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "")
  
  // Create main optimized image
  const mainFileName = `${nameWithoutExt}.webp`
  const mainPath = join(uploadPath, mainFileName)
  await sharp(buffer)
    .resize(UPLOAD_CONFIG.optimization.main.width, UPLOAD_CONFIG.optimization.main.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: UPLOAD_CONFIG.optimization.main.quality })
    .toFile(mainPath)

  // Create thumbnail
  const thumbFileName = `${nameWithoutExt}_thumb.webp`
  const thumbPath = join(uploadPath, thumbFileName)
  await sharp(buffer)
    .resize(UPLOAD_CONFIG.optimization.thumb.width, UPLOAD_CONFIG.optimization.thumb.height, {
      fit: 'cover',
      position: 'center'
    })
    .webp({ quality: UPLOAD_CONFIG.optimization.thumb.quality })
    .toFile(thumbPath)

  // Create large version
  const largeFileName = `${nameWithoutExt}_large.webp`
  const largePath = join(uploadPath, largeFileName)
  await sharp(buffer)
    .resize(UPLOAD_CONFIG.optimization.large.width, UPLOAD_CONFIG.optimization.large.height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: UPLOAD_CONFIG.optimization.large.quality })
    .toFile(largePath)

  return {
    main: mainFileName,
    thumb: thumbFileName,
    large: largeFileName
  }
}

// Save file to uploads directory
export async function saveFile(file: File, subDir: string = ''): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Create upload directory if it doesn't exist
    const uploadPath = subDir 
      ? join(UPLOAD_CONFIG.uploadDir, subDir)
      : UPLOAD_CONFIG.uploadDir
    
    await mkdir(uploadPath, { recursive: true })

    // Generate unique filename
    const fileName = generateFileName(file.name)

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Optimize and create multiple sizes
    const optimizedFiles = await optimizeImage(buffer, fileName, uploadPath)

    // Return success with URLs
    const baseUrl = subDir ? `/uploads/${subDir}` : `/uploads`

    return {
      success: true,
      fileName: optimizedFiles.main,
      url: `${baseUrl}/${optimizedFiles.main}`,
      thumbUrl: `${baseUrl}/${optimizedFiles.thumb}`,
      largeUrl: `${baseUrl}/${optimizedFiles.large}`
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: 'Failed to save file'
    }
  }
}

// Delete file (for cleanup)
export async function deleteFile(fileName: string, subDir: string = ''): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises')
    const filePath = subDir 
      ? join(UPLOAD_CONFIG.uploadDir, subDir, fileName)
      : join(UPLOAD_CONFIG.uploadDir, fileName)
    
    await unlink(filePath)
    return true
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
} 