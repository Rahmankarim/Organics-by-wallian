"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Shield, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCartStore, useAuthStore } from "@/lib/store"
import { toast } from "sonner"

interface CartItem {
  _id: string
  productId: number
  variantId?: string
  quantity: number
  price: number
  addedAt: Date
  product: {
    id: number
    name: string
    slug: string
    images: string[]
    inStock: boolean
    stockCount: number
  }
  variant?: {
    id: string
    name: string
    value: string
    price: number
    stockCount: number
  }
}

interface CartSummary {
  subtotal: number
  totalItems: number
  tax: number
  shipping: number
  total: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  
  const { updateQuantity, removeItem, isLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setIsLoadingCart(false)
        return
      }

      try {
        const response = await fetch('/api/cart', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setCartItems(data.items || [])
          setCartSummary(data.summary)
        } else {
          console.error('Failed to load cart')
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoadingCart(false)
      }
    }

    loadCart()
  }, [isAuthenticated])

  const handleUpdateQuantity = async (productId: number, newQuantity: number, variantId?: string) => {
    try {
      await updateQuantity(productId, newQuantity, variantId)
      
      // Reload cart data
      const response = await fetch('/api/cart', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
        setCartSummary(data.summary)
      }
    } catch (error) {
      toast.error('Failed to update quantity')
    }
  }

  const handleRemoveItem = async (productId: number, variantId?: string) => {
    try {
      await removeItem(productId, variantId)
      
      // Reload cart data
      const response = await fetch('/api/cart', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setCartItems(data.items || [])
        setCartSummary(data.summary)
      }
      
      toast.success('Item removed from cart')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setDiscount(10)
      toast.success('Promo code applied! 10% discount')
    } else if (promoCode.toLowerCase() === "organic20") {
      setDiscount(20)
      toast.success('Promo code applied! 20% discount')
    } else {
      toast.error('Invalid promo code')
      setDiscount(0)
    }
  }

  // Calculate final totals with discount
  const finalCalculations = cartSummary ? {
    subtotal: cartSummary.subtotal,
    tax: cartSummary.tax,
    shipping: cartSummary.shipping,
    discountAmount: (cartSummary.subtotal * discount) / 100,
    total: cartSummary.subtotal + cartSummary.tax + cartSummary.shipping - ((cartSummary.subtotal * discount) / 100)
  } : null

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
              <p className="text-gray-600 mb-6">
                You need to login to view your cart items.
              </p>
              <Link href="/login">
                <Button className="w-full bg-[#355E3B] hover:bg-[#2d4f31]">
                  Login to Continue
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#355E3B] mb-4" />
              <p className="text-gray-600">Loading your cart...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link href="/products">
                <Button className="w-full bg-[#355E3B] hover:bg-[#2d4f31]">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#355E3B] mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={`${item.productId}-${item.variantId || 'default'}`} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          {item.variant && (
                            <p className="text-sm text-gray-600">
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId, item.variantId)}
                          disabled={isLoading}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              disabled={item.quantity >= (item.variant?.stockCount || item.product.stockCount) || isLoading}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-xs text-gray-500">
                            Stock: {item.variant?.stockCount || item.product.stockCount}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-[#355E3B]">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{item.price} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-[#355E3B]" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {discount}% OFF Applied
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {finalCalculations && (
                  <>
                    <div className="flex justify-between">
                      <span>Subtotal ({cartSummary?.totalItems} items)</span>
                      <span>₹{finalCalculations.subtotal.toLocaleString()}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-₹{finalCalculations.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {finalCalculations.shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₹${finalCalculations.shipping}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax (18% GST)</span>
                      <span>₹{finalCalculations.tax.toLocaleString()}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-[#355E3B]">₹{finalCalculations.total.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <Link href="/checkout">
                  <Button className="w-full bg-[#355E3B] hover:bg-[#2d4f31] text-white h-12">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                </Link>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Free delivery on orders above ₹999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
