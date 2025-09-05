"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
  showControls?: boolean
  showDots?: boolean
  autoHeight?: boolean
}

export function ImageGallery({ 
  images, 
  alt = "Gallery image", 
  className = "",
  showControls = true,
  showDots = true,
  autoHeight = false
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-4xl">📷</div>
      </div>
    )
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
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

  // Handle touch events for mobile
  const handleTouchStart = useRef<number>(0)
  const handleTouchMove = useRef<number>(0)

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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return
      
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
  }, [images.length])

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}
      style={{ 
        minHeight: '200px',
        maxWidth: '100%'
      }}
      onClick={handleImageClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main image */}
      <div className="relative">
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className={`w-full transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${autoHeight ? 'h-auto object-contain' : 'h-full object-cover'}`}
          style={{
            maxHeight: autoHeight ? 'none' : '100%',
            objectFit: autoHeight ? 'contain' : 'cover'
          }}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
        
        {/* Loading placeholder */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-2xl">📷</div>
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
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
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
            />
          ))}
        </div>
      )}

      {/* Touch zones for mobile (invisible) */}
      {images.length > 1 && (
        <>
          <div className="absolute left-0 top-0 w-1/2 h-full md:hidden" />
          <div className="absolute right-0 top-0 w-1/2 h-full md:hidden" />
        </>
      )}
    </div>
  )
} 