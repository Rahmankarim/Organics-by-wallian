"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Package, Search, Eye, Edit, MoreHorizontal, DollarSign, ShoppingCart, TrendingUp, Truck, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  variantId?: string
  sku?: string
}

interface Address {
  type: 'home' | 'office' | 'other'
  firstName: string
  lastName: string
  company?: string
  address: string
  apartment?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

interface Order {
  _id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentIntentId?: string
  shippingAddress: Address
  billingAddress?: Address
  trackingNumber?: string
  shippingProvider?: string
  estimatedDelivery?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface OrdersResponse {
  orders: Order[]
  stats: {
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
    processingOrders: number
    shippedOrders: number
    deliveredOrders: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [updateStatus, setUpdateStatus] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [shippingProvider, setShippingProvider] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data = await response.json()

      if (response.ok) {
        setOrdersData(data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/orders/${selectedOrder.orderNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updateStatus,
          trackingNumber: trackingNumber || undefined,
          shippingProvider: shippingProvider || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order updated successfully!",
        })
        setShowOrderDialog(false)
        setSelectedOrder(null)
        setUpdateStatus("")
        setTrackingNumber("")
        setShippingProvider("")
        fetchOrders()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase()
    switch (lowerStatus) {
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "shipped":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "processing":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "confirmed":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100"
      case "pending":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "refunded":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  if (loading && !ordersData) {
    return (
      <div className="min-h-screen bg-[#F4EBD0] p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6F4E37]">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = ordersData?.stats
    ? [
        {
          title: "Total Orders",
          value: ordersData.stats.totalOrders.toString(),
          icon: ShoppingCart,
          color: "text-blue-600",
        },
        {
          title: "Total Revenue",
          value: `₹${ordersData.stats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: "text-green-600",
        },
        {
          title: "Pending Orders",
          value: ordersData.stats.pendingOrders.toString(),
          icon: Package,
          color: "text-orange-600",
        },
        {
          title: "Delivered Orders",
          value: ordersData.stats.deliveredOrders.toString(),
          icon: TrendingUp,
          color: "text-purple-600",
        },
      ]
    : []

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Order Management</h1>
              <p className="text-gray-600 mt-1">Track and manage customer orders</p>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#6F4E37] mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-[#355E3B]">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-full bg-gray-100">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <Package className="w-5 h-5" />
              Orders ({ordersData?.pagination.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : ordersData?.orders && ordersData.orders.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData?.orders.map((order) => (
                      <TableRow key={order.orderNumber}>
                        <TableCell>
                          <p className="font-medium text-[#355E3B]">{order.orderNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p className="text-sm text-[#6F4E37]">{order.shippingAddress.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{order.items.length} items</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-[#355E3B]">₹{order.total.toLocaleString()}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={order.paymentStatus === 'succeeded' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-[#6F4E37]">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setUpdateStatus(order.status)
                                  setTrackingNumber(order.trackingNumber || "")
                                  setShippingProvider(order.shippingProvider || "")
                                  setShowOrderDialog(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setUpdateStatus(order.status)
                                  setTrackingNumber(order.trackingNumber || "")
                                  setShippingProvider(order.shippingProvider || "")
                                  setShowOrderDialog(true)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {ordersData && ordersData.pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-[#6F4E37]">
                      Page {currentPage} of {ordersData.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(ordersData.pagination.pages, currentPage + 1))}
                      disabled={currentPage === ordersData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-[#355E3B] mb-2">No Orders Found</h3>
                <p className="text-[#6F4E37]">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters to see more results" 
                    : "Orders will appear here once customers start placing them"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#355E3B]">
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>View and update order information</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="bg-[#F4EBD0] p-4 rounded-lg space-y-2">
                  <p className="font-medium">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                  <p className="text-sm text-[#6F4E37]">{selectedOrder.shippingAddress.address}</p>
                  {selectedOrder.shippingAddress.apartment && (
                    <p className="text-sm text-[#6F4E37]">{selectedOrder.shippingAddress.apartment}</p>
                  )}
                  <p className="text-sm text-[#6F4E37]">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-[#6F4E37]">{selectedOrder.shippingAddress.country}</p>
                  <p className="text-sm text-[#6F4E37] font-medium">{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Payment Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F4E37]">Payment Method:</span>
                    <span className="font-medium">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F4E37]">Payment Status:</span>
                    <Badge className={selectedOrder.paymentStatus === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F4E37]">Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F4E37]">Tax:</span>
                    <span>₹{selectedOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#6F4E37]">Shipping:</span>
                    <span>₹{selectedOrder.shippingCost.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-sm">Discount:</span>
                      <span>-₹{selectedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold">
                    <span>Total:</span>
                    <span className="text-[#355E3B]">₹{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-[#355E3B] mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex gap-3 items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-[#6F4E37]">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Update Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#355E3B] flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Update Order Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status" className="text-[#355E3B] font-medium">
                      Order Status
                    </Label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger className="border-[#355E3B]/20 focus:border-[#D4AF37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="provider" className="text-[#355E3B] font-medium">
                      Shipping Provider
                    </Label>
                    <Select value={shippingProvider} onValueChange={setShippingProvider}>
                      <SelectTrigger className="border-[#355E3B]/20 focus:border-[#D4AF37]">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DHL">DHL</SelectItem>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="BlueDart">BlueDart</SelectItem>
                        <SelectItem value="IndiaPost">India Post</SelectItem>
                        <SelectItem value="Delhivery">Delhivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tracking" className="text-[#355E3B] font-medium">
                      Tracking Number
                    </Label>
                    <Input
                      id="tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrderDialog(false)}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateOrder} 
                  className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update Order"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
