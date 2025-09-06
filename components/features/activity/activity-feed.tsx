"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star, ThumbsDown, X, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface SupportSignal {
  id: string
  type: string
  createdAt: Date
  proposal: {
    id: string
    title: string
    imageUrl: string | null
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
    imageUrl: string | null
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
    imageUrl: string | null
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

const getActionIcon = (type: string) => {
  switch (type) {
    case 'support':
      return <Heart size={16} className="text-green-600 dark:text-green-400" />
    case 'supersupport':
      return <Star size={16} className="text-yellow-500 dark:text-yellow-400" />
    case 'oppose':
      return <ThumbsDown size={16} className="text-red-600 dark:text-red-400" />
    case 'dismissed':
      return <X size={16} className="text-muted-foreground" />
    case 'starred':
      return <Star size={16} className="text-blue-600 dark:text-blue-400" />
    case 'skipped':
      return <Eye size={16} className="text-muted-foreground" />
    default:
      return <Eye size={16} className="text-muted-foreground" />
  }
}

const getActionLabel = (type: string) => {
  switch (type) {
    case 'support':
      return 'Supported'
    case 'supersupport':
      return 'Super Supported'
    case 'oppose':
      return 'Opposed'
    case 'dismissed':
      return 'Dismissed'
    case 'starred':
      return 'Starred'
    case 'skipped':
      return 'Skipped'
    default:
      return 'Interacted'
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
        {filteredActivities.map((activity) => (
          <Link key={activity.id} href={`/p/${activity.proposal.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {activity.proposal.imageUrl ? (
                      <img
                        src={activity.proposal.imageUrl}
                        alt={activity.proposal.title}
                        className="w-full h-full object-cover rounded-lg max-w-full"
                      />
                    ) : (
                      <div className="text-muted-foreground text-xl">📋</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {activity.proposal.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {getActionIcon(activity.type)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {getActionLabel(activity.type)} • {activity.proposal.channel.name}
                      </span>
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 progress-bar">
                        <div 
                          className="h-1 progress-fill"
                          style={{ width: `${Math.min(100, (activity.proposal._count.supports / 5) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activity.proposal._count.supports}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 