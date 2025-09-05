"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Proposal {
  id: string
  title: string
  imageUrl: string | null
  publishAt: Date | null
  expiresAt: Date | null
  threshold: number | null
  createdAt: Date
  channel: {
    name: string
  }
  _count: {
    supports: number
  }
  event: {
    id: string
  } | null
}

interface ProposalsListProps {
  proposals: Proposal[]
}

// Helper function to determine proposal status
const getProposalStatus = (proposal: Proposal) => {
  const now = new Date()
  
  if (proposal.event) {
    return 'reified'
  }
  
  // Check if expired
  if (proposal.expiresAt && proposal.expiresAt < now) {
    return 'expired'
  }
  
  // Check if published
  const isPublished = !proposal.publishAt || proposal.publishAt <= now
  
  if (isPublished) {
    const supportCount = proposal._count.supports
    const threshold = proposal.threshold || 0
    
    if (threshold > 0 && supportCount >= threshold) {
      return 'threshold_met'
    }
    
    return 'published'
  }
  
  return 'draft'
}

const getStatusBadge = (proposal: Proposal) => {
  const status = getProposalStatus(proposal)
  
  switch (status) {
    case 'reified':
      return <Badge className="bg-green-100 text-green-800">Event Created</Badge>
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'expired':
      return <Badge variant="destructive">Expired</Badge>
    case 'threshold_met':
      return <Badge className="bg-orange-100 text-orange-800">Threshold Met</Badge>
    case 'published':
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ProposalsList({ proposals }: ProposalsListProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'supported' | 'expired' | 'drafts'>('all')

  const now = new Date()
  
  const filteredProposals = proposals.filter(proposal => {
    const status = getProposalStatus(proposal)
    
    if (filter === 'all') return true
    if (filter === 'active') return status === 'published'
    if (filter === 'supported') return status === 'threshold_met' || status === 'reified'
    if (filter === 'expired') return status === 'expired'
    if (filter === 'drafts') return status === 'draft'
    return true
  })

  const counts = {
    all: proposals.length,
    active: proposals.filter(p => getProposalStatus(p) === 'published').length,
    supported: proposals.filter(p => {
      const status = getProposalStatus(p)
      return status === 'threshold_met' || status === 'reified'
    }).length,
    expired: proposals.filter(p => getProposalStatus(p) === 'expired').length,
    drafts: proposals.filter(p => getProposalStatus(p) === 'draft').length
  }

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first proposal to coordinate with your community.
          </p>
          <Link href="/proposals/new">
            <Button className="gap-2">
              <Plus size={16} />
              Create Proposal
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Floating create button - mobile only */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <Link href="/proposals/new">
          <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
            <Plus size={24} />
          </Button>
        </Link>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active ({counts.active})
        </Button>
        <Button
          variant={filter === 'supported' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('supported')}
        >
          Supported ({counts.supported})
        </Button>
        <Button
          variant={filter === 'expired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('expired')}
        >
          Expired ({counts.expired})
        </Button>
        <Button
          variant={filter === 'drafts' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('drafts')}
        >
          Drafts ({counts.drafts})
        </Button>
      </div>

      {/* Proposals list */}
      <div className="space-y-3">
        {filteredProposals.map((proposal) => (
          <Link key={proposal.id} href={`/p/${proposal.id}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {proposal.imageUrl ? (
                      <img
                        src={proposal.imageUrl}
                        alt={proposal.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-xl">💡</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {proposal.title}
                      </h3>
                      {getStatusBadge(proposal)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {proposal.channel.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(proposal.createdAt, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    {proposal.threshold && proposal.threshold > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full">
                          <div 
                            className="h-1 bg-orange-500 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (proposal._count.supports / proposal.threshold) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {proposal._count.supports}/{proposal.threshold}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProposals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-gray-500">No proposals match the current filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 