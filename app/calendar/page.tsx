import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { CalendarView } from "@/components/features/calendar/calendar-view"

export default async function CalendarPage() {
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

  // Get proposals with suggested event dates from user's channels
  const now = new Date()
  const proposalsWithDates = await prisma.proposal.findMany({
    where: {
      channelId: { in: userChannelIds },
      OR: [
        { publishAt: null },
        { publishAt: { lte: now } }
      ],
      suggestedEventDate: { not: null }
    },
    include: {
      channel: true,
      owner: true,
      event: true,
      _count: {
        select: {
          supports: true
        }
      }
    }
  })

  // Get events from proposals user has supported
  const supportedProposals = await prisma.supportSignal.findMany({
    where: { 
      userId: session.user.id,
      type: { in: ["support", "supersupport"] }
    },
    include: {
      proposal: {
        include: {
          event: true,
          channel: true
        }
      }
    }
  })

  const events = supportedProposals
    .filter(s => s.proposal.event)
    .map(s => s.proposal.event!)

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-gray-600 text-sm">
              View proposals with event times and confirmed events
            </p>
          </div>
          
          <CalendarView 
            proposals={proposalsWithDates}
            events={events}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 