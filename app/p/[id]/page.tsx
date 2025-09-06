import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MessageSquare, ExternalLink } from "lucide-react"
import { SupportButtons } from "@/components/features/proposals/support-buttons"
import { ProposalActions } from "@/components/features/proposals/proposal-actions"
import { ImageGallery } from "@/components/ui/image-gallery"
import { SupportType, SupportVisibility } from "@/types"
import Link from "next/link"

interface ProposalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      channel: true,
      owner: true,
      supports: {
        include: {
          user: true
        }
      },
      event: true,
      images: {
        orderBy: {
          order: 'asc'
        }
      },
      _count: {
        select: {
          supports: true
        }
      }
    },
  })

  // Get support counts and user's current signal
  const [supportCounts, userSignal] = await Promise.all([
    prisma.supportSignal.groupBy({
      by: ['type'],
      where: { proposalId: id },
      _count: true
    }),
    prisma.supportSignal.findUnique({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId: id,
        },
      },
    })
  ])

  const supportStats = {
    supports: supportCounts.find((s) => s.type === 'support')?._count || 0,
    supersupports: supportCounts.find((s) => s.type === 'supersupport')?._count || 0,
    opposes: supportCounts.find((s) => s.type === 'oppose')?._count || 0,
  }

  if (!proposal) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
            <Link href="/channels">
              <Button>Back to Channels</Button>
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // Check if user is member of the channel
  const membership = await prisma.channelMember.findUnique({
    where: {
      userId_channelId: {
        userId: session.user.id,
        channelId: proposal.channelId,
      },
    },
  })

  if (!membership) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You must be a member of this channel to view this proposal.</p>
            <Link href="/channels">
              <Button>Back to Channels</Button>
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  const isExpired = proposal.expiresAt && proposal.expiresAt < new Date()
  const isPublished = !proposal.publishAt || proposal.publishAt <= new Date()
  const totalSupports = supportStats.supports + supportStats.supersupports
  const threshold = proposal.threshold || 0

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
                     <div className="flex items-center justify-between">
             <Link href={`/c/${proposal.channelId}`} className="text-sm text-gray-500 hover:text-gray-700">
               ← Back to {proposal.channel.name}
             </Link>
             <div className="flex items-center space-x-2">
               <Badge variant={isPublished ? (isExpired ? "destructive" : "default") : "secondary"}>
                 {isExpired ? "Expired" : isPublished ? "Published" : "Draft"}
               </Badge>
               {proposal.event && (
                 <Badge variant="outline" className="bg-green-50">
                   Event Created
                 </Badge>
               )}
               <ProposalActions
                 proposalId={proposal.id}
                 isOwner={proposal.ownerId === session.user.id}
                 hasEvent={!!proposal.event}
                 title={proposal.title}
               />
             </div>
           </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              {(proposal.images?.length > 0 || proposal.imageUrl) && (
                <Card>
                  <CardContent className="p-0">
                    <ImageGallery 
                      images={
                        proposal.images && proposal.images.length > 0 
                          ? proposal.images.map((img) => img.url)
                          : proposal.imageUrl ? [proposal.imageUrl] : []
                      }
                      alt={proposal.title}
                      className="w-full h-64 sm:h-80 md:h-96"
                    />
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                    <CardDescription>
                      by {proposal.owner.name || proposal.owner.email} in {proposal.channel.name}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{proposal.note}</p>
                    </div>
                    
                    {proposal.externalChatUrl && (
                      <div className="flex items-center space-x-2 p-3 status-info border-info rounded-lg">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm font-medium">External Chat:</span>
                        <a 
                          href={proposal.externalChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center space-x-1"
                        >
                          <span>Join Discussion</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Event Details (if reified) */}
              {proposal.event && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5" />
                      <span>Event Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">When:</span> {new Date(proposal.event.startAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {proposal.event.endAt && (
                        <div>
                          <span className="font-medium">Until:</span> {new Date(proposal.event.endAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {proposal.event.location && (
                        <div>
                          <span className="font-medium">Where:</span> {proposal.event.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Support Meter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{totalSupports} / {threshold || "∞"}</span>
                      </div>
                      <div className="w-full progress-bar h-2">
                        <div 
                          className="progress-fill-success h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: threshold > 0 ? `${Math.min(100, (totalSupports / threshold) * 100)}%` : '0%' 
                          }}
                        />
                      </div>
                    </div>
                    
                                         <div className="grid grid-cols-3 gap-2 text-center">
                       <div className="space-y-1">
                         <div className="text-2xl font-bold text-green-600">{supportStats.supports}</div>
                         <div className="text-xs text-gray-500">Support</div>
                       </div>
                       <div className="space-y-1">
                         <div className="text-2xl font-bold text-blue-600">{supportStats.supersupports}</div>
                         <div className="text-xs text-gray-500">Super</div>
                       </div>
                       <div className="space-y-1">
                         <div className="text-2xl font-bold text-red-600">{supportStats.opposes}</div>
                         <div className="text-xs text-gray-500">Oppose</div>
                       </div>
                     </div>

                    <SupportButtons
                      proposalId={id}
                      currentSignal={userSignal ? {
                        type: userSignal.type as SupportType,
                        visibility: userSignal.visibility as SupportVisibility
                      } : null}
                      stats={supportStats}
                      threshold={threshold}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proposal.minCapacity && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Min Capacity:</span>
                      <span className="text-sm">{proposal.minCapacity}</span>
                    </div>
                  )}
                  {proposal.maxCapacity && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Max Capacity:</span>
                      <span className="text-sm">{proposal.maxCapacity}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Threshold:</span>
                    <span className="text-sm">{proposal.threshold || 0}</span>
                  </div>
                  {proposal.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Expires:</span>
                      <span className="text-sm">{new Date(proposal.expiresAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm">{new Date(proposal.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 