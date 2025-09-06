import Image from "next/image"
import { cn } from "@/lib/utils"

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  // Aspect ratio presets
  aspectRatio?: "4:5" | "square" | "auto"
  // Object fit options
  objectFit?: "cover" | "contain"
  // Object position for cropping
  objectPosition?: "center" | "top" | "bottom"
  // Sizes for responsive loading
  sizes?: string
  // Priority loading for above-the-fold images
  priority?: boolean
  // Quality
  quality?: number
  // Fill container (for absolute positioned images)
  fill?: boolean
  // Explicit dimensions
  width?: number
  height?: number
}

export function ResponsiveImage({
  src,
  alt,
  className = "",
  aspectRatio = "4:5",
  objectFit = "cover",
  objectPosition = "center",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  quality = 85,
  fill = false,
  width,
  height
}: ResponsiveImageProps) {
  // Calculate aspect ratio styles
  const aspectRatioClass = {
    "4:5": "aspect-[4/5]",
    "square": "aspect-square", 
    "auto": ""
  }[aspectRatio]

  // Object position mapping
  const objectPositionClass = {
    "center": "object-center",
    "top": "object-top", 
    "bottom": "object-bottom"
  }[objectPosition]

  // Object fit class
  const objectFitClass = objectFit === "cover" ? "object-cover" : "object-contain"

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(objectFitClass, objectPositionClass)}
          sizes={sizes}
          priority={priority}
          quality={quality}
        />
      </div>
    )
  }

  if (width && height) {
    return (
      <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(objectFitClass, objectPositionClass, "w-full h-full")}
          sizes={sizes}
          priority={priority}
          quality={quality}
        />
      </div>
    )
  }

  // Default fill behavior with aspect ratio container
  return (
    <div className={cn("relative overflow-hidden", aspectRatioClass, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(objectFitClass, objectPositionClass)}
        sizes={sizes}
        priority={priority}
        quality={quality}
      />
    </div>
  )
}

// Preset components for common use cases

// Feed card image - mobile-first 4:5 aspect ratio, top-justified crop
export function FeedCardImage({
  src,
  alt,
  className = "",
  priority = false
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      aspectRatio="4:5"
      objectFit="cover"
      objectPosition="top"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
      priority={priority}
    />
  )
}

// Thumbnail image - center-cropped square for activity/proposal cards
export function ThumbnailImage({
  src,
  alt,
  className = "",
  size = "h-16" // Default height, can be overridden
}: {
  src: string
  alt: string
  className?: string
  size?: string
}) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={cn(size, "w-auto", className)}
      aspectRatio="square"
      objectFit="cover"
      objectPosition="center"
      sizes="(max-width: 768px) 100px, 150px"
    />
  )
}

// Gallery image - auto aspect ratio, contain fit for full image viewing
export function GalleryImage({
  src,
  alt,
  className = "",
  priority = false
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      aspectRatio="auto"
      objectFit="contain"
      objectPosition="center"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      priority={priority}
    />
  )
} 