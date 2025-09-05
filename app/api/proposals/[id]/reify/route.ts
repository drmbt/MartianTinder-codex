import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createEventSchema } from "@/lib/validations"
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
    const eventData = createEventSchema.parse(body)

    // Verify proposal exists and user is the owner
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        event: true,
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

    if (proposal.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the proposal owner can reify it" }, { status: 403 })
    }

    if (proposal.event) {
      return NextResponse.json({ error: "Proposal has already been reified" }, { status: 400 })
    }

    // Check if threshold is met
    const supportCounts = await prisma.supportSignal.groupBy({
      by: ['type'],
      where: { proposalId: id },
      _count: true
    })

    const totalSupport = (supportCounts.find(s => s.type === 'support')?._count || 0) +
                        (supportCounts.find(s => s.type === 'supersupport')?._count || 0)
    const threshold = proposal.threshold || 0

    if (threshold > 0 && totalSupport < threshold) {
      return NextResponse.json({ 
        error: "Proposal has not met the required threshold",
        data: { totalSupport, threshold }
      }, { status: 400 })
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        proposalId: id,
        title: eventData.title || proposal.title,
        description: eventData.description || proposal.note,
        startAt: eventData.startAt,
        endAt: eventData.endAt,
        location: eventData.location,
        icsUid: `${id}-${Date.now()}@mariantinder.app`, // Unique ICS identifier
      },
    })

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error("Error reifying proposal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 