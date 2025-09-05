import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { TinderFeed } from "@/components/features/feed/tinder-feed"

export default async function FeedPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's channels
  const userChannels = await prisma.channelMember.findMany({
    where: { userId: session.user.id },
    select: { channelId: true }
  })

  const userChannelIds = userChannels.map(m => m.channelId)

  if (userChannelIds.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Feed</h1>
            <p className="text-gray-600">Join some channels to see proposals in your feed.</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // Get proposals user hasn't interacted with yet (true inbox)
  const interactedProposals = await prisma.proposalUserState.findMany({
    where: { userId: session.user.id },
    select: { proposalId: true }
  })

  const supportedProposals = await prisma.supportSignal.findMany({
    where: { userId: session.user.id },
    select: { proposalId: true }
  })

  const interactedProposalIds = [
    ...interactedProposals.map(p => p.proposalId),
    ...supportedProposals.map(p => p.proposalId)
  ]

  const now = new Date()
  
  // Get uninteracted, published, non-expired proposals (FIFO)
  const feedProposals = await prisma.proposal.findMany({
    where: {
      channelId: { in: userChannelIds },
      id: { notIn: interactedProposalIds },
      OR: [
        { publishAt: null },
        { publishAt: { lte: now } }
      ],
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: now } }
          ]
        }
      ]
    },
    include: {
      channel: true,
      owner: true,
      _count: {
        select: {
          supports: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }, // FIFO - oldest first
    take: 20 // Limit for performance
  })

  // Get support stats for each proposal
  const proposalsWithStats = await Promise.all(
    feedProposals.map(async (proposal) => {
      const supportCounts = await prisma.supportSignal.groupBy({
        by: ['type'],
        where: { proposalId: proposal.id },
        _count: true
      })

      const stats = {
        supports: supportCounts.find((s: any) => s.type === 'support')?._count || 0,
        supersupports: supportCounts.find((s: any) => s.type === 'supersupport')?._count || 0,
        opposes: supportCounts.find((s: any) => s.type === 'oppose')?._count || 0,
      }

      return {
        ...proposal,
        supportStats: stats
      }
    })
  )

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">Proposal Feed</h1>
            <p className="text-gray-600">
              Swipe through new proposals from your channels
            </p>
            <div className="text-sm text-gray-500">
              {proposalsWithStats.length} unread proposals
            </div>
          </div>
          
          <TinderFeed proposals={proposalsWithStats} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 