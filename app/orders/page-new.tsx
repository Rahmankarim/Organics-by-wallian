"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Eye, Download, Truck, MapPin, Calendar, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuthStore } from "@/lib/store"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  shipping: number
  tax: number
  discount?: number
  items: Array<{
    id: string
    product: {
      id: string
      name: string
      image: string
      price: number
    }
    quantity: number
    price: number
  }>
  shippingAddress: any
  billingAddress: any
  paymentMethod: string
  paymentId?: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveryDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return
      
      try {
        const token = localStorage.getItem('auth-token')
        const response = await fetch('/api/user/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setOrders(data.orders)
          setFilteredOrders(data.orders)
        } else {
          toast.error('Failed to fetch orders')
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  if (!isAuthenticated) {
    return <ProtectedRoute />
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0] flex items-center justify-center">
        <div className="text-[#355E3B]">Loading orders...</div>
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Orders</h1>
            <p className="text-gray-200">Track and manage your premium organic dry fruit orders</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="bg-white shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                  <Input
                    placeholder="Search by order ID or product name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-[#6F4E37] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#355E3B] mb-2">No Orders Found</h3>
                <p className="text-[#6F4E37] mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "No orders match your current filters." 
                    : "You haven't placed any orders yet."}
                </p>
                <Link href="/products">
                  <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-[#355E3B] flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order {order.orderNumber}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-[#6F4E37]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <span className="text-xl font-bold text-[#355E3B]">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item, itemIndex) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-[#F4EBD0] rounded-lg">
                          <Image
                            src={item.product.image || "/placeholder.svg"}
                            alt={item.product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#355E3B]">{item.product.name}</h4>
                            <p className="text-sm text-[#6F4E37]">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#355E3B]">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Information */}
                    <div className="border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Delivery Address
                          </h5>
                          <p className="text-sm text-[#6F4E37]">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                            {order.shippingAddress.address}<br />
                            {order.shippingAddress.apartment && `${order.shippingAddress.apartment}, `}
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                        </div>
                        
                        {order.trackingNumber && (
                          <div>
                            <h5 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Tracking
                            </h5>
                            <p className="text-sm text-[#6F4E37] font-mono">
                              {order.trackingNumber}
                            </p>
                            {order.estimatedDelivery && (
                              <p className="text-xs text-[#6F4E37] mt-1">
                                Estimated delivery: {formatDate(order.estimatedDelivery)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                      {order.status.toLowerCase() === 'delivered' && (
                        <Button variant="outline" size="sm" className="border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
