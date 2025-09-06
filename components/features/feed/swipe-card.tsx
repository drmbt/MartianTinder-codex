"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageGallery } from "@/components/ui/image-gallery"
import Link from "next/link"

interface ProposalData {
  id: string
  title: string
  note: string
  threshold: number | null
  createdAt: Date
  expiresAt: Date | null
  imageUrl: string | null
  images?: Array<{ url: string; order: number }>
  externalChatUrl: string | null
  suggestedEventDate: string | null
  channel: {
    name: string
  }
  owner: {
    name: string | null
    email: string
  }
  supportStats: {
    supports: number
    supersupports: number
    opposes: number
  }
}

interface SwipeCardProps {
  proposal: ProposalData
  isAnimating?: boolean
  className?: string
}

export function SwipeCard({ proposal, isAnimating = false, className = "" }: SwipeCardProps) {
  const totalSupport = proposal.supportStats.supports + proposal.supportStats.supersupports
  const threshold = proposal.threshold || 0

  return (
    <Card className={`transition-all duration-300 ${
      isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
    } ${className}`}>
      {/* Image Gallery */}
      {(proposal.images?.length || proposal.imageUrl) && (
        <div className="relative w-full">
          <ImageGallery 
            images={
              proposal.images && proposal.images.length > 0 
                ? proposal.images.sort((a, b) => a.order - b.order).map(img => img.url)
                : proposal.imageUrl ? [proposal.imageUrl] : []
            }
            className="w-full h-64 sm:h-80 md:h-96"
            alt={proposal.title}
          />
        </div>
      )}
      
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-xl">{proposal.title}</CardTitle>
          <CardDescription>
            by {proposal.owner.name || proposal.owner.email} in {proposal.channel.name}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-foreground">{proposal.note}</p>
        </div>

        {/* Suggested Event Date */}
        {proposal.suggestedEventDate && (
          <div className="p-3 status-info border-info rounded-lg">
            <div className="text-sm">
              <span className="font-medium">📅 Suggested timing:</span>
              <span className="ml-1">{proposal.suggestedEventDate}</span>
            </div>
          </div>
        )}

        {/* Support Stats */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Support:</span> {totalSupport}
            {threshold > 0 && <span> / {threshold} needed</span>}
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              💚 {proposal.supportStats.supports}
            </Badge>
            <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
              ⭐ {proposal.supportStats.supersupports}
            </Badge>
            <Badge variant="outline" className="text-red-600 dark:text-red-400">
              👎 {proposal.supportStats.opposes}
            </Badge>
          </div>
        </div>

        {/* External Chat */}
        {proposal.externalChatUrl && (
          <div className="p-3 status-info border-info rounded-lg">
            <a 
              href={proposal.externalChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline"
            >
              💬 Join Discussion →
            </a>
          </div>
        )}

        {/* Expiration */}
        {proposal.expiresAt && (
          <div className="text-xs text-muted-foreground text-center">
            Expires {new Date(proposal.expiresAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
        
        {/* View Details Link */}
        <div className="text-center pt-2">
          <Link href={`/p/${proposal.id}`} className="text-sm text-primary hover:underline">
            View Full Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}