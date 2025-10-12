'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthStore, useWishlistStore, useCartStore } from '@/lib/store'
import { AuthUtils } from '@/lib/auth-utils'

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    originalPrice: number
    images: string[]
    rating: number
    reviewCount: number
    inStock: boolean
    category: string
  }
  addedAt: string
}

export default function Wishlist() {
  const { isAuthenticated } = useAuthStore()
  const { items: wishlistProductIds, removeItem, loadWishlist } = useWishlistStore()
  const { addItem: addToCart } = useCartStore()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchWishlistDetails = async () => {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Load wishlist IDs first
        await loadWishlist()
        
        // Fetch detailed wishlist items
        const response = await AuthUtils.authenticatedFetch('/api/user/wishlist')
        
        if (response.ok) {
          const data = await response.json()
          setWishlistItems(data.items)
        } else {
          toast.error('Failed to fetch wishlist')
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        toast.error('Failed to load wishlist')
      } finally {
        setLoading(false)
      }
    }

    fetchWishlistDetails()
  }, [isAuthenticated, loadWishlist])

  const removeFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId))
    
    try {
      await removeItem(productId)
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId))
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error('Failed to remove item')
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCart({
        productId: item.product.id,
        quantity: 1,
        price: item.product.price,
        addedAt: new Date()
      })
      toast.success('Added to cart')
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center pt-6">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to view your wishlist.
            </p>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center pt-6">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-4">
              Start adding products to your wishlist to keep track of items you love.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#355E3B] mb-2">My Wishlist</h1>
        <p className="text-gray-600">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={item.product.images?.[0] || '/placeholder.jpg'}
                alt={item.product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => removeFromWishlist(item.product.id)}
                disabled={removingItems.has(item.product.id)}
              >
                {removingItems.has(item.product.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < Math.floor(item.product.rating) ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">({item.product.reviewCount})</span>
              </div>

              <h3 className="font-semibold text-[#355E3B] mb-2 line-clamp-2">
                {item.product.name}
              </h3>

              <Badge variant="secondary" className="mb-2">
                {item.product.category}
              </Badge>

              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-[#355E3B]">
                  Rs. {item.product.price.toLocaleString()}
                </span>
                {item.product.originalPrice > item.product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs. {item.product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-[#355E3B] hover:bg-[#2A4A2F]"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.product.inStock}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/products/${item.product.id}`}>
                    View
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
