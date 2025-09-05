import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ProposalsList } from "@/components/features/proposals/proposals-list"

export default async function ProposePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's own proposals
  const userProposals = await prisma.proposal.findMany({
    where: { ownerId: session.user.id },
    include: {
      channel: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          supports: true
        }
      },
      event: {
        select: {
          id: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Your Proposals</h1>
            <p className="text-gray-600 text-sm">
              Manage your proposals and track their progress
            </p>
          </div>
          
          <ProposalsList proposals={userProposals} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 