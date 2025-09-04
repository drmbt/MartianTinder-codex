import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Heart, Star } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's supported proposals
  const supportedProposals = await prisma.supportSignal.findMany({
    where: { 
      userId: session.user.id,
      type: { in: ["support", "supersupport"] }
    },
    include: {
      proposal: {
        include: {
          channel: true,
          event: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Get user's starred proposals
  const starredProposals = await prisma.proposalUserState.findMany({
    where: { 
      userId: session.user.id,
      state: "starred"
    },
    include: {
      proposal: {
        include: {
          channel: true,
          event: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  // Get upcoming events
  const upcomingEvents = supportedProposals
    .filter(s => s.proposal.event && s.proposal.event.startAt > new Date())
    .map(s => s.proposal.event!)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Your commitments, events, and starred proposals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Upcoming Events</span>
                </CardTitle>
                <CardDescription>
                  Events from your supported proposals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming events</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="text-sm">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-gray-500">
                          {new Date(event.startAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {upcomingEvents.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{upcomingEvents.length - 3} more events
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supported Proposals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Your Support</span>
                </CardTitle>
                                 <CardDescription>
                   Proposals you&apos;ve supported
                 </CardDescription>
              </CardHeader>
              <CardContent>
                {supportedProposals.length === 0 ? (
                  <p className="text-sm text-gray-500">No supported proposals</p>
                ) : (
                  <div className="space-y-2">
                    {supportedProposals.slice(0, 3).map((support) => (
                      <div key={support.id} className="text-sm">
                        <div className="font-medium">{support.proposal.title}</div>
                        <div className="text-gray-500">
                          in {support.proposal.channel.name}
                        </div>
                      </div>
                    ))}
                    {supportedProposals.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{supportedProposals.length - 3} more proposals
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Starred Proposals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Starred</span>
                </CardTitle>
                                 <CardDescription>
                   Proposals you&apos;ve starred
                 </CardDescription>
              </CardHeader>
              <CardContent>
                {starredProposals.length === 0 ? (
                  <p className="text-sm text-gray-500">No starred proposals</p>
                ) : (
                  <div className="space-y-2">
                    {starredProposals.slice(0, 3).map((starred) => (
                      <div key={starred.id} className="text-sm">
                        <div className="font-medium">{starred.proposal.title}</div>
                        <div className="text-gray-500">
                          in {starred.proposal.channel.name}
                        </div>
                      </div>
                    ))}
                    {starredProposals.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{starredProposals.length - 3} more proposals
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 