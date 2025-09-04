"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Channel } from "@prisma/client"

interface ProposalFormProps {
  channels: Channel[]
}

export function ProposalForm({ channels }: ProposalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    note: "",
    channelId: channels[0]?.id || "",
    minCapacity: "",
    maxCapacity: "",
    threshold: "",
    visibility: "channel" as const,
    allowAnonymous: false,
    moderationMode: "auto" as const,
    externalChatUrl: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.note || !formData.channelId) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          minCapacity: formData.minCapacity ? parseInt(formData.minCapacity) : undefined,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
          threshold: formData.threshold ? parseInt(formData.threshold) : undefined,
          externalChatUrl: formData.externalChatUrl || undefined, // Convert empty string to undefined
        }),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/p/${result.data.id}`)
      } else {
        console.error("Failed to create proposal")
      }
    } catch (error) {
      console.error("Error creating proposal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Details</CardTitle>
        <CardDescription>
          Fill out the details for your proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label htmlFor="channelId">Channel</Label>
            <select
              id="channelId"
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What are you proposing?"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="note">Description</Label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Provide details about your proposal..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
              required
            />
          </div>

          {/* Capacity Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minCapacity">Min Capacity</Label>
              <Input
                id="minCapacity"
                type="number"
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: e.target.value })}
                placeholder="Optional"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCapacity">Max Capacity</Label>
              <Input
                id="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                placeholder="Optional"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                placeholder="0 = announcement"
                min="0"
              />
            </div>
          </div>

          {/* External Chat Link */}
          <div className="space-y-2">
            <Label htmlFor="externalChatUrl">External Chat Link (Optional)</Label>
            <Input
              id="externalChatUrl"
              type="url"
              value={formData.externalChatUrl}
              onChange={(e) => setFormData({ ...formData, externalChatUrl: e.target.value })}
              placeholder="https://t.me/yourchat or WhatsApp/Signal link"
            />
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="allowAnonymous"
                type="checkbox"
                checked={formData.allowAnonymous}
                onChange={(e) => setFormData({ ...formData, allowAnonymous: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="allowAnonymous">Allow anonymous support</Label>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.note || !formData.channelId}
              className="flex-1"
            >
              {isLoading ? "Creating..." : "Create Proposal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 