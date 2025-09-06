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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            🚀 MartianTinder
          </h1>
          <p className="text-lg text-muted-foreground">
            Community organization made simple. Propose, signal, coordinate.
          </p>
          <p className="text-sm text-muted-foreground">
            Swipe through proposals, signal support, and turn ideas into events.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/login">
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </Link>
          
          <p className="text-xs text-muted-foreground">
            Sign in with email to join your community
          </p>
        </div>
      </div>
    </div>
  )
}
