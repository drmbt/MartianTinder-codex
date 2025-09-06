import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/features/auth/login-form"

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/channels")
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to MartianTinder
          </h1>
          <p className="text-muted-foreground">
            Sign in with your email to access your community
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
} 