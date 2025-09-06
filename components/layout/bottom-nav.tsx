"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Activity, Plus, Calendar, User } from "lucide-react"

const tabs = [
  {
    name: "Feed",
    href: "/feed",
    icon: Home,
    description: "Discover proposals"
  },
  {
    name: "Activity", 
    href: "/activity",
    icon: Activity,
    description: "Your interactions"
  },
  {
    name: "Propose",
    href: "/propose", 
    icon: Plus,
    description: "Your proposals"
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar, 
    description: "Events & schedule"
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    description: "Settings & profile"
  }
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-2 py-1 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || 
                          (tab.href === "/feed" && pathname === "/") ||
                          (tab.href === "/propose" && pathname.startsWith("/proposals"))
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 