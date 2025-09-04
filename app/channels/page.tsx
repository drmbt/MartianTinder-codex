import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ChannelsList } from "@/components/features/channels/channels-list"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default async function ChannelsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const userChannels = await prisma.channelMember.findMany({
    where: { userId: session.user.id },
    include: {
      channel: {
        include: {
          _count: {
            select: {
              members: true,
              proposals: true
            }
          }
        }
      }
    },
  })

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Your Channels</h1>
            <p className="text-gray-600">
              Join channels to see proposals and participate in your community
            </p>
          </div>
          
          <ChannelsList channels={userChannels.map((m) => m.channel)} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 