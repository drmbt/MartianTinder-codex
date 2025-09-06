"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { GalleryImage } from "./responsive-image"
import Image from "next/image"

interface NextImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
  showControls?: boolean
  showDots?: boolean
  autoHeight?: boolean
}

export function NextImageGallery({ 
  images, 
  alt = "Gallery image", 
  className = "",
  showControls = true,
  showDots = true,
  autoHeight = false
}: NextImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle touch events for mobile
  const handleTouchStart = useRef<number>(0)
  const handleTouchMove = useRef<number>(0)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!images || images.length <= 1) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images, goToNext, goToPrevious])

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[200px] ${className}`}>
        <div className="text-gray-400 dark:text-gray-500 text-4xl">📷</div>
      </div>
    )
  }

  // Handle touch/click events for left/right tap navigation
  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const clickX = event.clientX - rect.left
    const containerWidth = rect.width
    const threshold = containerWidth / 2

    if (clickX < threshold) {
      goToPrevious()
    } else {
      goToNext()
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.touches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchMove.current = e.touches[0].clientX
  }

  const onTouchEnd = () => {
    if (images.length <= 1) return

    const touchDiff = handleTouchStart.current - handleTouchMove.current
    const minSwipeDistance = 50

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 min-h-[200px] max-w-full ${className}`}
      onClick={handleImageClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main image */}
      <div className="relative">

        <div className="relative w-full aspect-[4/5]">
          <Image
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={currentIndex === 0}
          />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Navigation arrows - only show on hover/desktop */}
      {images.length > 1 && showControls && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-none h-8 w-8 p-0 opacity-0 hover:opacity-100 transition-opacity duration-200 hidden sm:flex"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white border-none h-8 w-8 p-0 opacity-0 hover:opacity-100 transition-opacity duration-200 hidden sm:flex"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight size={16} />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 