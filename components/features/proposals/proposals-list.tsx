"use client"

import { ProposalFeed, createFilterOptions, commonFilters } from "@/components/ui/proposal-feed"
import type { ProposalData } from "@/components/ui/proposal-feed"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface ProposalsListProps {
  proposals: ProposalData[]
}

export function ProposalsList({ proposals }: ProposalsListProps) {
  // Custom filter for threshold met
  const thresholdMetFilter = (proposal: ProposalData) => {
    const threshold = proposal.threshold || 0
    const totalSupport = proposal._count?.supports || 0
    return threshold > 0 && totalSupport >= threshold && !proposal.event
  }

  // Create filter options with counts
  const filterOptions = createFilterOptions(proposals, [
    { key: 'all', label: 'All', filter: commonFilters.all },
    { key: 'active', label: 'Active', filter: commonFilters.active },
    { key: 'supported', label: 'Supported', filter: thresholdMetFilter },
    { key: 'expired', label: 'Expired', filter: commonFilters.expired },
    { key: 'drafts', label: 'Drafts', filter: commonFilters.draft },
  ])

  // Floating action button for mobile
  const floatingAction = (
    <div className="fixed bottom-20 right-4 md:hidden z-40">
      <Link href="/proposals/new">
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg">
          <Plus size={24} />
        </Button>
      </Link>
    </div>
  )

  return (
    <ProposalFeed
      proposals={proposals}
      variant="compact"
      showChannel={true}
      showProgress={true}
      filters={filterOptions}
      floatingAction={floatingAction}
      emptyState={{
        icon: '💡',
        title: 'No proposals yet',
        description: 'Start by creating your first proposal to coordinate with your community.',
        action: (
          <Link href="/proposals/new">
            <Button className="gap-2">
              <Plus size={16} />
              Create Proposal
            </Button>
          </Link>
        )
      }}
    />
  )
}