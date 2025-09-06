import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProposalSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

interface RouteParams {
  params: Promise<{
    id: string
  }>
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

    // Handle images if provided - extract safely
    const { images, ...proposalData } = validatedData as Record<string, unknown> & { 
      images?: Array<{ url: string; fileName?: string }>
      publishAt?: string
      expiresAt?: string
    }
    
    // Start a transaction to update proposal and images
    const updatedProposal = await prisma.$transaction(async (tx) => {
      // Update the proposal
      await tx.proposal.update({
        where: { id },
        data: {
          ...proposalData,
          publishAt: proposalData.publishAt ? new Date(proposalData.publishAt as string) : undefined,
          expiresAt: proposalData.expiresAt ? new Date(proposalData.expiresAt as string) : undefined,
        },
      })
      
      // If images were provided, update them
      if (images && Array.isArray(images)) {
        // Delete existing images
        await tx.proposalImage.deleteMany({
          where: { proposalId: id }
        })
        
        // Create new images
        if (images.length > 0) {
          await tx.proposalImage.createMany({
            data: images.map((img, index) => ({
              proposalId: id,
              url: img.url,
              fileName: img.fileName || img.url.split('/').pop() || 'image.jpg',
              order: index
            }))
          })
        }
      }
      
      // Return the updated proposal with all includes
      return await tx.proposal.findUnique({
        where: { id },
        include: {
          channel: true,
          owner: true,
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
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