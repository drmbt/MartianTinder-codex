"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { Calendar, Clock, Save } from "lucide-react"
import { createProposalSchema } from "@/lib/validations"
// Channel type definition
interface Channel {
  id: string
  name: string
  description?: string | null
}

interface ProposalFormProps {
  channels: Channel[]
  editingProposal?: {
    id: string
    title: string
    note: string
    channelId: string
    minCapacity: number | null
    maxCapacity: number | null
    threshold: number | null
    publishAt: Date | null
    expiresAt: Date | null
    visibility: string
    allowAnonymous: boolean
    moderationMode: string
    externalChatUrl: string | null
    suggestedEventDate: string | null
    images?: Array<{ id: string; url: string; order: number }>
  }
}

export function ProposalForm({ channels, editingProposal }: ProposalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [publishMode, setPublishMode] = useState<'draft' | 'now' | 'scheduled'>('now')
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, fileName: string}>>(
    editingProposal?.images?.map(img => ({ url: img.url, fileName: img.url.split('/').pop() || '' })) || []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: editingProposal?.title || "",
    note: editingProposal?.note || "",
    channelId: editingProposal?.channelId || channels[0]?.id || "",
    minCapacity: editingProposal?.minCapacity?.toString() || "",
    maxCapacity: editingProposal?.maxCapacity?.toString() || "",
    threshold: editingProposal?.threshold?.toString() || "",
    visibility: editingProposal?.visibility || "channel" as const,
    allowAnonymous: editingProposal?.allowAnonymous || false,
    moderationMode: editingProposal?.moderationMode || "auto" as const,
    externalChatUrl: editingProposal?.externalChatUrl || "",
    publishAt: editingProposal?.publishAt ? new Date(editingProposal.publishAt).toISOString().slice(0, 16) : "",
    expiresAt: editingProposal?.expiresAt ? new Date(editingProposal.expiresAt).toISOString().slice(0, 16) : "",
    suggestedEventDate: editingProposal?.suggestedEventDate || "", // Your "next Tuesday" example
  })

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'publish') => {
    e.preventDefault()
    setErrors({})

    setIsLoading(true)
    try {
      const submitData: Record<string, unknown> = {
        ...formData,
        minCapacity: formData.minCapacity ? parseInt(formData.minCapacity) : undefined,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        threshold: formData.threshold ? parseInt(formData.threshold) : undefined,
        externalChatUrl: formData.externalChatUrl || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      }

      // Handle publish/draft logic
      if (action === 'draft') {
        // Save as draft - set publishAt to far future
        submitData.publishAt = new Date('2099-01-01').toISOString()
      } else if (publishMode === 'now') {
        // Publish immediately
        submitData.publishAt = null
      } else if (publishMode === 'scheduled' && formData.publishAt) {
        // Scheduled publish
        submitData.publishAt = new Date(formData.publishAt).toISOString()
      }

      // Handle expiration
      if (formData.expiresAt) {
        submitData.expiresAt = new Date(formData.expiresAt).toISOString()
      }

      // Add suggested event date as part of description if provided
      if (formData.suggestedEventDate) {
        submitData.suggestedEventDate = formData.suggestedEventDate
      }

      // Validate with Zod
      const validation = createProposalSchema.safeParse(submitData)
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {}
        validation.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message
          }
        })
        setErrors(fieldErrors)
        setIsLoading(false)
        return
      }

      console.log("Submitting proposal data:", submitData)

      const url = editingProposal ? `/api/proposals/${editingProposal.id}` : "/api/proposals"
      const method = editingProposal ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      console.log("API response:", result)

      if (response.ok && result.success) {
        router.push(`/p/${editingProposal?.id || result.data.id}`)
      } else {
        console.error(`Failed to ${editingProposal ? 'update' : 'create'} proposal:`, result)
        alert(`Failed to ${editingProposal ? 'update' : 'create'} proposal: ${result.error || result.details || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error creating proposal:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Details</CardTitle>
        <CardDescription>
          Fill out the details for your proposal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label htmlFor="channelId">Channel <span className="text-red-500">*</span></Label>
            <select
              id="channelId"
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.channelId ? 'border-red-500' : 'border-input'
              }`}
              required
            >
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
            {errors.channelId && (
              <p className="text-sm text-red-500 mt-1">{errors.channelId}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What are you proposing?"
              className={errors.title ? 'border-red-500' : ''}
              required
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="note">Description <span className="text-red-500">*</span></Label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Provide details about your proposal..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] ${
                errors.note ? 'border-red-500' : 'border-input'
              }`}
              required
            />
            {errors.note && (
              <p className="text-sm text-red-500 mt-1">{errors.note}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images</Label>
            <ImageUpload
              onUpload={(files) => {
                setUploadedImages(prev => [...prev, ...files.map(f => ({ url: f.url, fileName: f.fileName }))])
              }}
              onRemove={(fileName) => {
                setUploadedImages(prev => prev.filter(img => img.fileName !== fileName))
              }}
              existingImages={uploadedImages.map(img => img.url)}
              subDir="proposals"
              maxFiles={5}
              disabled={isLoading}
            />
          </div>

          {/* Publishing Options */}
          <div className="space-y-4">
            <Label>Publishing Options</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={publishMode === 'now' ? 'default' : 'outline'}
                onClick={() => setPublishMode('now')}
                className="flex items-center space-x-1"
              >
                <span>Publish Now</span>
              </Button>
              <Button
                type="button"
                variant={publishMode === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setPublishMode('scheduled')}
                className="flex items-center space-x-1"
              >
                <Clock className="h-3 w-3" />
                <span>Schedule</span>
              </Button>
              <Button
                type="button"
                variant={publishMode === 'draft' ? 'default' : 'outline'}
                onClick={() => setPublishMode('draft')}
                className="flex items-center space-x-1"
              >
                <Save className="h-3 w-3" />
                <span>Save Draft</span>
              </Button>
            </div>

            {publishMode === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="publishAt">Publish Date & Time</Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={formData.publishAt}
                  onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>

          {/* Timing & Expiration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500">
                When should this proposal stop accepting support? Leave empty for no expiration.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestedEventDate">Suggested Event Timing (Optional)</Label>
              <Input
                id="suggestedEventDate"
                value={formData.suggestedEventDate}
                onChange={(e) => setFormData({ ...formData, suggestedEventDate: e.target.value })}
                placeholder="e.g., 'Next Tuesday at 2pm' or 'This weekend'"
              />
              <p className="text-xs text-gray-500">
                When would you like the event to happen if this proposal gets enough support?
              </p>
            </div>
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
              <Label htmlFor="threshold">Support Threshold</Label>
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

          {/* Action Buttons */}
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
              type="button"
              onClick={(e) => handleSubmit(e, 'publish')}
              disabled={isLoading || !formData.title || !formData.note || !formData.channelId}
              className="flex-1"
            >
              {isLoading ? (editingProposal ? "Updating..." : "Creating...") : 
               publishMode === 'draft' ? "Save Draft" :
               publishMode === 'scheduled' ? "Schedule Proposal" : 
               editingProposal ? "Update Proposal" : "Create & Publish"}
            </Button>
          </div>

          {/* Publishing Preview */}
          {publishMode !== 'draft' && (
            <div className="p-3 status-info border-info rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  {publishMode === 'now' ? 'Will publish immediately' : 
                   publishMode === 'scheduled' ? `Will publish ${formData.publishAt ? new Date(formData.publishAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'at selected time'}` :
                   'Will be saved as draft'}
                </span>
              </div>
              {formData.expiresAt && (
                <div className="flex items-center space-x-2 text-sm mt-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Expires {new Date(formData.expiresAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
} 