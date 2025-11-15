"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Edit, Save, Package, Heart, CreditCard, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const userProfile = {
  firstName: "Priya",
  lastName: "Sharma",
  email: "priya.sharma@email.com",
  phone: "+91 98765 43210",
  avatar: "/placeholder.svg?height=100&width=100",
  joinDate: "January 2024",
  totalOrders: 12,
  totalSpent: 15680,
  loyaltyPoints: 1568,
}

const recentOrders = [
  {
    id: "#ORD-001",
    date: "2024-01-15",
    status: "Delivered",
    total: 1899,
    items: 3,
  },
  {
    id: "#ORD-002",
    date: "2024-01-10",
    status: "Shipped",
    total: 2499,
    items: 2,
  },
  {
    id: "#ORD-003",
    date: "2024-01-05",
    status: "Processing",
    total: 1299,
    items: 1,
  },
]

const addresses = [
  {
    id: 1,
    type: "Home",
    name: "Priya Sharma",
    address: "123 Green Valley Apartments, Sector 15, Mumbai, Maharashtra 400001",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: 2,
    type: "Office",
    name: "Priya Sharma",
    address: "456 Business Park, Andheri East, Mumbai, Maharashtra 400069",
    phone: "+91 98765 43210",
    isDefault: false,
  },
]

const wishlistItems = [
  {
    id: 1,
    name: "Premium Kashmiri Almonds",
    price: 899,
    originalPrice: 1199,
    image: "/placeholder.svg?height=80&width=80",
    inStock: true,
  },
  {
    id: 2,
    name: "Royal Pistachios",
    price: 1299,
    originalPrice: 1599,
    image: "/placeholder.svg?height=80&width=80",
    inStock: true,
  },
  {
    id: 3,
    name: "Organic Dates Medley",
    price: 649,
    originalPrice: 799,
    image: "/placeholder.svg?height=80&width=80",
    inStock: false,
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(userProfile)

  const handleSave = () => {
    setIsEditing(false)
    // Save to API
    console.log("Profile saved:", profileData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Shipped":
        return "bg-blue-100 text-blue-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
            className="flex items-center gap-6"
          >
            <div className="relative">
              <Image
                src={profileData.avatar || "/placeholder.svg"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-[#D4AF37]"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-gray-200 mb-2">Member since {profileData.joinDate}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {profileData.totalOrders} Orders
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />Rs. {profileData.totalSpent.toLocaleString()} Spent
                </span>
                <Badge className="bg-[#D4AF37] text-[#355E3B]">{profileData.loyaltyPoints} Points</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-[#355E3B]/20 mb-8">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white">
              Orders
            </TabsTrigger>
            <TabsTrigger value="addresses" className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white">
              Addresses
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white">
              Wishlist
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#355E3B] flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#355E3B] font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#355E3B] font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#355E3B] font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#355E3B] font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4 bg-[#F4EBD0]">
                    <div className="text-center">
                      <Package className="w-8 h-8 text-[#355E3B] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#355E3B]">{profileData.totalOrders}</p>
                      <p className="text-sm text-[#6F4E37]">Total Orders</p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-[#F4EBD0]">
                    <div className="text-center">
                      <CreditCard className="w-8 h-8 text-[#355E3B] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#355E3B]">Rs. {profileData.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-[#6F4E37]">Total Spent</p>
                    </div>
                  </Card>

                  <Card className="p-4 bg-[#F4EBD0]">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-[#355E3B] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-[#355E3B]">{profileData.loyaltyPoints}</p>
                      <p className="text-sm text-[#6F4E37]">Loyalty Points</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#355E3B]">{order.id}</h3>
                          <p className="text-sm text-[#6F4E37]">{order.date}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#6F4E37]">{order.items} items</p>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-[#355E3B]">Rs. {order.total}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#355E3B] text-[#355E3B] bg-transparent"
                            asChild
                          >
                            <Link href={`/orders/${order.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-[#355E3B] flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Saved Addresses
                  </CardTitle>
                  <Button className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white">Add New Address</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#355E3B]">{address.type}</h3>
                          {address.isDefault && <Badge className="bg-[#D4AF37] text-[#355E3B]">Default</Badge>}
                        </div>
                        <Button variant="ghost" size="sm" className="text-[#355E3B]">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-[#6F4E37] mb-1">{address.name}</p>
                      <p className="text-[#6F4E37] mb-1">{address.address}</p>
                      <p className="text-[#6F4E37]">{address.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#355E3B] flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  My Wishlist ({wishlistItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#355E3B] mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-[#355E3B]">Rs. {item.price}</span>
                          <span className="text-sm text-gray-500 line-through">Rs. {item.originalPrice}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                            disabled={!item.inStock}
                          >
                            {item.inStock ? "Add to Cart" : "Out of Stock"}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
