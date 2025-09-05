"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Settings, Calendar, Bell, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface ProfileSettingsProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User size={24} className="text-orange-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">
                {user.name || "Anonymous User"}
              </h3>
              <div className="flex items-center gap-1 text-gray-600">
                <Mail size={16} />
                <span className="text-sm">{user.email}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={20} />
            App Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gray-500" />
                <span className="text-sm">Notifications</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm">Calendar Integration</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/channels">
            <Button variant="outline" className="w-full justify-start">
              Your Channels
            </Button>
          </Link>
          
          <Link href="/proposals/new">
            <Button variant="outline" className="w-full justify-start">
              Create Proposal
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            className="w-full gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6 text-center text-sm text-gray-500">
          <div className="space-y-1">
            <div>MartianTinder MVP v0.2</div>
            <div>Sprint 4 Development</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 