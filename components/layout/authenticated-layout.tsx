import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Navbar } from "./navbar"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
} 