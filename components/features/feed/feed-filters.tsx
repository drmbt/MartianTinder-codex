"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Clock, Target } from "lucide-react"

interface FeedFiltersProps {
  onFilterChange: (filters: FeedFilters) => void
  channels: Array<{ id: string; name: string }>
  initialFilters?: FeedFilters
}

export interface FeedFilters {
  channel?: string
  recency: 'all' | '24h' | '7d' | '30d'
  threshold: 'all' | 'low' | 'high' | 'met'
  showExpired: boolean
}

export function FeedFilters({ onFilterChange, channels, initialFilters }: FeedFiltersProps) {
  const [filters, setFilters] = useState<FeedFilters>(initialFilters || {
    recency: 'all',
    threshold: 'all',
    showExpired: false
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (newFilters: Partial<FeedFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const resetFilters = () => {
    const defaultFilters: FeedFilters = {
      recency: 'all',
      threshold: 'all',
      showExpired: false
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.channel || 
                          filters.recency !== 'all' || 
                          filters.threshold !== 'all' || 
                          filters.showExpired

  return (
    <Card className="p-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="font-medium text-sm">Discovery Settings</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Filtered
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Channel Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Channel
              </label>
              <Select 
                value={filters.channel || 'all'} 
                onValueChange={(value) => updateFilters({ channel: value === 'all' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All channels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  {channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recency Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                <Clock size={14} />
                Recency
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All time' },
                  { value: '24h', label: 'Last 24h' },
                  { value: '7d', label: 'Last week' },
                  { value: '30d', label: 'Last month' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={filters.recency === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ recency: option.value as FeedFilters['recency'] })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Threshold Status Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
                <Target size={14} />
                Threshold Status
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All proposals' },
                  { value: 'low', label: 'Needs support' },
                  { value: 'high', label: 'Close to goal' },
                  { value: 'met', label: 'Goal reached' }
                ].map(option => (
                  <Button
                    key={option.value}
                    variant={filters.threshold === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ threshold: option.value as FeedFilters['threshold'] })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Show Expired Toggle */}
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.showExpired}
                  onChange={(e) => updateFilters({ showExpired: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Include expired proposals
              </label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 