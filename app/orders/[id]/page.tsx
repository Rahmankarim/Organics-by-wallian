"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Package, Truck, CreditCard, MapPin, Phone, Mail, ArrowLeft, Download, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"

interface OrderItem {
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
  }
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    phoneNumber: string
    email: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  summary: {
    subtotal: number
    tax: number
    shipping: number
    total: number
    totalItems: number
  }
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentDetails?: {
    razorpayPaymentId?: string
    paidAt?: string
  }
  createdAt: string
  estimatedDelivery?: string
}

export default function OrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const orderId = params.id
  const paymentStatus = searchParams.get('payment')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
          
          // Show payment status toast
          if (paymentStatus === 'success') {
            toast.success('Payment successful! Order confirmed.')
          } else if (paymentStatus === 'failed') {
            toast.error('Payment failed. Please try again.')
          }
        } else {
          setError('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, isAuthenticated, router, paymentStatus])

  // Calculate estimated delivery date
  const getEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt)
    const deliveryDate = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)) // 5 days
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#355E3B] mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8">
              <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || 'The order you are looking for does not exist.'}
              </p>
              <Link href="/orders">
                <Button className="w-full bg-[#355E3B] hover:bg-[#2d4f31]">
                  View All Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const isPaymentSuccessful = order.paymentStatus === 'paid' || order.paymentMethod === 'cod'

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center text-[#355E3B] hover:underline mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            {isPaymentSuccessful ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-[#355E3B]">
                {isPaymentSuccessful ? 'Order Confirmed!' : 'Order Failed'}
              </h1>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Badge className={getStatusColor(order.paymentStatus)}>
              Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Badge>
          </div>

          {isPaymentSuccessful && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Truck className="h-5 w-5" />
                <span className="font-medium">
                  Estimated delivery: {getEstimatedDelivery(order.createdAt)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#355E3B]" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#355E3B]">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#355E3B]" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  {order.shippingAddress.landmark && (
                    <p className="text-gray-600">Near: {order.shippingAddress.landmark}</p>
                  )}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {order.shippingAddress.phoneNumber}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {order.shippingAddress.email}
                    </div>
                  </div>
                </div>
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
                <div className="flex justify-between">
                  <span>Subtotal ({order.summary.totalItems} items)</span>
                  <span>₹{order.summary.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {order.summary.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${order.summary.shipping}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span>₹{order.summary.tax.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#355E3B]">₹{order.summary.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#355E3B]" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                
                {order.paymentDetails?.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID</span>
                    <span className="text-sm font-mono">{order.paymentDetails.razorpayPaymentId}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                {order.paymentDetails?.paidAt && (
                  <div className="flex justify-between">
                    <span>Payment Date</span>
                    <span>{new Date(order.paymentDetails.paidAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              
              <Link href="/products">
                <Button className="w-full bg-[#355E3B] hover:bg-[#2d4f31]">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
