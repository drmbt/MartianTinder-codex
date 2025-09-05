"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"

interface Proposal {
  id: string
  title: string
  suggestedEventDate: string | null
  threshold: number | null
  channel: {
    name: string
  }
  owner: {
    name: string | null
    email: string
  }
  event: {
    id: string
    startAt: Date
  } | null
  _count: {
    supports: number
  }
}

interface Event {
  id: string
  title: string
  startAt: Date
  endAt: Date | null
}

interface CalendarViewProps {
  proposals: Proposal[]
  events: Event[]
}

export function CalendarView({ proposals, events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getItemsForDate = (date: Date) => {
    const dateItems = []

    // Add proposals with suggested event dates
    proposals.forEach(proposal => {
      if (proposal.suggestedEventDate) {
        const proposalDate = new Date(proposal.suggestedEventDate)
        if (isSameDay(proposalDate, date)) {
          dateItems.push({
            type: 'proposal' as const,
            id: proposal.id,
            title: proposal.title,
            time: format(proposalDate, 'HH:mm'),
            channel: proposal.channel.name,
            isReified: !!proposal.event,
            supportCount: proposal._count.supports,
            threshold: proposal.threshold
          })
        }
      }
    })

    // Add confirmed events
    events.forEach(event => {
      if (isSameDay(event.startAt, date)) {
        dateItems.push({
          type: 'event' as const,
          id: event.id,
          title: event.title,
          time: format(event.startAt, 'HH:mm'),
          isConfirmed: true
        })
      }
    })

    return dateItems.sort((a, b) => a.time.localeCompare(b.time))
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  if (proposals.length === 0 && events.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled items</h3>
          <p className="text-gray-500 mb-6">
            Proposals with suggested event dates and confirmed events will appear here.
          </p>
          <Link href="/feed">
            <Button>Explore Proposals</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const dayItems = getItemsForDate(day)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayItems.slice(0, 3).map((item, index) => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.type === 'proposal' ? `/p/${item.id}` : `/events/${item.id}`}
                      >
                        <div className={`text-xs p-1 rounded truncate cursor-pointer ${
                          item.type === 'event' || (item.type === 'proposal' && item.isReified)
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          <div className="font-medium truncate">{item.title}</div>
                          <div className="flex items-center gap-1 opacity-75">
                            <Clock size={10} />
                            {item.time}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Proposed Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Confirmed Events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 