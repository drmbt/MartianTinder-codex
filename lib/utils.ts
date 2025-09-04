import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
