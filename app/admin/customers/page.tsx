"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, Eye, MoreHorizontal, Mail, Phone, TrendingUp, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  totalOrders: number
  totalSpent: number
  joinedAt: string
  status: "active" | "inactive"
  isEmailVerified: boolean
}

interface CustomersResponse {
  customers: Customer[]
  stats: {
    totalCustomers: number
    activeCustomers: number
    newCustomersThisMonth: number
    totalRevenue: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminCustomersPage() {
  const { toast } = useToast()
  const [customersData, setCustomersData] = useState<CustomersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setCustomersData(data)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch customers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 hover:bg-green-100" 
      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }

  if (loading && !customersData) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  const stats = customersData?.stats
    ? [
        {
          title: "Total Customers",
          value: customersData.stats.totalCustomers.toString(),
          icon: Users,
          color: "text-[#355E3B]",
        },
        {
          title: "Active Customers",
          value: customersData.stats.activeCustomers.toString(),
          icon: TrendingUp,
          color: "text-green-600",
        },
        {
          title: "New This Month",
          value: customersData.stats.newCustomersThisMonth.toString(),
          icon: Users,
          color: "text-blue-600",
        },
        {
          title: "Total Revenue",
          value: `₹${customersData.stats.totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: "text-[#D4AF37]",
        },
      ]
    : []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Customer Management</h1>
            <p className="text-gray-600 mt-1">Manage your customer base and relationships</p>
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

      {/* Search */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#355E3B] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customers ({customersData?.pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : customersData?.customers && customersData.customers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersData.customers.map((customer) => (
                      <TableRow key={customer._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                            {customer.isEmailVerified && (
                              <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell className="font-semibold">₹{customer.totalSpent.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(customer.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {customersData && customersData.pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-[#6F4E37]">
                    Page {currentPage} of {customersData.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(customersData.pagination.pages, currentPage + 1))}
                    disabled={currentPage === customersData.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-[#355E3B] mb-2">No Customers Found</h3>
              <p className="text-[#6F4E37]">
                {searchTerm
                  ? "Try adjusting your search to see more results"
                  : "Customers will appear here once they register on your website"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
