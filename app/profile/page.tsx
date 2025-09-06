import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ProfileSettings } from "@/components/features/profile/profile-settings"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Fetch user with images
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-gray-600 text-sm">
              Manage your profile and app settings
            </p>
          </div>
          
          <ProfileSettings user={user} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 