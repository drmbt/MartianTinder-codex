import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/features/auth/login-form"

export default async function LoginPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/channels")
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to MartianTinder
          </h1>
          <p className="text-gray-600">
            Sign in with your email to access your community
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
} 