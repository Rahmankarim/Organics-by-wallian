"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, Home, FileText } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { toast } from "sonner"

interface OrderDetails {
  id: string
  orderNumber: string
  total: number
  paymentStatus: string
  status: string
  paymentMethod: string
  createdAt: string
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  
  const orderId = searchParams.get('orderId')
  const paymentStatus = searchParams.get('payment')
  
  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }
    
    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const order = await response.json()
          setOrderDetails(order)
        } else {
          toast.error('Order not found')
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrderDetails()
  }, [orderId, router])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p>Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="text-center pt-6">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Order Not Found</h1>
              <p className="text-muted-foreground mb-4">
                We couldn't find the order you're looking for.
              </p>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }
  
  const getStatusIcon = () => {
    if (paymentStatus === 'success' || orderDetails.paymentStatus === 'succeeded') {
      return <CheckCircle className="h-16 w-16 text-green-500" />
    } else if (paymentStatus === 'cancelled' || orderDetails.paymentStatus === 'cancelled') {
      return <XCircle className="h-16 w-16 text-destructive" />
    } else if (paymentStatus === 'failed' || orderDetails.paymentStatus === 'failed') {
      return <XCircle className="h-16 w-16 text-destructive" />
    } else {
      return <Clock className="h-16 w-16 text-yellow-500" />
    }
  }
  
  const getStatusTitle = () => {
    if (paymentStatus === 'success' || orderDetails.paymentStatus === 'succeeded') {
      return 'Payment Successful!'
    } else if (paymentStatus === 'cancelled' || orderDetails.paymentStatus === 'cancelled') {
      return 'Payment Cancelled'
    } else if (paymentStatus === 'failed' || orderDetails.paymentStatus === 'failed') {
      return 'Payment Failed'
    } else {
      return 'Payment Pending'
    }
  }
  
  const getStatusMessage = () => {
    if (paymentStatus === 'success' || orderDetails.paymentStatus === 'succeeded') {
      return 'Your payment has been processed successfully. We will start preparing your order shortly.'
    } else if (paymentStatus === 'cancelled' || orderDetails.paymentStatus === 'cancelled') {
      return 'Your payment was cancelled. You can try again or contact support if you need help.'
    } else if (paymentStatus === 'failed' || orderDetails.paymentStatus === 'failed') {
      return 'Your payment could not be processed. Please try again or contact support.'
    } else {
      return 'Your payment is being processed. We will update you once it is confirmed.'
    }
  }
  
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'easypaisa':
        return 'EasyPaisa'
      case 'cod':
        return 'Cash on Delivery'
      case 'razorpay':
        return 'Card Payment'
      default:
        return method
    }
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {getStatusMessage()}
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Order Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-medium">{orderDetails.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium">Rs. {orderDetails.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Method:</span>
                    <p className="font-medium">{getPaymentMethodDisplay(orderDetails.paymentMethod)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Status:</span>
                    <p className="font-medium capitalize">{orderDetails.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Status:</span>
                    <p className="font-medium capitalize">{orderDetails.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">
                      {new Date(orderDetails.createdAt).toLocaleDateString('en-PK')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/orders/${orderDetails.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    View Order Details
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              
              {orderDetails.paymentStatus === 'succeeded' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">What's Next?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• We will send you an order confirmation email</li>
                    <li>• Your order will be processed within 1-2 business days</li>
                    <li>• You'll receive tracking information once shipped</li>
                    <li>• Expected delivery: 3-5 business days</li>
                  </ul>
                </div>
              )}
              
              {(orderDetails.paymentStatus === 'failed' || orderDetails.paymentStatus === 'cancelled') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-red-700 mb-3">
                    If you're experiencing issues with payment, please contact our support team.
                  </p>
                  <div className="flex gap-2">
                    <Link href="/contact">
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={() => router.push('/checkout')}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}