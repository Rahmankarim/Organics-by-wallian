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
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-16 h-16 text-[#6F4E37]" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#355E3B] mb-4">Your Cart is Empty</h1>
            <p className="text-[#6F4E37] mb-8 max-w-md mx-auto">
              Looks like you haven't added any premium organic dry fruits to your cart yet.
            </p>
            <Button size="lg" className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white" asChild>
              <Link href="/products">
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Shopping Cart</h1>
            <p className="text-gray-200">Review your selected premium organic dry fruits</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Cart Items ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#355E3B] mb-1">{item.name}</h3>
                      <p className="text-sm text-[#6F4E37] mb-2">Weight: {item.weight}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#355E3B]">₹{item.price}</span>
                          <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-[#355E3B]/20 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 text-[#355E3B] hover:bg-[#F4EBD0]"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 font-medium text-[#355E3B]">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-8 w-8 text-[#355E3B] hover:bg-[#F4EBD0]"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right mt-2">
                        <span className="font-semibold text-[#355E3B]">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="bg-white shadow-lg mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-[#355E3B]">Promo Code</h3>
                </div>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                  />
                  <Button onClick={applyPromoCode} className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white">
                    Apply
                  </Button>
                </div>
                {discount > 0 && <p className="text-green-600 text-sm mt-2">✓ {discount}% discount applied!</p>}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-white shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-[#355E3B]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-[#6F4E37]">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>You Save</span>
                  <span>-₹{savings}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount ({discount}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#6F4E37]">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>

                {subtotal < 999 && (
                  <p className="text-sm text-[#D4AF37] bg-[#D4AF37]/10 p-2 rounded">
                    Add ₹{999 - subtotal} more for free delivery!
                  </p>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold text-[#355E3B]">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Button size="lg" className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>

                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm text-[#6F4E37]">
                    <Truck className="w-4 h-4 text-[#D4AF37]" />
                    <span>Free delivery on orders above ₹999</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6F4E37]">
                    <Shield className="w-4 h-4 text-[#D4AF37]" />
                    <span>100% secure payment</span>
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
