import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supportSignalSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, visibility } = supportSignalSchema.parse(body)

    // Verify proposal exists and user has access
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        channel: {
          include: {
            members: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.channel.members.length === 0) {
      return NextResponse.json({ error: "Not a member of this channel" }, { status: 403 })
    }

    // Upsert support signal (user can change their signal)
    const supportSignal = await prisma.supportSignal.upsert({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId: id,
        },
      },
      update: {
        type,
        visibility,
      },
      create: {
        userId: session.user.id,
        proposalId: id,
        type,
        visibility,
      },
    })

    // Get updated support counts
    const supportCounts = await prisma.supportSignal.groupBy({
      by: ['type'],
      where: { proposalId: id },
      _count: true
    })

    const stats = {
      supports: supportCounts.find(s => s.type === 'support')?._count || 0,
      supersupports: supportCounts.find(s => s.type === 'supersupport')?._count || 0,
      opposes: supportCounts.find(s => s.type === 'oppose')?._count || 0,
    }

    const totalSupport = stats.supports + stats.supersupports
    const threshold = proposal.threshold || 0
    const thresholdMet = threshold > 0 && totalSupport >= threshold

    return NextResponse.json({
      success: true,
      data: {
        signal: supportSignal,
        stats,
        thresholdMet,
        totalSupport,
        threshold,
      },
    })
  } catch (error) {
    console.error("Error creating support signal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Remove user's support signal
    await prisma.supportSignal.deleteMany({
      where: {
        userId: session.user.id,
        proposalId: id,
      },
    })

    // Get updated support counts
    const supportCounts = await prisma.supportSignal.groupBy({
      by: ['type'],
      where: { proposalId: id },
      _count: true
    })

    const stats = {
      supports: supportCounts.find(s => s.type === 'support')?._count || 0,
      supersupports: supportCounts.find(s => s.type === 'supersupport')?._count || 0,
      opposes: supportCounts.find(s => s.type === 'oppose')?._count || 0,
    }

    return NextResponse.json({
      success: true,
      data: { stats },
    })
  } catch (error) {
    console.error("Error removing support signal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 