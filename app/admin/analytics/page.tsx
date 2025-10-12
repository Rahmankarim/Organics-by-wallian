"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7days")
  const [loading, setLoading] = useState(true)

  // Sample analytics data
  const salesData = [
    { name: "Mon", sales: 4200, orders: 12 },
    { name: "Tue", sales: 3800, orders: 9 },
    { name: "Wed", sales: 5200, orders: 15 },
    { name: "Thu", sales: 6100, orders: 18 },
    { name: "Fri", sales: 7300, orders: 22 },
    { name: "Sat", sales: 8900, orders: 28 },
    { name: "Sun", sales: 6700, orders: 19 },
  ]

  const categoryData = [
    { name: "Almonds", value: 35, sales: 45000 },
    { name: "Pistachios", value: 25, sales: 32000 },
    { name: "Dates", value: 20, sales: 25000 },
    { name: "Walnuts", value: 15, sales: 19000 },
    { name: "Others", value: 5, sales: 6000 },
  ]

  const monthlyRevenue = [
    { month: "Jan", revenue: 125000, target: 120000 },
    { month: "Feb", revenue: 135000, target: 130000 },
    { month: "Mar", revenue: 145000, target: 140000 },
    { month: "Apr", revenue: 155000, target: 150000 },
    { month: "May", revenue: 165000, target: 160000 },
    { month: "Jun", revenue: 175000, target: 170000 },
    { month: "Jul", revenue: 185000, target: 180000 },
  ]

  const COLORS = ["#355E3B", "#D4AF37", "#8B4513", "#CD853F", "#DEB887"]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const stats = [
    {
      title: "Total Revenue",
      value: "Rs. 1,85,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "New Customers",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Products Sold",
      value: "2,456",
      change: "+5.7%",
      trend: "up",
      icon: Package,
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#355E3B]">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {stat.change} from last period
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Sales Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Daily Sales & Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#355E3B" name="Sales (Rs.)" />
                <Bar dataKey="orders" fill="#D4AF37" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trend */}
      <Card className="bg-white shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="text-[#355E3B] flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#355E3B" 
                strokeWidth={3}
                name="Actual Revenue (Rs.)"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#D4AF37" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target Revenue (Rs.)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] text-lg">Top Performing Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Premium Kashmir Almonds</p>
              <p className="text-sm text-gray-600">Rs. 45,000 in sales</p>
              <p className="text-sm text-green-600">+22% from last period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] text-lg">Best Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Rajesh Kumar</p>
              <p className="text-sm text-gray-600">15 orders, Rs. 22,400 total</p>
              <p className="text-sm text-blue-600">VIP Customer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#355E3B] text-lg">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Monthly Growth</p>
              <p className="text-sm text-gray-600">Average 12.5% increase</p>
              <p className="text-sm text-green-600">Exceeding targets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
