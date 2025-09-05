"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FeedFilterComponent } from "./feed-filter"
import { FeedFilter } from "@/types"
import Link from "next/link"

interface ProposalData {
  id: string
  title: string
  note: string
  createdAt: string
  expiresAt: string | null
  threshold: number | null
  owner: {
    name: string | null
    email: string
  }
  _count: {
    supports: number
  }
}

interface ChannelFeedClientProps {
  proposals: ProposalData[]
  channelId: string
}

export function ChannelFeedClient({ proposals, channelId }: ChannelFeedClientProps) {
  const [currentFilter, setCurrentFilter] = useState<FeedFilter>('all')
  
  // For now, we'll do client-side filtering
  // In production, this should use the feed API with URL params
  const filteredProposals = proposals.filter(proposal => {
    if (currentFilter === 'all') return true
    if (currentFilter === 'active') {
      return !proposal.expiresAt || new Date(proposal.expiresAt) > new Date()
    }
    if (currentFilter === 'expired') {
      return proposal.expiresAt && new Date(proposal.expiresAt) < new Date()
    }
    // TODO: Implement supported/starred filtering with user data
    return true
  })

  return (
    <div className="space-y-4">
      {/* Feed Filters */}
      <FeedFilterComponent
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        counts={{
          all: proposals.length,
          active: proposals.filter(p => !p.expiresAt || new Date(p.expiresAt) > new Date()).length,
          supported: 0, // TODO: Calculate from user support data
          starred: 0, // TODO: Calculate from user state data
          expired: proposals.filter(p => p.expiresAt && new Date(p.expiresAt) < new Date()).length,
        }}
      />

      {/* Proposals Feed */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No proposals in {currentFilter} view
            </h3>
            <p className="text-gray-500 mb-4">
              {currentFilter === 'all' ? 'Be the first to share an idea with this channel' : `No ${currentFilter} proposals found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredProposals.map((proposal) => (
          <Link key={proposal.id} href={`/p/${proposal.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <CardDescription>
                      by {proposal.owner.name || proposal.owner.email}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {proposal._count.supports} support
                    </Badge>
                    {proposal.threshold === 0 && (
                      <Badge variant="secondary">Announcement</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{proposal.note}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                  {proposal.expiresAt && (
                    <span>
                      Expires {new Date(proposal.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
} 