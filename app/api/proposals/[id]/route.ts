import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProposalSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateProposalSchema.parse(body)

    // Verify proposal exists and user is the owner
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { ownerId: true }
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the proposal owner can update it" }, { status: 403 })
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...validatedData,
        publishAt: validatedData.publishAt ? new Date(validatedData.publishAt) : undefined,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      },
      include: {
        channel: true,
        owner: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProposal,
    })
  } catch (error) {
    console.error("Error updating proposal:", error)
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

    // Verify proposal exists and user is the owner
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      select: { ownerId: true, event: { select: { id: true } } }
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only the proposal owner can delete it" }, { status: 403 })
    }

    // Allow deletion even if reified - delete event too
    if (proposal.event) {
      await prisma.event.delete({
        where: { proposalId: id }
      })
    }

    // Delete proposal (cascade will handle related records)
    await prisma.proposal.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Proposal deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 