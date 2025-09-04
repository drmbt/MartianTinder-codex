import ical from 'ical-generator'
import { CalendarEvent } from '@/types'

export function generateICSForEvent(event: CalendarEvent): string {
  const calendar = ical({ name: process.env.APP_NAME || 'MartianTinder' })
  
  calendar.createEvent({
    id: event.uid,
    start: event.startAt,
    end: event.endAt || new Date(event.startAt.getTime() + 60 * 60 * 1000), // Default 1 hour
    summary: event.title,
    description: event.description,
    location: event.location,
  })
  
  return calendar.toString()
}

export function generateICSForUserEvents(events: CalendarEvent[], userName?: string): string {
  const calendar = ical({ 
    name: `${process.env.APP_NAME || 'MartianTinder'} - ${userName || 'My Events'}`,
    description: 'Events from your supported proposals'
  })
  
  events.forEach(event => {
    calendar.createEvent({
      id: event.uid,
      start: event.startAt,
      end: event.endAt || new Date(event.startAt.getTime() + 60 * 60 * 1000),
      summary: event.title,
      description: event.description,
      location: event.location,
    })
  })
  
  return calendar.toString()
}

export function createGoogleCalendarLink(event: CalendarEvent): string {
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