"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Search, Eye, MoreHorizontal, Mail, Phone } from "lucide-react"

interface Customer {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  joinedAt: string
  status: "active" | "inactive"
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Sample customer data
  const sampleCustomers: Customer[] = [
    {
      _id: "1",
      id: "CUST001",
      name: "Arjun Sharma",
      email: "arjun.sharma@email.com",
      phone: "+91 98765 43210",
      totalOrders: 12,
      totalSpent: 15600,
      joinedAt: "2024-01-15",
      status: "active"
    },
    {
      _id: "2",
      id: "CUST002",
      name: "Priya Patel",
      email: "priya.patel@email.com",
      phone: "+91 87654 32109",
      totalOrders: 8,
      totalSpent: 9200,
      joinedAt: "2024-02-20",
      status: "active"
    },
    {
      _id: "3",
      id: "CUST003",
      name: "Rajesh Kumar",
      email: "rajesh.kumar@email.com",
      phone: "+91 76543 21098",
      totalOrders: 15,
      totalSpent: 22400,
      joinedAt: "2023-11-10",
      status: "active"
    },
    {
      _id: "4",
      id: "CUST004",
      name: "Anita Singh",
      email: "anita.singh@email.com",
      phone: "+91 65432 10987",
      totalOrders: 5,
      totalSpent: 4800,
      joinedAt: "2024-03-05",
      status: "active"
    },
    {
      _id: "5",
      id: "CUST005",
      name: "Vikram Mehta",
      email: "vikram.mehta@email.com",
      phone: "+91 54321 09876",
      totalOrders: 0,
      totalSpent: 0,
      joinedAt: "2024-07-15",
      status: "inactive"
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCustomers(sampleCustomers)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  )

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#355E3B]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-[#355E3B]">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-[#D4AF37]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Top Spender</p>
                <p className="text-2xl font-bold text-[#D4AF37]">₹22,400</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Orders</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#355E3B] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer List ({filteredCustomers.length} customers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
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
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>{new Date(customer.joinedAt).toLocaleDateString()}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
