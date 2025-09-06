import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ActivityFeed } from "@/components/features/activity/activity-feed"

export default async function ActivityPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get user's support signals (interactions) with images
  const supportSignals = await prisma.supportSignal.findMany({
    where: { userId: session.user.id },
    include: {
      proposal: {
        include: {
          channel: true,
          owner: true,
          images: {
            select: {
              url: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              supports: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Get user's other interactions (skip/dismiss/star) with images
  const userStates = await prisma.proposalUserState.findMany({
    where: { userId: session.user.id },
    include: {
      proposal: {
        include: {
          channel: true,
          owner: true,
          images: {
            select: {
              url: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              supports: true
            }
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Activity</h1>
            <p className="text-gray-600 text-sm">
              Your interaction history with proposals
            </p>
          </div>
          
          <ActivityFeed 
            supportSignals={supportSignals}
            userStates={userStates}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 