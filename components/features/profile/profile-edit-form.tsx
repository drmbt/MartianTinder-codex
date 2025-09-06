"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { ImageGallery } from "@/components/ui/image-gallery"
import { User, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProfileEditFormProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    bio: string | null
    images?: Array<{ id: string; url: string; order: number }>
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
  })
  const [uploadedImages, setUploadedImages] = useState<Array<{url: string, fileName: string}>>(
    user.images?.map(img => ({ url: img.url, fileName: img.url.split('/').pop() || '' })) || []
  )
  const [primaryImageUrl, setPrimaryImageUrl] = useState(user.image || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          image: primaryImageUrl || uploadedImages[0]?.url || null,
          images: uploadedImages.length > 0 ? uploadedImages : undefined,
        }),
      })

      if (response.ok) {
        router.push("/profile")
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const allImages = uploadedImages.map(img => img.url)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Profile Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Photos Gallery */}
          {allImages.length > 0 && (
            <div className="space-y-2">
              <Label>Current Photos</Label>
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <ImageGallery 
                  images={allImages}
                  alt="Profile photos"
                  className="w-full h-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="primaryImage" className="text-sm">Primary Photo URL:</Label>
                <select
                  id="primaryImage"
                  value={primaryImageUrl}
                  onChange={(e) => setPrimaryImageUrl(e.target.value)}
                  className="flex-1 px-2 py-1 border rounded-md text-sm"
                >
                  <option value="">Select primary photo</option>
                  {allImages.map((url, index) => (
                    <option key={url} value={url}>
                      Photo {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload New Photos</Label>
            <ImageUpload
              onUpload={(files) => {
                setUploadedImages(prev => [...prev, ...files.map(f => ({ url: f.url, fileName: f.fileName }))])
                // Set first image as primary if none selected
                if (!primaryImageUrl && files.length > 0) {
                  setPrimaryImageUrl(files[0].url)
                }
              }}
              onRemove={(fileName) => {
                const removedImage = uploadedImages.find(img => img.fileName === fileName)
                setUploadedImages(prev => prev.filter(img => img.fileName !== fileName))
                // Clear primary if it was the removed image
                if (removedImage && primaryImageUrl === removedImage.url) {
                  setPrimaryImageUrl("")
                }
              }}
              existingImages={allImages}
              subDir="users"
              maxFiles={10}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              You can upload up to 10 photos. The primary photo will be shown as your avatar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href="/profile" className="flex-1">
          <Button type="button" variant="outline" className="w-full gap-2" disabled={isLoading}>
            <ArrowLeft size={16} />
            Cancel
          </Button>
        </Link>
        
        <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
          <Save size={16} />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}