import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createProposalSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received proposal data:", body)
    
    const validatedData = createProposalSchema.parse(body)
    console.log("Validated proposal data:", validatedData)

    // Verify user is a member of the channel
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: session.user.id,
          channelId: validatedData.channelId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this channel" }, { status: 403 })
    }

    const proposal = await prisma.proposal.create({
      data: {
        title: validatedData.title,
        note: validatedData.note,
        channelId: validatedData.channelId,
        ownerId: session.user.id,
        minCapacity: validatedData.minCapacity,
        maxCapacity: validatedData.maxCapacity,
        threshold: validatedData.threshold,
        publishAt: validatedData.publishAt && validatedData.publishAt !== "" ? new Date(validatedData.publishAt) : null,
        expiresAt: validatedData.expiresAt && validatedData.expiresAt !== "" ? new Date(validatedData.expiresAt) : null,
        visibility: validatedData.visibility,
        allowAnonymous: validatedData.allowAnonymous,
        moderationMode: validatedData.moderationMode,
        externalChatUrl: validatedData.externalChatUrl,
        imageUrl: validatedData.imageUrl,
        suggestedEventDate: validatedData.suggestedEventDate,
      },
      include: {
        channel: true,
        owner: true,
        images: true,
        _count: {
          select: {
            supports: true,
          },
        },
      },
    })

    // Create image records if provided
    if (validatedData.images && Array.isArray(validatedData.images) && validatedData.images.length > 0) {
      try {
        await prisma.proposalImage.createMany({
          data: validatedData.images.map((img: any, index: number) => ({
            proposalId: proposal.id,
            url: img.url,
            fileName: img.fileName,
            order: index
          }))
        })
      } catch (imageError) {
        console.error("Error creating images:", imageError)
        // Continue without failing the proposal creation
      }
    }

    return NextResponse.json({
      success: true,
      data: proposal,
    })
  } catch (error) {
    console.error("Error creating proposal:", error)
    
    // Return detailed error for debugging
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal server error", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 })
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 