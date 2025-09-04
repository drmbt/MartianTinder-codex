import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ProposalForm } from "@/components/features/proposals/proposal-form"

export default async function NewProposalPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's channels for the dropdown
  const userChannels = await prisma.channelMember.findMany({
    where: { userId: session.user.id },
    include: {
      channel: true
    },
  })

  if (userChannels.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-3xl font-bold">Create Proposal</h1>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                No Channels Available
              </h2>
              <p className="text-yellow-700 mb-4">
                You need to be a member of at least one channel to create proposals.
              </p>
              <a 
                href="/channels" 
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                Go to Channels
              </a>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Create New Proposal</h1>
            <p className="text-gray-600">
              Share your idea with the community and gather support
            </p>
          </div>
          
          <ProposalForm channels={userChannels.map((m: any) => m.channel)} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 