import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.object({
    url: z.string(),
    fileName: z.string()
  })).optional()
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    
    // Handle images if provided
    const { images, ...userData } = validatedData
    
    // Start a transaction to update user and images
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update the user
      await tx.user.update({
        where: { id: session.user.id },
        data: userData,
      })
      
      // If images were provided, update them
      if (images && Array.isArray(images)) {
        // Delete existing images
        await tx.userImage.deleteMany({
          where: { userId: session.user.id }
        })
        
        // Create new images
        if (images.length > 0) {
          await tx.userImage.createMany({
            data: images.map((img, index) => ({
              userId: session.user.id,
              url: img.url,
              fileName: img.fileName || img.url.split('/').pop() || 'image.jpg',
              order: index
            }))
          })
        }
      }
      
      // Return the updated user with images
      return await tx.user.findUnique({
        where: { id: session.user.id },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}