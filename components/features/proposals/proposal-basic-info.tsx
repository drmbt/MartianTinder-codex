"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ErrorMessage } from "@/components/ui/error-card"

interface Channel {
  id: string
  name: string
  description?: string | null
}

interface ProposalBasicInfoProps {
  channels: Channel[]
  formData: {
    channelId: string
    title: string
    note: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
}

export function ProposalBasicInfo({
  channels,
  formData,
  errors,
  onChange
}: ProposalBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <div className="space-y-2">
        <Label htmlFor="channelId">
          Channel <span className="text-destructive">*</span>
        </Label>
        <select
          id="channelId"
          value={formData.channelId}
          onChange={(e) => onChange('channelId', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${
            errors.channelId ? 'border-destructive' : 'border-input'
          }`}
          required
        >
          {channels.map((channel) => (
            <option key={channel.id} value={channel.id}>
              {channel.name}
            </option>
          ))}
        </select>
        {errors.channelId && <ErrorMessage message={errors.channelId} />}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="What are you proposing?"
          className={errors.title ? 'border-destructive' : ''}
          required
        />
        {errors.title && <ErrorMessage message={errors.title} />}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="note">
          Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="note"
          value={formData.note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="Provide details about your proposal..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px] ${
            errors.note ? 'border-destructive' : 'border-input'
          }`}
          required
        />
        {errors.note && <ErrorMessage message={errors.note} />}
      </div>
    </div>
  )
}