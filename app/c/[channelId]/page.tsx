import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MessageSquare, Plus } from "lucide-react"
import { ChannelFeedClient } from "@/components/features/channels/channel-feed-client"
import Link from "next/link"

interface ChannelPageProps {
  params: {
    channelId: string
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { channelId } = await params

  // Check if user is member of the channel
  const membership = await prisma.channelMember.findUnique({
    where: {
      userId_channelId: {
        userId: session.user.id,
        channelId,
      },
    },
  })

  if (!membership) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You must be a member of this channel to view proposals.</p>
            <Link href="/channels">
              <Button>Back to Channels</Button>
            </Link>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      proposals: {
        include: {
          owner: true,
          _count: {
            select: {
              supports: {
                where: { type: { in: ["support", "supersupport"] } }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: {
          members: true,
          proposals: true
        }
      }
    },
  })

  if (!channel) {
    redirect("/channels")
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Channel Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{channel.name}</h1>
              {channel.description && (
                <p className="text-gray-600">{channel.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{channel._count.members} members</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{channel._count.proposals} proposals</span>
                </span>
              </div>
            </div>
            <Link href="/proposals/new">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Proposal</span>
              </Button>
            </Link>
          </div>

                                {/* Proposals Feed with Client-side Filtering */}
           <ChannelFeedClient 
             proposals={channel.proposals.map(p => ({
               id: p.id,
               title: p.title,
               note: p.note,
               createdAt: p.createdAt.toISOString(),
               expiresAt: p.expiresAt?.toISOString() || null,
               threshold: p.threshold,
               owner: p.owner,
               _count: p._count
             }))}
             channelId={channelId}
           />
           
           {/* Fallback for empty channel */}
           {channel.proposals.length === 0 && (
             <Card>
               <CardContent className="text-center py-12">
                 <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                 <p className="text-gray-500 mb-4">
                   Be the first to share an idea with this channel
                 </p>
                 <Link href="/proposals/new">
                   <Button>Create First Proposal</Button>
                 </Link>
               </CardContent>
             </Card>
           )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 