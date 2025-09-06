"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Trash2, Calendar } from "lucide-react"

interface ProposalActionsProps {
  proposalId: string
  isOwner: boolean
  hasEvent: boolean
  title: string
}

export function ProposalActions({ proposalId, isOwner, hasEvent, title }: ProposalActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOwner) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        // Close dialog first
        setShowDeleteDialog(false)
        // Show success message
        alert('Proposal deleted successfully')
        // Force a hard refresh to update all caches
        window.location.href = '/channels'
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to delete proposal:', error.error)
        alert('Failed to delete proposal: ' + error.error)
      }
    } catch (error) {
      console.error('Error deleting proposal:', error)
      alert('Error deleting proposal: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-background border border-border shadow-lg rounded-md p-1 min-w-[160px] z-50"
        >
          <DropdownMenuItem 
            onClick={() => router.push(`/proposals/${proposalId}/edit`)}
            className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-muted rounded-sm"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Proposal
          </DropdownMenuItem>
          
          {hasEvent && (
            <DropdownMenuItem 
              onClick={() => router.push(`/events/${proposalId}`)}
              className="flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-muted rounded-sm"
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Event
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator className="my-1 border-border" />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center px-2 py-2 text-sm cursor-pointer hover-error text-red-600 dark:text-red-400 rounded-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Proposal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-background border border-border shadow-xl rounded-lg p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Proposal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
              {hasEvent && (
                <div className="mt-2 p-2 status-warning border-warning rounded">
                  <strong>Warning:</strong> This proposal has an associated event that will also be deleted.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 