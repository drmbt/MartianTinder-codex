"use client"

import { useState, useEffect } from "react"
import { TinderFeed } from "./tinder-feed"
import { FeedFilters, type FeedFilters as FeedFiltersType } from "./feed-filters"
import { TinderCardSkeleton } from "@/components/ui/proposal-skeleton"

interface FeedClientProps {
  userId: string
}

export function FeedClient({ userId }: FeedClientProps) {
  const [proposals, setProposals] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FeedFiltersType>({
    recency: 'all',
    threshold: 'all',
    showExpired: false
  })

  useEffect(() => {
    fetchFeedData()
  }, [userId])

  const fetchFeedData = async () => {
    try {
      const response = await fetch('/api/feed')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setProposals(result.data.proposals || [])
          setChannels(result.data.channels || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch feed data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FeedFiltersType) => {
    setFilters(newFilters)
    // TODO: Implement actual filtering logic
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">Feed</h1>
            <p className="text-gray-600">Loading proposals...</p>
          </div>
          <TinderCardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-gray-600">
            Discover new proposals from your channels
          </p>
          <div className="text-sm text-gray-500">
            {proposals.length} unread proposals
          </div>
        </div>
        
        <FeedFilters 
          channels={channels}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
        
        <TinderFeed proposals={proposals} />
      </div>
    </div>
  )
} 