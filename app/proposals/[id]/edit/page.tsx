import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { ProposalForm } from "@/components/features/proposals/proposal-form"

interface EditProposalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProposalPage({ params }: EditProposalPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Fetch proposal with channel info
  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      channel: {
        include: {
          members: {
            where: { userId: session.user.id }
          }
        }
      },
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!proposal) {
    notFound()
  }

  // Check if user is the owner
  if (proposal.ownerId !== session.user.id) {
    redirect(`/p/${id}`)
  }

  // Check if user is a member of the channel
  if (proposal.channel.members.length === 0) {
    redirect("/channels")
  }

  // Get all user's channels for the form
  const userChannels = await prisma.channel.findMany({
    where: {
      members: {
        some: { userId: session.user.id }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Proposal</h1>
        <p className="text-gray-600">Make changes to your proposal</p>
      </div>

      <ProposalForm 
        channels={userChannels}
        editingProposal={proposal}
      />
    </div>
  )
} 