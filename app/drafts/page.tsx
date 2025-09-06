import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default async function DraftsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const now = new Date()

  // Get user's draft and scheduled proposals
  const userProposals = await prisma.proposal.findMany({
    where: {
      ownerId: session.user.id,
      OR: [
        // Drafts (publishAt in far future)
        { publishAt: { gt: new Date('2050-01-01') } },
        // Scheduled (publishAt in future)
        { publishAt: { gt: now } }
      ]
    },
    include: {
      channel: true,
      _count: {
        select: {
          supports: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const drafts = userProposals.filter(p => p.publishAt && p.publishAt > new Date('2050-01-01'))
  const scheduled = userProposals.filter(p => p.publishAt && p.publishAt <= new Date('2050-01-01') && p.publishAt > now)

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">My Drafts & Scheduled</h1>
            <p className="text-gray-600">
              Your unpublished drafts and scheduled proposals
            </p>
          </div>

          {/* Drafts Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Drafts ({drafts.length})</span>
            </h2>
            
            {drafts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No drafts yet. Create a proposal and save it as a draft.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {drafts.map((proposal) => (
                  <Link key={proposal.id} href={`/p/${proposal.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <span>{proposal.title}</span>
                              <Badge variant="secondary">Draft</Badge>
                            </CardTitle>
                            <CardDescription>
                              in {proposal.channel.name} • Created {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-2">{proposal.note}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Scheduled ({scheduled.length})</span>
            </h2>
            
            {scheduled.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No scheduled proposals. Schedule a proposal to publish later.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduled.map((proposal) => (
                  <Link key={proposal.id} href={`/p/${proposal.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center space-x-2">
                              <span>{proposal.title}</span>
                              <Badge variant="outline">
                                Publishes {new Date(proposal.publishAt!).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              in {proposal.channel.name} • Will publish {new Date(proposal.publishAt!).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 line-clamp-2">{proposal.note}</p>
                        {proposal.expiresAt && (
                          <p className="text-sm text-gray-500 mt-2">
                            Expires {new Date(proposal.expiresAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 