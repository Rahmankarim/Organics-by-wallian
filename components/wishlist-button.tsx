'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWishlistStore, useAuthStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showText?: boolean
}

export default function WishlistButton({
  productId,
  className,
  size = 'md',
  variant = 'ghost',
  showText = false
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuthStore()
  const { items, addItem, removeItem, isInWishlist } = useWishlistStore()
  const [isLoading, setIsLoading] = useState(false)
  
  const inWishlist = isInWishlist(productId)

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      return
    }

    setIsLoading(true)
    try {
      if (inWishlist) {
        const ok = await removeItem(productId)
        if (ok) toast.success('Removed from wishlist')
        else toast.error('Failed to remove from wishlist')
      } else {
        const ok = await addItem(productId)
        if (ok) toast.success('Added to wishlist')
        else toast.error('Failed to add to wishlist')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <Button
      variant={variant}
      size={showText ? 'default' : 'icon'}
      className={cn(
        !showText && sizeClasses[size],
        'transition-colors',
        inWishlist && 'text-red-500',
        className
      )}
      onClick={handleToggleWishlist}
      disabled={isLoading}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          inWishlist && 'fill-current',
          showText && 'mr-2'
        )} 
      />
      {showText && (inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
    </Button>
  )
}