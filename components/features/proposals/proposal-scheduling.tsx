"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Save } from "lucide-react"

interface ProposalSchedulingProps {
  publishMode: 'draft' | 'now' | 'scheduled'
  formData: {
    publishAt: string
    expiresAt: string
    suggestedEventDate: string
  }
  onPublishModeChange: (mode: 'draft' | 'now' | 'scheduled') => void
  onChange: (field: string, value: string) => void
}

export function ProposalScheduling({
  publishMode,
  formData,
  onPublishModeChange,
  onChange
}: ProposalSchedulingProps) {
  return (
    <div className="space-y-6">
      {/* Publishing Options */}
      <div className="space-y-4">
        <Label>Publishing Options</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={publishMode === 'now' ? 'default' : 'outline'}
            onClick={() => onPublishModeChange('now')}
            className="flex items-center justify-center space-x-1"
          >
            <span>Publish Now</span>
          </Button>
          <Button
            type="button"
            variant={publishMode === 'scheduled' ? 'default' : 'outline'}
            onClick={() => onPublishModeChange('scheduled')}
            className="flex items-center justify-center space-x-1"
          >
            <Clock className="h-3 w-3" />
            <span>Schedule</span>
          </Button>
          <Button
            type="button"
            variant={publishMode === 'draft' ? 'default' : 'outline'}
            onClick={() => onPublishModeChange('draft')}
            className="flex items-center justify-center space-x-1"
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
              onChange={(e) => onChange('publishAt', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}
      </div>

      {/* Timing & Expiration */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expiresAt">
            Expiration Date
            <span className="text-muted-foreground text-xs ml-1">(optional)</span>
          </Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => onChange('expiresAt', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-muted-foreground">
            When should this proposal stop accepting support?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="suggestedEventDate">
            Suggested Event Timing
            <span className="text-muted-foreground text-xs ml-1">(optional)</span>
          </Label>
          <Input
            id="suggestedEventDate"
            value={formData.suggestedEventDate}
            onChange={(e) => onChange('suggestedEventDate', e.target.value)}
            placeholder="e.g., 'Next Tuesday at 2pm' or 'This weekend'"
          />
          <p className="text-xs text-muted-foreground">
            When would you like the event to happen if this proposal gets enough support?
          </p>
        </div>
      </div>

      {/* Publishing Preview */}
      {publishMode !== 'draft' && (
        <div className="p-3 status-info border-info rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">
              {publishMode === 'now' ? 'Will publish immediately' : 
               publishMode === 'scheduled' && formData.publishAt ? 
                `Will publish ${new Date(formData.publishAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` :
               'Will be saved as draft'}
            </span>
          </div>
          {formData.expiresAt && (
            <div className="flex items-center space-x-2 text-sm mt-1">
              <Clock className="h-4 w-4" />
              <span>Expires {new Date(formData.expiresAt).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}