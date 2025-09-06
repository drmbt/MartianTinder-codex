"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ProposalCapacityProps {
  formData: {
    minCapacity: string
    maxCapacity: string
    threshold: string
  }
  onChange: (field: string, value: any) => void
}

export function ProposalCapacity({
  formData,
  onChange
}: ProposalCapacityProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minCapacity">
          Min Capacity
          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        </Label>
        <Input
          id="minCapacity"
          type="number"
          value={formData.minCapacity}
          onChange={(e) => onChange('minCapacity', e.target.value)}
          placeholder="Minimum participants"
          min="1"
        />
        <p className="text-xs text-muted-foreground">
          Minimum number of participants needed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxCapacity">
          Max Capacity
          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        </Label>
        <Input
          id="maxCapacity"
          type="number"
          value={formData.maxCapacity}
          onChange={(e) => onChange('maxCapacity', e.target.value)}
          placeholder="Maximum participants"
          min="1"
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of participants allowed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="threshold">
          Support Threshold
          <span className="text-muted-foreground text-xs ml-1">(optional)</span>
        </Label>
        <Input
          id="threshold"
          type="number"
          value={formData.threshold}
          onChange={(e) => onChange('threshold', e.target.value)}
          placeholder="0 = announcement"
          min="0"
        />
        <p className="text-xs text-muted-foreground">
          Support needed to become an event
        </p>
      </div>
    </div>
  )
}