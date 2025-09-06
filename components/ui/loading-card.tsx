import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface LoadingCardProps {
  message?: string
  rows?: number
  showSpinner?: boolean
  className?: string
}

/**
 * Reusable loading card component
 */
export function LoadingCard({ 
  message = "Loading...", 
  rows = 3,
  showSpinner = true,
  className = ""
}: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="py-8">
        {showSpinner && (
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {message && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({ 
  size = "default",
  className = "" 
}: { 
  size?: "sm" | "default" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <Loader2 className={`animate-spin text-muted-foreground ${sizeClasses[size]} ${className}`} />
  )
}

/**
 * Full page loading state
 */
export function PageLoading({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}