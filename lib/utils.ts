import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Common Tailwind patterns as utility functions
 */
export const tw = {
  // Card patterns
  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-sm",
    hover: "transition-colors hover:bg-muted/50",
    interactive: "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
  },
  
  // Button patterns
  button: {
    icon: "h-9 w-9 p-0 flex items-center justify-center",
    iconSm: "h-7 w-7 p-0 flex items-center justify-center",
    iconLg: "h-11 w-11 p-0 flex items-center justify-center",
    withIcon: "flex items-center justify-center space-x-2",
  },
  
  // Form patterns
  form: {
    group: "space-y-2",
    label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    helper: "text-xs text-muted-foreground",
    error: "text-xs text-destructive",
  },
  
  // Status patterns
  status: {
    success: "status-success",
    error: "status-error", 
    warning: "status-warning",
    info: "status-info",
    active: "status-active",
  },
  
  // Layout patterns
  layout: {
    container: "container mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-8 sm:py-12",
    stack: "flex flex-col space-y-4",
    grid: "grid gap-4",
    center: "flex items-center justify-center",
  },
  
  // Text patterns
  text: {
    h1: "text-3xl font-bold tracking-tight",
    h2: "text-2xl font-semibold tracking-tight",
    h3: "text-xl font-semibold",
    h4: "text-lg font-medium",
    muted: "text-muted-foreground",
    small: "text-sm text-muted-foreground",
    tiny: "text-xs text-muted-foreground",
  }
}

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function isProposalPublished(publishAt: Date | null): boolean {
  if (!publishAt) return true
  return publishAt <= new Date()
}

export function isProposalExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false
  return expiresAt < new Date()
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function generateGoogleCalendarUrl(event: {
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt?: Date
}): string {
  const baseUrl = process.env.GOOGLE_CALENDAR_BASE_URL || "https://calendar.google.com/calendar/render"
  const startDate = event.startAt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const endDate = event.endAt 
    ? event.endAt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    : new Date(event.startAt.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') // Default 1 hour
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || ''
  })
  
  return `${baseUrl}?${params.toString()}`
}
