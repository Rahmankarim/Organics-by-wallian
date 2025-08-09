'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  onLoadingComplete?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoadingComplete,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleError = () => {
    setImageError(true)
    setImageLoading(false)
    onError?.()
  }

  const handleLoadingComplete = () => {
    setImageLoading(false)
    onLoadingComplete?.()
  }

  // Fallback image for errors
  const fallbackSrc = '/placeholder.jpg'

  // Generate blur data URL if not provided
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  if (imageError) {
    return (
      <div className={cn('relative overflow-hidden bg-gray-100', className)}>
        <Image
          src={fallbackSrc}
          alt={`Fallback for ${alt}`}
          width={width}
          height={height}
          fill={fill}
          quality={quality}
          className={cn(
            'transition-opacity duration-300',
            objectFit && `object-${objectFit}`,
            objectPosition && `object-${objectPosition}`
          )}
          sizes={sizes}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <span className="text-sm text-gray-400">Image not available</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#355E3B] rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          imageLoading ? 'opacity-0' : 'opacity-100',
          objectFit && `object-${objectFit}`,
          objectPosition && `object-${objectPosition}`
        )}
        onLoad={handleLoadingComplete}
        onError={handleError}
      />
    </div>
  )
}
