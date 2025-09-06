"use client"

import { useState, useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ThumbsDown, X, Bookmark, SkipForward } from "lucide-react"
import { SupportType, SupportVisibility } from "@/types"

interface SupportStats {
  supports: number
  supersupports: number
  opposes: number
}

interface SupportButtonsProps {
  proposalId: string
  currentSignal?: {
    type: SupportType
    visibility: SupportVisibility
  } | null
  stats: SupportStats
  threshold: number
}

export function SupportButtons({ 
  proposalId, 
  currentSignal, 
  stats, 
  threshold
}: SupportButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStats, updateOptimisticStats] = useOptimistic(
    stats,
    (state, action: { type: SupportType | 'remove'; oldType?: SupportType }) => {
      const newStats = { ...state }
      
      // Remove old signal if exists
      if (action.oldType) {
        if (action.oldType === 'support') newStats.supports = Math.max(0, newStats.supports - 1)
        else if (action.oldType === 'supersupport') newStats.supersupports = Math.max(0, newStats.supersupports - 1)
        else if (action.oldType === 'oppose') newStats.opposes = Math.max(0, newStats.opposes - 1)
      }
      
      // Add new signal
      if (action.type === 'support') newStats.supports++
      else if (action.type === 'supersupport') newStats.supersupports++
      else if (action.type === 'oppose') newStats.opposes++
      
      return newStats
    }
  )

  const handleSignal = async (type: SupportType, visibility: SupportVisibility = 'public') => {
    startTransition(() => {
      // Optimistic update
      updateOptimisticStats({ type, oldType: currentSignal?.type })
    })

    try {
      const response = await fetch(`/api/proposals/${proposalId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, visibility }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Check if threshold was met
        if (result.data.thresholdMet) {
          console.log('🎉 Threshold met! This proposal can now become an event.')
        }
        
        // Refresh page to show updated state
        window.location.reload()
      } else {
        console.error('Failed to submit signal')
        window.location.reload() // Revert optimistic update
      }
    } catch (error) {
      console.error('Error submitting signal:', error)
      window.location.reload() // Revert optimistic update
    }
  }

  const handleRemoveSignal = async () => {
    if (!currentSignal) return

    startTransition(() => {
      updateOptimisticStats({ type: 'remove' as SupportType, oldType: currentSignal.type })
    })

    try {
      const response = await fetch(`/api/proposals/${proposalId}/signal`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        console.error('Failed to remove signal')
        window.location.reload()
      }
    } catch (error) {
      console.error('Error removing signal:', error)
      window.location.reload()
    }
  }

  const handleUserState = async (state: 'skipped' | 'dismissed' | 'starred') => {
    try {
      await fetch(`/api/proposals/${proposalId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ state }),
      })
      
      if (state === 'dismissed') {
        // Navigate away from dismissed proposal
        window.history.back()
      }
    } catch (error) {
      console.error('Error updating user state:', error)
    }
  }

  const totalSupport = optimisticStats.supports + optimisticStats.supersupports
  const progressPercent = threshold > 0 ? Math.min(100, (totalSupport / threshold) * 100) : 0
  const thresholdMet = threshold > 0 && totalSupport >= threshold

  return (
    <div className="space-y-4">
      {/* Threshold Met Alert */}
      {thresholdMet && (
        <div className="p-4 status-success border-success rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="font-semibold">🎉 Threshold Met!</div>
          </div>
          <p className="text-sm mt-1">
            This proposal has enough support to become an event.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Support Progress</span>
          <span>{totalSupport} / {threshold || "∞"}</span>
        </div>
        <div className="w-full progress-bar h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              thresholdMet ? 'progress-fill-success' : 'bg-primary'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
          {threshold > 0 && (
            <div 
              className="absolute w-0.5 h-3 bg-muted-foreground rounded"
              style={{ left: `${Math.min(100, (threshold / (threshold * 1.5)) * 100)}%` }}
            />
          )}
        </div>
      </div>
      
      {/* Support Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{optimisticStats.supports}</div>
          <div className="text-xs text-muted-foreground">Support</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{optimisticStats.supersupports}</div>
          <div className="text-xs text-muted-foreground">Super</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{optimisticStats.opposes}</div>
          <div className="text-xs text-muted-foreground">Oppose</div>
        </div>
      </div>

      {/* Current Signal Display */}
      {currentSignal && (
        <div className="p-3 status-info border-info rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Your signal: <span className="font-medium capitalize ml-1">{currentSignal.type}</span>
              {currentSignal.visibility !== 'public' && (
                <span className="text-muted-foreground"> ({currentSignal.visibility})</span>
              )}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRemoveSignal}
            disabled={isPending}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

             {/* Support Actions */}
       <div className="space-y-2">
         <Button 
           className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
           onClick={() => handleSignal('support')}
           disabled={isPending}
           variant={currentSignal?.type === 'support' ? 'default' : 'outline'}
         >
           <Heart className="h-4 w-4" />
           <span>Support</span>
         </Button>
         
         <Button 
           className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
           onClick={() => handleSignal('supersupport')}
           disabled={isPending}
           variant={currentSignal?.type === 'supersupport' ? 'default' : 'outline'}
         >
           <Star className="h-4 w-4" />
           <span>Super Support</span>
         </Button>
         
         <Button 
           variant="outline" 
           className="w-full text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover-error flex items-center justify-center space-x-2"
           onClick={() => handleSignal('oppose')}
           disabled={isPending}
         >
           <ThumbsDown className="h-4 w-4" />
           <span>Oppose</span>
         </Button>

         {/* Swipe Left / Dismiss Button */}
         <Button 
           variant="outline" 
           className="w-full text-muted-foreground border-muted hover:bg-muted flex items-center justify-center space-x-2"
           onClick={() => handleUserState('dismissed')}
           disabled={isPending}
         >
           <X className="h-4 w-4" />
           <span>Dismiss (Swipe Left)</span>
         </Button>
       </div>

             {/* Additional Feed Actions */}
       <div className="border-t pt-4">
         <div className="text-xs text-gray-500 mb-2">Additional Actions</div>
         <div className="grid grid-cols-2 gap-2">
           <Button 
             variant="ghost" 
             size="sm"
             onClick={() => handleUserState('starred')}
             className="flex items-center justify-center space-x-1"
           >
             <Bookmark className="h-3 w-3" />
             <span className="text-xs">Star for Later</span>
           </Button>
           <Button 
             variant="ghost" 
             size="sm"
             onClick={() => handleUserState('skipped')}
             className="flex items-center justify-center space-x-1"
           >
             <SkipForward className="h-3 w-3" />
             <span className="text-xs">Skip</span>
           </Button>
         </div>
       </div>
    </div>
  )
} 