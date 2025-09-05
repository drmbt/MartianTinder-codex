import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/feed")
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🚀 MartianTinder
          </h1>
          <p className="text-lg text-gray-600">
            Community organization made simple. Propose, signal, coordinate.
          </p>
          <p className="text-sm text-gray-500">
            Swipe through proposals, signal support, and turn ideas into events.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
          
          <p className="text-xs text-gray-400">
            Sign in with email to join your community
          </p>
        </div>
      </div>
    </div>
  )
}
