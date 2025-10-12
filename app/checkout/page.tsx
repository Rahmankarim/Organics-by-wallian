"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Truck, MapPin, Phone, Mail, Shield, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CartItem {
  _id: string
  productId: number
  variantId?: string
  quantity: number
  price: number
  product: {
    id: number
    name: string
    slug: string
    images: string[]
  }
  variant?: {
    id: string
    name: string
    value: string
    price: number
  }
}

interface CartSummary {
  subtotal: number
  totalItems: number
  tax: number
  shipping: number
  total: number
}

interface CheckoutData {
  cartItems: CartItem[]
  cartSummary: CartSummary
}

interface ShippingAddress {
  fullName: string
  phoneNumber: string
  email: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  landmark: string
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phoneNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    landmark: ""
  })
  const [paymentMethod, setPaymentMethod] = useState("easypaisa")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [orderNotes, setOrderNotes] = useState("")
  
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  // Load cart data and validate checkout
  useEffect(() => {
    const loadCheckoutData = async () => {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/cart', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (!data.items || data.items.length === 0) {
            router.push('/cart')
            toast.error('Your cart is empty')
            return
          }
          
          setCheckoutData({
            cartItems: data.items,
            cartSummary: data.summary
          })

          // Pre-fill user information if available
          if (user) {
            setShippingAddress(prev => ({
              ...prev,
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              email: user.email || "",
              phoneNumber: user.phone || ""
            }))
          }
        } else {
          throw new Error('Failed to load cart')
        }
      } catch (error) {
        console.error('Error loading checkout data:', error)
        toast.error('Failed to load checkout data')
        router.push('/cart')
      } finally {
        setIsLoadingCart(false)
      }
    }

    loadCheckoutData()
  }, [isAuthenticated, router, user])

  const updateShippingAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): boolean => {
    const required = ['fullName', 'phoneNumber', 'email', 'addressLine1', 'city', 'state', 'pincode']
    
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address')
      return false
    }

    // Validate phone number (Pakistani format)
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
    if (!phoneRegex.test(shippingAddress.phoneNumber)) {
      toast.error('Please enter a valid Pakistani mobile number (11 digits starting with 03)')
      return false
    }

    // Validate postal code (Pakistani format)
    const pincodeRegex = /^\d{5}$/
    if (!pincodeRegex.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 5-digit postal code')
      return false
    }

    return true
  }

  const initiatePayment = async () => {
    if (!validateForm() || !checkoutData) {
      return
    }

    setIsProcessingPayment(true)

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: checkoutData.cartItems,
          shippingAddress,
          paymentMethod,
          orderNotes,
          summary: checkoutData.cartSummary
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const order = await orderResponse.json()

      if (paymentMethod === 'cod') {
        // Cash on Delivery - redirect to success page
        router.push(`/orders/${order.id}?payment=success`)
        toast.success('Order placed successfully!')
        return
      }

      // EasyPaisa payment
      if (paymentMethod === 'easypaisa') {
        try {
          const easyPaisaResponse = await fetch('/api/easypaisa/initiate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              orderId: order.id,
              amount: checkoutData.cartSummary.total,
              customerPhone: shippingAddress.phoneNumber,
              customerEmail: shippingAddress.email,
              returnUrl: `${window.location.origin}/order-success?orderId=${order.id}&payment=success`,
              cancelUrl: `${window.location.origin}/order-success?orderId=${order.id}&payment=cancelled`
            })
          })

          const easyPaisaData = await easyPaisaResponse.json()

          if (easyPaisaData.success && easyPaisaData.redirectUrl) {
            // Redirect to EasyPaisa payment page
            window.location.href = easyPaisaData.redirectUrl
            return
          } else {
            throw new Error(easyPaisaData.error || 'Failed to initiate EasyPaisa payment')
          }
        } catch (error: any) {
          console.error('EasyPaisa payment error:', error)
          toast.error(error.message || 'Failed to process EasyPaisa payment')
          setIsProcessingPayment(false)
          return
        }
      }

      // Razorpay payment
      if (paymentMethod === 'razorpay') {
        // Load Razorpay script
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: Math.round(checkoutData.cartSummary.total * 100), // Amount in paise
            currency: 'INR',
            name: 'Luxury Dry Fruits',
            description: `Order #${order.orderNumber}`,
            order_id: order.razorpayOrderId,
            handler: async function (response: any) {
              try {
                // Verify payment
                const verifyResponse = await fetch('/api/orders/verify-payment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    orderId: order.id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpaySignature: response.razorpay_signature
                  })
                })

                if (verifyResponse.ok) {
                  router.push(`/orders/${order.id}?payment=success`)
                  toast.success('Payment successful!')
                } else {
                  throw new Error('Payment verification failed')
                }
              } catch (error) {
                console.error('Payment verification error:', error)
                toast.error('Payment verification failed')
                router.push(`/orders/${order.id}?payment=failed`)
              }
            },
            prefill: {
              name: shippingAddress.fullName,
              email: shippingAddress.email,
              contact: shippingAddress.phoneNumber,
            },
            notes: {
              address: `${shippingAddress.addressLine1}, ${shippingAddress.city}`,
            },
            theme: {
              color: '#355E3B',
            },
            modal: {
              ondismiss: function () {
                setIsProcessingPayment(false)
                toast.error('Payment cancelled')
              }
            }
          }

          const razorpay = new (window as any).Razorpay(options)
          razorpay.open()
        }

        script.onerror = () => {
          toast.error('Failed to load payment gateway')
          setIsProcessingPayment(false)
        }
      }

    } catch (error) {
      console.error('Payment initiation error:', error)
      toast.error('Failed to process payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#355E3B] mb-4" />
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!checkoutData) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-[#355E3B] hover:underline mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-[#355E3B] mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#355E3B]" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => updateShippingAddress('fullName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={shippingAddress.phoneNumber}
                      onChange={(e) => updateShippingAddress('phoneNumber', e.target.value)}
                      placeholder="Enter mobile number (03xxxxxxxxx)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => updateShippingAddress('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => updateShippingAddress('addressLine1', e.target.value)}
                    placeholder="House/Flat number, Building name"
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) => updateShippingAddress('addressLine2', e.target.value)}
                    placeholder="Street, Area, Colony"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => updateShippingAddress('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Province *</Label>
                    <Select value={shippingAddress.state} onValueChange={(value) => updateShippingAddress('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="punjab">Punjab</SelectItem>
                        <SelectItem value="sindh">Sindh</SelectItem>
                        <SelectItem value="khyber-pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                        <SelectItem value="balochistan">Balochistan</SelectItem>
                        <SelectItem value="gilgit-baltistan">Gilgit-Baltistan</SelectItem>
                        <SelectItem value="azad-kashmir">Azad Jammu & Kashmir</SelectItem>
                        <SelectItem value="islamabad">Islamabad Capital Territory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Postal Code *</Label>
                    <Input
                      id="pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) => updateShippingAddress('pincode', e.target.value)}
                      placeholder="5-digit postal code"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={shippingAddress.landmark}
                    onChange={(e) => updateShippingAddress('landmark', e.target.value)}
                    placeholder="Nearby landmark"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#355E3B]" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="easypaisa" id="easypaisa" />
                    <Label htmlFor="easypaisa" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">EasyPaisa</p>
                          <p className="text-sm text-gray-600">Pay securely with EasyPaisa wallet</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Credit/Debit Card, UPI, Net Banking</p>
                          <p className="text-sm text-gray-600">Powered by Razorpay</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Special instructions for delivery..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {checkoutData.cartItems.map((item) => (
                    <div key={`${item.productId}-${item.variantId || 'default'}`} className="flex gap-3">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-600">{item.variant.name}: {item.variant.value}</p>
                        )}
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({checkoutData.cartSummary.totalItems} items)</span>
                    <span>Rs. {checkoutData.cartSummary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {checkoutData.cartSummary.shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `Rs. ${checkoutData.cartSummary.shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18% GST)</span>
                    <span>Rs. {checkoutData.cartSummary.tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#355E3B]">Rs. {checkoutData.cartSummary.total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={initiatePayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-[#355E3B] hover:bg-[#2d4f31] text-white h-12"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Place Order (COD)
                    </>
                  ) : paymentMethod === 'easypaisa' ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with EasyPaisa - Rs. {checkoutData.cartSummary.total.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Rs. {checkoutData.cartSummary.total.toLocaleString()}
                    </>
                  )}
                </Button>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span>Secure SSL encrypted payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3 text-blue-600" />
                    <span>Free delivery on orders above Rs. 999</span>
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
