"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ThumbsDown, User, Calendar, MessageCircle } from "lucide-react"
import Link from "next/link"

interface ProposalCardProps {
  proposal: {
    id: string
    title: string
    note: string
    createdAt: string | Date
    expiresAt?: string | Date | null
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
  }
  userId?: string
  variant?: 'default' | 'mini' | 'compact'
  showChannel?: boolean
  showProgress?: boolean
}

export function ProposalCard({ 
  proposal, 
  userId, 
  variant = 'default',
  showChannel = false,
  showProgress = false
}: ProposalCardProps) {
  const isOwner = userId && proposal.ownerId === userId
  const hasImage = proposal.images?.length || proposal.imageUrl
  const firstImage = proposal.images?.[0]?.url || proposal.imageUrl
  
  // Calculate support stats
  const totalSupport = proposal.supportStats 
    ? proposal.supportStats.supports + proposal.supportStats.supersupports
    : proposal._count?.supports || 0
  
  const threshold = proposal.threshold || 0
  const progressPercentage = threshold > 0 ? Math.min(100, (totalSupport / threshold) * 100) : 0

  // Mobile-optimized compact card
  if (variant === 'compact') {
    return (
      <Link href={`/p/${proposal.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail - responsive sizing */}
            {hasImage && (
              <div className="relative w-full h-32 sm:w-32 sm:h-32 flex-shrink-0">
                <img
                  src={firstImage || ''}
                  alt={proposal.title}
                  className="w-full h-full object-cover"
                />
                {proposal.images && proposal.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                    +{proposal.images.length - 1}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <CardHeader className="pb-2">
                <div className="space-y-1">
                  {/* Title and badges - wrap on mobile */}
                  <div className="flex flex-wrap items-start gap-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1 min-w-0">
                      {proposal.title}
                    </CardTitle>
                    {/* Stack badges on mobile */}
                    <div className="flex flex-wrap gap-1">
                      {isOwner && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Mine</span>
                        </Badge>
                      )}
                      {proposal.userSupport === 'support' && (
                        <Badge variant="outline" className="text-xs badge-support">
                          <Heart className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Supported</span>
                        </Badge>
                      )}
                      {proposal.userSupport === 'supersupport' && (
                        <Badge variant="outline" className="text-xs badge-supersupport">
                          <Star className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Super</span>
                        </Badge>
                      )}
                      {proposal.userSupport === 'oppose' && (
                        <Badge variant="outline" className="text-xs badge-oppose">
                          <ThumbsDown className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Opposed</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Author and channel info */}
                  <CardDescription className="text-xs sm:text-sm">
                    by {proposal.owner.name || proposal.owner.email}
                    {showChannel && proposal.channel && (
                      <span> in {proposal.channel.name}</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3">
                {/* Note - hidden on mobile if we have image */}
                <p className={`text-muted-foreground line-clamp-1 text-xs sm:text-sm ${hasImage ? 'hidden sm:block' : ''}`}>
                  {proposal.note}
                </p>
                
                {/* Progress bar if enabled */}
                {showProgress && threshold > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{totalSupport} / {threshold}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary rounded-full h-1.5 transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Meta info - responsive layout */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(proposal.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  
                  {proposal.expiresAt && (
                    <span className="text-orange-600 dark:text-orange-400">
                      Expires {new Date(proposal.expiresAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  )}
                  
                  {proposal.externalChatUrl && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      Chat
                    </span>
                  )}
                  
                  <span className="ml-auto">
                    <Badge variant="outline" className="text-xs">
                      {totalSupport} support
                    </Badge>
                  </span>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Mini card variant for activity/propose tabs
  if (variant === 'mini') {
    return (
      <Link href={`/p/${proposal.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center p-3 gap-3">
            {/* Mini thumbnail */}
            {hasImage && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={firstImage || ''}
                  alt={proposal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm line-clamp-1">{proposal.title}</span>
                {isOwner && <Badge variant="outline" className="text-xs">Mine</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {totalSupport} support • {new Date(proposal.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {/* Status emoji */}
            <div className="text-lg">
              {proposal.userSupport === 'support' && '💚'}
              {proposal.userSupport === 'supersupport' && '⭐'}
              {proposal.userSupport === 'oppose' && '👎'}
              {!proposal.userSupport && '📝'}
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Default full card (existing behavior)
  return (
    <Link href={`/p/${proposal.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{proposal.title}</CardTitle>
              <CardDescription>
                by {proposal.owner.name || proposal.owner.email}
                {showChannel && proposal.channel && ` in ${proposal.channel.name}`}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {totalSupport} support
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{proposal.note}</p>
        </CardContent>
      </Card>
    </Link>
  )
}