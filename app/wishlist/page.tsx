"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, X, ShoppingCart, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/lib/store"
import { AuthUtils } from "@/lib/auth-utils"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number
    images: string[]
    rating: number
    reviewCount: number
    inStock: boolean
    category: string
  }
  addedAt: string
}

export default function WishlistPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return
      
      try {
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
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [isAuthenticated])

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await AuthUtils.authenticatedFetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product.id !== productId))
        toast.success('Removed from wishlist')
      } else {
        toast.error('Failed to remove from wishlist')
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove item')
    }
  }

  const addToCart = async (productId: string) => {
    try {
      const response = await AuthUtils.authenticatedFetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      })
      
      if (response.ok) {
        toast.success('Added to cart')
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'))
      } else {
        toast.error('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isAuthenticated) {
    return (
      <ProtectedRoute>
        <div></div>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0] flex items-center justify-center">
        <div className="text-[#355E3B]">Loading wishlist...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Page Header */}
      <section className="bg-[#355E3B] text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Wishlist</h1>
            <p className="text-gray-200">Your favorite premium organic dry fruits</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <Heart className="w-16 h-16 text-[#6F4E37] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#355E3B] mb-2">Your Wishlist is Empty</h3>
              <p className="text-[#6F4E37] mb-4">
                Start adding your favorite products to your wishlist.
              </p>
              <Link href="/products">
                <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#355E3B]">
                {wishlistItems.length} Item{wishlistItems.length !== 1 ? 's' : ''} in Wishlist
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  wishlistItems.forEach(item => {
                    if (item.product.inStock) {
                      addToCart(item.product.id)
                    }
                  })
                }}
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add All to Cart
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                      onClick={() => removeFromWishlist(item.product.id)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>

                    <CardHeader className="p-4">
                      <Link href={`/products/${item.product.id}`} className="block">
                        <div className="relative aspect-square mb-4">
                          <Image
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {!item.product.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                          )}
                        </div>
                      </Link>
                    </CardHeader>

                    <CardContent className="p-4 pt-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-[#355E3B] mb-2 hover:text-[#D4AF37] transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-[#6F4E37]">
                          ({item.product.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        {item.product.discountPrice ? (
                          <>
                            <span className="text-lg font-bold text-[#355E3B]">
                              {formatCurrency(item.product.discountPrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(item.product.price)}
                            </span>
                            <Badge className="bg-red-100 text-red-600">
                              {Math.round(((item.product.price - item.product.discountPrice) / item.product.price) * 100)}% OFF
                            </Badge>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#355E3B]">
                            {formatCurrency(item.product.price)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#6F4E37] mb-4">
                        Added on {formatDate(item.addedAt)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addToCart(item.product.id)}
                          disabled={!item.product.inStock}
                          className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-white disabled:opacity-50"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWishlist(item.product.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
