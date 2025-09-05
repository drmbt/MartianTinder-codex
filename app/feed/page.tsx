import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"
import { FeedClient } from "@/components/features/feed/feed-client"

export default async function FeedPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <AuthenticatedLayout>
      <FeedClient userId={session.user.id} />
    </AuthenticatedLayout>
  )
} 