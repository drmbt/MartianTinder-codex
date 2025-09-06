"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NextImageGallery } from "@/components/ui/next-image-gallery"
import { ThumbnailImage } from "@/components/ui/responsive-image"
import { User, Mail, Settings, Calendar, Bell, LogOut, Camera } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface ProfileSettingsProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    bio?: string | null
    images?: Array<{ id: string; url: string; order: number }>
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo Gallery */}
      {user.images && user.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} />
              Photo Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <NextImageGallery 
                images={user.images.map(img => img.url)}
                alt="Profile photos"
                className="w-full h-64"
              />
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {user.images.length} {user.images.length === 1 ? 'photo' : 'photos'}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {user.image ? (
                <ThumbnailImage
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="rounded-full"
                  size="h-16 w-16"
                />
              ) : (
                <User size={24} className="text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">
                {user.name || "Anonymous User"}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail size={16} />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Link href="/profile/edit">
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </Link>
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
                <Bell size={16} className="text-muted-foreground" />
                <span className="text-sm">Notifications</span>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
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
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <div className="space-y-1">
            <div>MartianTinder MVP v0.2</div>
            <div>Sprint 4 Development</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 