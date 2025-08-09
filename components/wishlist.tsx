'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import Link from 'next/link'

interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  inStock: boolean
  addedAt: Date
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate fetching wishlist items
    setTimeout(() => {
      setWishlistItems([
        {
          id: '1',
          productId: 'almond-premium',
          name: 'Premium Kashmir Almonds',
          price: 899,
          originalPrice: 999,
          image: '/Features/almond.jpg',
          category: 'Nuts',
          inStock: true,
          addedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          productId: 'dates-medjool',
          name: 'Medjool Dates',
          price: 1299,
          image: '/Features/dates.jpg',
          category: 'Dates',
          inStock: true,
          addedAt: new Date('2024-01-10')
        },
        {
          id: '3',
          productId: 'pistachios-premium',
          name: 'Premium Pistachios',
          price: 1599,
          originalPrice: 1799,
          image: '/Features/Pistachios.jpg',
          category: 'Nuts',
          inStock: false,
          addedAt: new Date('2024-01-08')
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(items => items.filter(item => item.id !== itemId))
    toast({
      title: "Removed from Wishlist",
      description: "Item has been removed from your wishlist.",
    })
  }

  const addToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive"
      })
      return
    }

    // Simulate adding to cart
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const moveAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock)
    if (inStockItems.length === 0) {
      toast({
        title: "No Items Available",
        description: "No items in your wishlist are currently in stock.",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Added to Cart",
      description: `${inStockItems.length} items have been added to your cart.`,
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link href="/products">
            <Button>
              Continue Shopping
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#355E3B]">My Wishlist</h2>
          <p className="text-gray-600">{wishlistItems.length} items saved</p>
        </div>
        {wishlistItems.some(item => item.inStock) && (
          <Button onClick={moveAllToCart} className="bg-[#355E3B] hover:bg-[#2d4f32]">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add All to Cart
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="rounded-lg object-cover"
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-[#355E3B] hover:underline">
                          {item.name}
                        </h3>
                      </Link>
                      <Badge variant="outline" className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-[#355E3B]">
                      ₹{item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{item.originalPrice}
                      </span>
                    )}
                    {item.originalPrice && (
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Added on {item.addedAt.toLocaleDateString()}
                    </span>
                    <Button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      size="sm"
                      className={item.inStock ? "bg-[#355E3B] hover:bg-[#2d4f32]" : ""}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
