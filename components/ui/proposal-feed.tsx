"use client"

import { useState, useEffect, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProposalCard } from "@/components/ui/proposal-card"
import { ProposalListSkeleton } from "@/components/ui/proposal-skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"

export interface ProposalData {
  id: string
  title: string
  note: string
  createdAt: string | Date
  expiresAt?: string | Date | null
  publishAt?: Date | null
  threshold?: number | null
  imageUrl?: string | null
  images?: Array<{ url: string; order: number }>
  externalChatUrl?: string | null
  suggestedEventDate?: string | null
  owner: {
    name: string | null
    email: string
  }
  ownerId?: string
  userSupport?: string | null
  _count?: {
    supports: number
  }
  supportStats?: {
    supports: number
    supersupports: number
    opposes: number
  }
  channel?: {
    name: string
  }
  event?: {
    id: string
  } | null
}

interface FilterOption {
  key: string
  label: string
  count?: number
  filter: (proposal: ProposalData) => boolean
}

interface ProposalFeedProps {
  proposals: ProposalData[]
  userId?: string
  variant?: 'default' | 'compact' | 'mini'
  showChannel?: boolean
  showProgress?: boolean
  filters?: FilterOption[]
  emptyState?: {
    icon?: string
    title: string
    description: string
    action?: ReactNode
  }
  header?: ReactNode
  floatingAction?: ReactNode
  loadingDelay?: number
}

export function ProposalFeed({
  proposals,
  userId,
  variant = 'compact',
  showChannel = false,
  showProgress = false,
  filters = [],
  emptyState,
  header,
  floatingAction,
  loadingDelay = 300
}: ProposalFeedProps) {
  const [currentFilter, setCurrentFilter] = useState(filters[0]?.key || 'all')
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading state on filter change
  useEffect(() => {
    if (loadingDelay > 0) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), loadingDelay)
      return () => clearTimeout(timer)
    }
  }, [currentFilter, loadingDelay])

  // Filter proposals based on current filter
  const activeFilter = filters.find(f => f.key === currentFilter)
  const filteredProposals = activeFilter 
    ? proposals.filter(activeFilter.filter)
    : proposals

  // Default empty state
  const defaultEmptyState = emptyState || {
    icon: '📝',
    title: 'No proposals found',
    description: 'No proposals match the current criteria.',
    action: (
      <Link href="/proposals/new">
        <Button className="gap-2">
          <Plus size={16} />
          Create Proposal
        </Button>
      </Link>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {header}

      {/* Floating Action Button */}
      {floatingAction}

      {/* Filter buttons */}
      {filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={currentFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFilter(filter.key)}
              className="whitespace-nowrap"
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="ml-1">({filter.count})</span>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Proposals Feed */}
      {isLoading ? (
        <ProposalListSkeleton count={3} />
      ) : filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">{defaultEmptyState.icon}</div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {defaultEmptyState.title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {defaultEmptyState.description}
            </p>
            {defaultEmptyState.action}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              userId={userId}
              variant={variant}
              showChannel={showChannel}
              showProgress={showProgress}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Pre-built filter functions for common use cases
export const commonFilters = {
  all: () => true,
  
  active: (proposal: ProposalData) => {
    const now = new Date()
    const expiresAt = proposal.expiresAt ? new Date(proposal.expiresAt) : null
    return !expiresAt || expiresAt > now
  },
  
  expired: (proposal: ProposalData) => {
    const now = new Date()
    const expiresAt = proposal.expiresAt ? new Date(proposal.expiresAt) : null
    return !!expiresAt && expiresAt < now
  },
  
  published: (proposal: ProposalData) => {
    const now = new Date()
    const publishAt = proposal.publishAt ? new Date(proposal.publishAt) : null
    return !publishAt || publishAt <= now
  },
  
  draft: (proposal: ProposalData) => {
    const now = new Date()
    const publishAt = proposal.publishAt ? new Date(proposal.publishAt) : null
    return !!publishAt && publishAt > now
  },
  
  supported: (proposal: ProposalData) => {
    return proposal.userSupport === 'support' || proposal.userSupport === 'supersupport'
  },
  
  opposed: (proposal: ProposalData) => {
    return proposal.userSupport === 'oppose'
  },
  
  thresholdMet: (proposal: ProposalData) => {
    const threshold = proposal.threshold || 0
    const totalSupport = proposal.supportStats 
      ? proposal.supportStats.supports + proposal.supportStats.supersupports
      : proposal._count?.supports || 0
    return threshold > 0 && totalSupport >= threshold
  },
  
  reified: (proposal: ProposalData) => {
    return !!proposal.event
  }
}

// Helper to create filter options with counts
export function createFilterOptions(
  proposals: ProposalData[],
  filterConfigs: Array<{
    key: string
    label: string
    filter: (proposal: ProposalData) => boolean
  }>
): FilterOption[] {
  return filterConfigs.map(config => ({
    ...config,
    count: proposals.filter(config.filter).length
  }))
}