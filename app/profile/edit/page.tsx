import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { ProfileEditForm } from "@/components/features/profile/profile-edit-form"

export default async function EditProfilePage() {
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
    redirect("/profile")
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-gray-600 text-sm">
              Update your profile information and photos
            </p>
          </div>
          
          <ProfileEditForm user={user} />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}