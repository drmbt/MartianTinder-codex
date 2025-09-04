"use client"

import type { Channel } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, MessageSquare } from "lucide-react"
import { CreateChannelModal } from "./create-channel-modal"
import { JoinChannelModal } from "./join-channel-modal"

interface ChannelWithCounts extends Channel {
  _count?: {
    members: number
    proposals: number
  }
}

interface ChannelsListProps {
  channels: ChannelWithCounts[]
}

export function ChannelsList({ channels }: ChannelsListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Channels</h2>
        <div className="space-x-2">
          <JoinChannelModal>
            <Button variant="outline">Join Channel</Button>
          </JoinChannelModal>
          <CreateChannelModal>
            <Button>Create Channel</Button>
          </CreateChannelModal>
        </div>
      </div>
      
      {channels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No channels yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first channel or join an existing one to get started
            </p>
            <div className="space-x-2">
              <JoinChannelModal>
                <Button variant="outline">Join with Invite Code</Button>
              </JoinChannelModal>
              <CreateChannelModal>
                <Button>Create Channel</Button>
              </CreateChannelModal>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link key={channel.id} href={`/c/${channel.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{channel.name}</CardTitle>
                  {channel.description && (
                    <CardDescription>{channel.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{channel._count?.members || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{channel._count?.proposals || 0} proposals</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 