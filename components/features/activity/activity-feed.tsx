"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProposalCard } from "@/components/ui/proposal-card"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface SupportSignal {
  id: string
  type: string
  createdAt: Date
  proposal: {
    id: string
    title: string
    note: string
    imageUrl: string | null
    images?: Array<{ url: string; order: number }>
    threshold?: number | null
    channel: {
      name: string
    }
    owner: {
      name: string | null
      email: string
    }
    _count: {
      supports: number
    }
  }
}

interface UserState {
  id: string
  state: string
  updatedAt: Date
  proposal: {
    id: string
    title: string
    note: string
    imageUrl: string | null
    images?: Array<{ url: string; order: number }>
    threshold?: number | null
    channel: {
      name: string
    }
    owner: {
      name: string | null
      email: string
    }
    _count: {
      supports: number
    }
  }
}

interface ActivityFeedProps {
  supportSignals: SupportSignal[]
  userStates: UserState[]
}

type ActivityItem = {
  id: string
  type: 'support' | 'supersupport' | 'oppose' | 'dismissed' | 'starred' | 'skipped'
  timestamp: Date
  proposal: {
    id: string
    title: string
    note: string
    imageUrl: string | null
    images?: Array<{ url: string; order: number }>
    threshold?: number | null
    channel: {
      name: string
    }
    owner: {
      name: string | null
      email: string
    }
    _count: {
      supports: number
    }
  }
}

export function ActivityFeed({ supportSignals, userStates }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'supported' | 'opposed' | 'dismissed'>('all')

  // Combine and sort all activities
  const allActivities: ActivityItem[] = [
    ...supportSignals.map(signal => ({
      id: signal.id,
      type: signal.type as ActivityItem['type'],
      timestamp: signal.createdAt,
      proposal: signal.proposal
    })),
    ...userStates.map(state => ({
      id: state.id,
      type: state.state as ActivityItem['type'],
      timestamp: state.updatedAt,
      proposal: state.proposal
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Filter activities
  const filteredActivities = allActivities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'supported') return ['support', 'supersupport'].includes(activity.type)
    if (filter === 'opposed') return activity.type === 'oppose'
    if (filter === 'dismissed') return activity.type === 'dismissed'
    return true
  })

  if (allActivities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-foreground mb-2">No activity yet</h3>
          <p className="text-muted-foreground mb-6">
            Start exploring proposals in your feed to see your activity here.
          </p>
          <Link href="/feed">
            <Button>Explore Feed</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({allActivities.length})
        </Button>
        <Button
          variant={filter === 'supported' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('supported')}
        >
          Supported ({allActivities.filter(a => ['support', 'supersupport'].includes(a.type)).length})
        </Button>
        <Button
          variant={filter === 'opposed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('opposed')}
        >
          Opposed ({allActivities.filter(a => a.type === 'oppose').length})
        </Button>
        <Button
          variant={filter === 'dismissed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('dismissed')}
        >
          Dismissed ({allActivities.filter(a => a.type === 'dismissed').length})
        </Button>
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => {
          // Map activity type to userSupport format for the proposal card
          const proposalWithSupport = {
            ...activity.proposal,
            userSupport: ['support', 'supersupport', 'oppose'].includes(activity.type) 
              ? activity.type 
              : null,
            createdAt: activity.timestamp // Use activity timestamp for sorting
          }
          
          return (
            <div key={activity.id} className="relative">
              {/* Activity timestamp badge */}
              <div className="absolute -top-2 right-2 z-10">
                <span className="text-xs text-muted-foreground bg-background px-2">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>
              
              <ProposalCard
                proposal={proposalWithSupport}
                variant="compact"
                showChannel={true}
                showProgress={true}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
} 