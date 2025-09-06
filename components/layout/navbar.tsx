"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Calendar, Home, Activity, Plus } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-orange-600">
              🚀 MartianTinder
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  if (!session?.user) {
    return (
      <nav className="border-b bg-background">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-orange-600">
              🚀 MartianTinder
            </Link>
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/channels" className="text-xl font-bold text-orange-600">
              🚀 MartianTinder
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/feed" className="text-sm font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
                <Home size={16} />
                Feed
              </Link>
              <Link href="/activity" className="text-sm font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
                <Activity size={16} />
                Activity
              </Link>
              <Link href="/propose" className="text-sm font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
                <Plus size={16} />
                Propose
              </Link>
              <Link href="/calendar" className="text-sm font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
                <Calendar size={16} />
                Calendar
              </Link>
              <Link href="/profile" className="text-sm font-medium hover:text-orange-600 transition-colors flex items-center gap-1">
                <User size={16} />
                Profile
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/proposals/new">
              <Button size="sm">New Proposal</Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {session.user.name || session.user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
} 