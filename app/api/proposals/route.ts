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
    const validatedData = createProposalSchema.parse(body)

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
        publishAt: validatedData.publishAt,
        expiresAt: validatedData.expiresAt,
        visibility: validatedData.visibility,
        allowAnonymous: validatedData.allowAnonymous,
        moderationMode: validatedData.moderationMode,
        externalChatUrl: validatedData.externalChatUrl,
        imageUrl: validatedData.imageUrl,
      },
      include: {
        channel: true,
        owner: true,
        _count: {
          select: {
            supports: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: proposal,
    })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 