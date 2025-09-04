"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface JoinChannelModalProps {
  children: React.ReactNode
}

export function JoinChannelModal({ children }: JoinChannelModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) return

    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/channels/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsOpen(false)
        setInviteCode("")
        router.refresh() // Refresh to show new channel
      } else {
        setError(result.error || "Failed to join channel")
      }
    } catch (error) {
      setError("Error joining channel")
      console.error("Error joining channel:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Channel</DialogTitle>
          <DialogDescription>
            Enter an invite code to join an existing channel.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              required
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setError("")
                setInviteCode("")
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !inviteCode.trim()}
              className="flex-1"
            >
              {isLoading ? "Joining..." : "Join Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 