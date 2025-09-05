"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock } from "lucide-react"

interface ThresholdConfirmationProps {
  proposalId: string
  proposalTitle: string
  totalSupport: number
  threshold: number
  isOwner: boolean
  isOpen: boolean
  onClose: () => void
}

export function ThresholdConfirmation({
  proposalId,
  proposalTitle,
  totalSupport,
  threshold,
  isOwner,
  isOpen,
  onClose
}: ThresholdConfirmationProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [eventData, setEventData] = useState({
    title: proposalTitle,
    description: "",
    startAt: "",
    endAt: "",
    location: "",
  })

  const handleReify = async () => {
    if (!eventData.startAt) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}/reify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...eventData,
          startAt: new Date(eventData.startAt),
          endAt: eventData.endAt ? new Date(eventData.endAt) : undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/events/${result.data.id}`)
      } else {
        console.error('Failed to reify proposal')
      }
    } catch (error) {
      console.error('Error reifying proposal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  if (!isOwner) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🎉 Threshold Met!</DialogTitle>
            <DialogDescription>
              This proposal has reached its support threshold ({totalSupport}/{threshold}).
              The owner can now turn this into an event.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button onClick={onClose}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>🎉 Ready to Create Event</span>
            <Badge variant="outline" className="bg-green-50">
              {totalSupport}/{threshold} threshold met
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Your proposal "{proposalTitle}" has enough support! 
            Configure the event details to make it official.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event Title</Label>
            <Input
              id="event-title"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Event Description (Optional)</Label>
            <textarea
              id="event-description"
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              placeholder="Additional details for the event..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start Date & Time</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={eventData.startAt}
                onChange={(e) => setEventData({ ...eventData, startAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">End Date & Time (Optional)</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={eventData.endAt}
                onChange={(e) => setEventData({ ...eventData, endAt: e.target.value })}
                min={eventData.startAt}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location (Optional)</Label>
            <Input
              id="event-location"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              placeholder="Where will this event take place?"
            />
          </div>

          {/* Quick Date Suggestions */}
          <div className="space-y-2">
            <Label>Quick Date Options</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEventData({ 
                  ...eventData, 
                  startAt: tomorrow.toISOString().slice(0, 16) 
                })}
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEventData({ 
                  ...eventData, 
                  startAt: nextWeek.toISOString().slice(0, 16) 
                })}
              >
                Next Week
              </Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReify}
            disabled={isLoading || !eventData.title || !eventData.startAt}
            className="flex-1"
          >
            {isLoading ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 