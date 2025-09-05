import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import Link from "next/link"

export default async function ExpiredProposalsPage() {
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
            <h1 className="text-3xl font-bold mb-4">Expired Proposals</h1>
            <p className="text-gray-600">Join some channels to see expired proposals.</p>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // Get expired proposals from user's channels
  const expiredProposals = await prisma.proposal.findMany({
    where: {
      channelId: { in: userChannelIds },
      expiresAt: { lt: new Date() },
      OR: [
        { publishAt: null },
        { publishAt: { lte: new Date() } }
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
    orderBy: { expiresAt: 'desc' }
  })

  // Get support stats for each proposal
  const proposalsWithStats = await Promise.all(
    expiredProposals.map(async (proposal) => {
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

      const totalSupport = stats.supports + stats.supersupports
      const threshold = proposal.threshold || 0
      const metThreshold = threshold > 0 && totalSupport >= threshold

      return {
        ...proposal,
        supportStats: stats,
        totalSupport,
        metThreshold
      }
    })
  )

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Expired Proposals</h1>
            <p className="text-gray-600">
              Proposals that have passed their expiration date
            </p>
          </div>

          {proposalsWithStats.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expired proposals</h3>
                <p className="text-gray-500">
                  Expired proposals will appear here when their time limit is reached.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {proposalsWithStats.map((proposal) => (
                <Link key={proposal.id} href={`/p/${proposal.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{proposal.title}</span>
                            <Badge variant="destructive">Expired</Badge>
                          </CardTitle>
                          <CardDescription>
                            by {proposal.owner.name || proposal.owner.email} in {proposal.channel.name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={proposal.metThreshold ? "default" : "outline"}>
                            {proposal.totalSupport} support
                          </Badge>
                          {proposal.metThreshold && (
                            <Badge variant="outline" className="bg-green-50">
                              Threshold Met
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2">{proposal.note}</p>
                      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                        <span>Created {new Date(proposal.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Expired {new Date(proposal.expiresAt!).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {proposal.metThreshold && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <div className="text-yellow-800 font-medium">
                            ⚠️ This proposal met its threshold but expired before being reified
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 