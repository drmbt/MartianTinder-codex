"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FeedFilter } from "@/types"

interface FeedFilterProps {
  currentFilter: FeedFilter
  onFilterChange: (filter: FeedFilter) => void
  counts?: {
    all: number
    active: number
    supported: number
    starred: number
    expired: number
  }
}

export function FeedFilterComponent({ currentFilter, onFilterChange, counts }: FeedFilterProps) {
  const filters: { key: FeedFilter; label: string; description: string }[] = [
    { key: 'all', label: 'All', description: 'All active proposals' },
    { key: 'active', label: 'Active', description: 'Currently accepting signals' },
    { key: 'supported', label: 'Supported', description: 'Proposals you support' },
    { key: 'starred', label: 'Starred', description: 'Your starred proposals' },
    { key: 'expired', label: 'Expired', description: 'Past proposals' },
  ]

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={currentFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className="whitespace-nowrap flex items-center space-x-1"
        >
          <span>{filter.label}</span>
          {counts?.[filter.key] !== undefined && (
            <Badge variant="secondary" className="ml-1">
              {counts[filter.key]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  )
} 