import { ReactNode } from "react"
import { Navbar } from "./navbar"
import { BottomNav } from "./bottom-nav"

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop navbar - hidden on mobile */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      {/* Main content with bottom padding for mobile nav */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile bottom navigation - hidden on desktop */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 