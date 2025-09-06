import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { saveFile, UPLOAD_CONFIG } from "@/lib/upload"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const subDir = formData.get('subDir') as string || ''

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > UPLOAD_CONFIG.maxImagesPerUpload) {
      return NextResponse.json({ 
        error: `Maximum ${UPLOAD_CONFIG.maxImagesPerUpload} files allowed` 
      }, { status: 400 })
    }

    const results = []
    const errors = []

    for (const file of files) {
      if (file.size === 0) continue // Skip empty files
      
      const result = await saveFile(file, subDir)
      if (result.success) {
        results.push({
          fileName: result.fileName,
          url: result.url,
          originalName: file.name,
          size: file.size,
          type: file.type
        })
      } else {
        errors.push({
          fileName: file.name,
          error: result.error
        })
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ 
        error: "No files were uploaded successfully",
        details: errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      files: results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

// Get upload configuration
export async function GET() {
  return NextResponse.json({
    maxFileSize: UPLOAD_CONFIG.maxFileSize,
    allowedTypes: UPLOAD_CONFIG.allowedTypes,
    maxImagesPerUpload: UPLOAD_CONFIG.maxImagesPerUpload
  })
} 