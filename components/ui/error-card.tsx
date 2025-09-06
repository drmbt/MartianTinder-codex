import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorCardProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
  className?: string
}

/**
 * Reusable error card component
 */
export function ErrorCard({ 
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
  showHomeButton = true,
  className = ""
}: ErrorCardProps) {
  return (
    <Card className={`border-destructive/50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Inline error message
 */
export function ErrorMessage({ 
  message,
  className = "" 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Empty state component
 */
export function EmptyState({
  icon = "📭",
  title = "No items found",
  message = "There are no items to display.",
  action,
  actionLabel = "Create New",
  className = ""
}: {
  icon?: string | React.ReactNode
  title?: string
  message?: string
  action?: () => void
  actionLabel?: string
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
        {action && (
          <Button onClick={action} variant="outline">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}