import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { proposalUserStateSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { state } = proposalUserStateSchema.parse(body)

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

    // Upsert user state
    const userState = await prisma.proposalUserState.upsert({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId: id,
        },
      },
      update: {
        state,
      },
      create: {
        userId: session.user.id,
        proposalId: id,
        state,
      },
    })

    return NextResponse.json({
      success: true,
      data: userState,
    })
  } catch (error) {
    console.error("Error updating user state:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 