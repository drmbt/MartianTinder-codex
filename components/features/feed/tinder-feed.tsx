"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NextImageGallery } from "@/components/ui/next-image-gallery"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"

interface ProposalData {
  id: string
  title: string
  note: string
  threshold: number | null
  createdAt: Date
  expiresAt: Date | null
  imageUrl: string | null
  images?: Array<{ url: string; order: number }> // New image gallery support
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

interface TinderFeedProps {
  proposals: ProposalData[]
}

export function TinderFeed({ proposals }: TinderFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [exitAnimation, setExitAnimation] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleAction = useCallback(async (action: 'support' | 'supersupport' | 'oppose' | 'dismiss') => {
    if (isAnimating || isDragging) return
    
    setIsAnimating(true)
    
    // Set exit animation direction based on action
    const animationMap = {
      'support': 'right' as const,
      'dismiss': 'left' as const,
      'supersupport': 'up' as const,
      'oppose': 'down' as const
    }
    setExitAnimation(animationMap[action])

    // Wait for animation to complete before API call
    setTimeout(async () => {
      try {
        const currentProposal = proposals[currentIndex]
        if (action === 'dismiss') {
          // Mark as dismissed
          await fetch(`/api/proposals/${currentProposal.id}/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ state: 'dismissed' }),
          })
        } else {
          // Submit support signal
          await fetch(`/api/proposals/${currentProposal.id}/signal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ type: action, visibility: 'public' }),
          })
        }

        // Move to next proposal and reset states
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
          setIsAnimating(false)
          setExitAnimation(null)
          setSwipeOffset({ x: 0, y: 0 })
        }, 200)
      } catch (error) {
        console.error('Error submitting action:', error)
        setIsAnimating(false)
        setExitAnimation(null)
      }
    }, 400) // Delay API call to allow animation to start
  }, [isAnimating, isDragging, proposals, currentIndex, setCurrentIndex, setIsAnimating, setExitAnimation, setSwipeOffset])

  // Add keyboard support for true Tinder experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handleAction('dismiss')
          break
        case 'ArrowDown':
          e.preventDefault()
          handleAction('oppose')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleAction('support')
          break
        case 'ArrowUp':
          e.preventDefault()
          handleAction('supersupport')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnimating, handleAction])

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-medium text-foreground mb-2">All caught up!</h3>
          <p className="text-muted-foreground mb-6">
            You&apos;ve seen all the new proposals in your channels.
          </p>
          <div className="space-y-2 space-x-4">
            <Link href="/channels">
              <Button variant="outline">Browse Channels</Button>
            </Link>
            <Link href="/proposals/new">
              <Button>Create New Proposal</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentProposal = proposals[currentIndex]
  const remainingCount = proposals.length - currentIndex

  // Show completion state when no more proposals
  if (!currentProposal || currentIndex >= proposals.length) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-medium text-foreground mb-2">All caught up!</h3>
          <p className="text-muted-foreground mb-6">
            You&apos;ve reviewed all the new proposals in your channels.
          </p>
          <div className="space-y-2">
            <Link href="/channels">
              <Button variant="outline">Browse Channels</Button>
            </Link>
            <Link href="/proposals/new">
              <Button>Create New Proposal</Button>
            </Link>
            <Link href="/dashboard">
              <Button>View Your Activity</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isAnimating) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    
    setSwipeOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!touchStartRef.current || isAnimating) return
    
    const threshold = 100 // pixels needed to trigger action
    const { x, y } = swipeOffset
    
    // Determine action based on swipe direction and magnitude
    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal swipe
      if (x > threshold) {
        handleAction('support') // Swipe right
      } else if (x < -threshold) {
        handleAction('dismiss') // Swipe left
      } else {
        // Snap back if threshold not met
        setSwipeOffset({ x: 0, y: 0 })
        setIsDragging(false)
      }
    } else {
      // Vertical swipe
      if (y < -threshold) {
        handleAction('supersupport') // Swipe up
      } else if (y > threshold) {
        handleAction('oppose') // Swipe down
      } else {
        // Snap back if threshold not met
        setSwipeOffset({ x: 0, y: 0 })
        setIsDragging(false)
      }
    }
    
    touchStartRef.current = null
  }

  const totalSupport = currentProposal.supportStats.supports + currentProposal.supportStats.supersupports
  const threshold = currentProposal.threshold || 0

  return (
    <div className="space-y-6 px-4">
      {/* Progress Indicator */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground mb-2 mt-4">
          {currentIndex + 1} of {proposals.length} • {remainingCount - 1} remaining
        </div>
        <div className="w-full progress-bar h-1">
          <div 
            className="progress-fill h-1"
            style={{ width: `${((currentIndex + 1) / proposals.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Proposal Card with Swipe Support */}
      <div 
        ref={cardRef}
        className="relative touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Swipe Direction Indicators */}
        {isDragging && (
          <>
            {swipeOffset.x > 50 && (
              <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                SUPPORT
              </div>
            )}
            {swipeOffset.x < -50 && (
              <div className="absolute top-4 right-4 z-10 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                DISMISS
              </div>
            )}
            {swipeOffset.y < -50 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                SUPER
              </div>
            )}
            {swipeOffset.y > 50 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                OPPOSE
              </div>
            )}
          </>
        )}
        <Card 
          className={`transition-all ${isDragging ? 'duration-0' : exitAnimation ? 'duration-500' : 'duration-300'}`}
          style={{
            transform: exitAnimation 
              ? `${
                  exitAnimation === 'left' ? 'translateX(-150%) rotate(-30deg)' :
                  exitAnimation === 'right' ? 'translateX(150%) rotate(30deg)' :
                  exitAnimation === 'up' ? 'translateY(-150%) rotate(10deg)' :
                  exitAnimation === 'down' ? 'translateY(150%) rotate(-10deg)' :
                  ''
                }`
              : `translate(${swipeOffset.x}px, ${swipeOffset.y}px) rotate(${swipeOffset.x * 0.1}deg)`,
            opacity: exitAnimation 
              ? 0 
              : isDragging 
                ? 1 - Math.abs(swipeOffset.x) / 500 
                : 1
          }}
        >
        {/* Image Gallery */}
        {(currentProposal.images?.length || currentProposal.imageUrl) && (
          <div className="relative w-full">
            <NextImageGallery 
              images={
                currentProposal.images && currentProposal.images.length > 0 
                  ? currentProposal.images.sort((a, b) => a.order - b.order).map(img => img.url)
                  : currentProposal.imageUrl ? [currentProposal.imageUrl] : []
              }
              className="w-full h-64 sm:h-80 md:h-96"
              alt={currentProposal.title}
            />
          </div>
        )}
        
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-xl">{currentProposal.title}</CardTitle>
            <CardDescription>
              by {currentProposal.owner.name || currentProposal.owner.email} in {currentProposal.channel.name}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-foreground">{currentProposal.note}</p>
          </div>

          {/* Suggested Event Date */}
          {currentProposal.suggestedEventDate && (
            <div className="p-3 status-info border-info rounded-lg">
              <div className="text-sm">
                <span className="font-medium">📅 Suggested timing:</span>
                <span className="ml-1">{currentProposal.suggestedEventDate}</span>
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
              <span className="text-green-600 dark:text-green-400">💚 {currentProposal.supportStats.supports}</span>
              <span className="text-blue-600 dark:text-blue-400">⭐ {currentProposal.supportStats.supersupports}</span>
              <span className="text-red-600 dark:text-red-400">👎 {currentProposal.supportStats.opposes}</span>
            </div>
          </div>

          {/* External Chat */}
          {currentProposal.externalChatUrl && (
            <div className="p-3 status-info border-info rounded-lg">
              <a 
                href={currentProposal.externalChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                💬 Join Discussion →
              </a>
            </div>
          )}

          {/* Expiration */}
          {currentProposal.expiresAt && (
            <div className="text-xs text-muted-foreground text-center">
              Expires {new Date(currentProposal.expiresAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Tinder-style Action Buttons */}
      <div className="space-y-4">
        {/* Main Actions (Tinder-style) */}
        <div className="grid grid-cols-4 gap-3">
          <Button
            onClick={() => handleAction('dismiss')}
            disabled={isAnimating}
            variant="outline"
            className="aspect-square p-0 border-muted hover:bg-muted"
          >
            <div className="flex flex-col items-center space-y-1">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Dismiss</span>
            </div>
          </Button>
          
          <Button
            onClick={() => handleAction('oppose')}
            disabled={isAnimating}
            variant="outline"
            className="aspect-square p-0 border-red-300 dark:border-red-800 hover-error"
          >
            <div className="flex flex-col items-center space-y-1">
              <ArrowDown className="h-5 w-5 text-red-600" />
              <span className="text-xs text-red-600">Oppose</span>
            </div>
          </Button>

          <Button
            onClick={() => handleAction('support')}
            disabled={isAnimating}
            variant="outline"
            className="aspect-square p-0 border-green-300 dark:border-green-800 hover-success"
          >
            <div className="flex flex-col items-center space-y-1">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <span className="text-xs text-green-600">Support</span>
            </div>
          </Button>

          <Button
            onClick={() => handleAction('supersupport')}
            disabled={isAnimating}
            variant="outline"
            className="aspect-square p-0 border-blue-300 dark:border-blue-800 hover-info"
          >
            <div className="flex flex-col items-center space-y-1">
              <ArrowUp className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-blue-600">Super</span>
            </div>
          </Button>
        </div>

        {/* Keyboard Shortcuts & Swipe Help */}
        <div className="text-center text-xs text-muted-foreground">
          <div className="md:hidden">Swipe: ← Dismiss • ↓ Oppose • → Support • ↑ Super</div>
          <div className="hidden md:block">← Dismiss • ↓ Oppose • → Support • ↑ Super Support</div>
          <div className="mt-1">
            <Link href={`/p/${currentProposal.id}`} className="text-blue-500 hover:text-blue-700">
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 