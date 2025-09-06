"use client"

import { ProposalFeed, createFilterOptions, commonFilters } from "@/components/ui/proposal-feed"
import type { ProposalData } from "@/components/ui/proposal-feed"

interface ChannelFeedClientProps {
  proposals: ProposalData[]
  channelId: string
  userId?: string
}

export function ChannelFeedClient({ proposals, channelId, userId }: ChannelFeedClientProps) {
  // Create filter options with counts
  const filterOptions = createFilterOptions(proposals, [
    { key: 'all', label: 'All', filter: commonFilters.all },
    { key: 'active', label: 'Active', filter: commonFilters.active },
    { key: 'expired', label: 'Expired', filter: commonFilters.expired },
    { key: 'supported', label: 'Supported', filter: commonFilters.supported },
  ])

  return (
    <ProposalFeed
      proposals={proposals}
      userId={userId}
      variant="compact"
      showChannel={false}
      showProgress={false}
      filters={filterOptions}
      emptyState={{
        icon: '📝',
        title: 'No proposals found',
        description: channelId ? 'Be the first to share an idea with this channel' : 'No proposals match the current filter'
      }}
    />
  )
} 