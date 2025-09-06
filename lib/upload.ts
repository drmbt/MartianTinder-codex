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
  // Image optimization settings - single version only
  optimization: {
    // Single optimized version with max 2048px on longest side
    maxDimension: 2048,
    quality: 85
  }
} as const

export interface UploadResult {
  success: boolean
  fileName?: string
  url?: string
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

// Optimize image to single version with max 2048px dimension
async function optimizeImage(buffer: Buffer, baseName: string, uploadPath: string): Promise<string> {
  const nameWithoutExt = baseName.replace(/\.[^/.]+$/, "")
  const fileName = `${nameWithoutExt}.webp`
  const filePath = join(uploadPath, fileName)

  // Get image metadata to determine dimensions
  const metadata = await sharp(buffer).metadata()
  const { width = 0, height = 0 } = metadata

  // Calculate resize dimensions maintaining aspect ratio
  // Resize only if larger than maxDimension
  let resizeWidth: number | undefined
  let resizeHeight: number | undefined

  if (width > UPLOAD_CONFIG.optimization.maxDimension || height > UPLOAD_CONFIG.optimization.maxDimension) {
    if (width > height) {
      resizeWidth = UPLOAD_CONFIG.optimization.maxDimension
    } else {
      resizeHeight = UPLOAD_CONFIG.optimization.maxDimension
    }
  }

  // Process and save the image
  await sharp(buffer)
    .resize(resizeWidth, resizeHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: UPLOAD_CONFIG.optimization.quality })
    .toFile(filePath)

  return fileName
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

    // Optimize image to single version
    const optimizedFileName = await optimizeImage(buffer, fileName, uploadPath)

    // Return success with URL
    const baseUrl = subDir ? `/uploads/${subDir}` : `/uploads`

    return {
      success: true,
      fileName: optimizedFileName,
      url: `${baseUrl}/${optimizedFileName}`
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