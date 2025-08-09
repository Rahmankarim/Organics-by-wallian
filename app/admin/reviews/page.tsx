"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, Search, Eye, MoreHorizontal, Star, ThumbsUp, ThumbsDown } from "lucide-react"

interface Review {
  _id: string
  id: string
  customerName: string
  productName: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  productId: number
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample reviews data
  const sampleReviews: Review[] = [
    {
      _id: "1",
      id: "REV001",
      customerName: "Arjun Sharma",
      productName: "Premium Kashmir Almonds",
      rating: 5,
      comment: "Excellent quality almonds! Very fresh and crunchy. Will definitely order again.",
      status: "approved",
      createdAt: "2024-08-09T10:30:00Z",
      productId: 1
    },
    {
      _id: "2",
      id: "REV002",
      customerName: "Priya Patel",
      productName: "California Pistachios",
      rating: 4,
      comment: "Good quality pistachios, but packaging could be better. Taste is amazing though.",
      status: "pending",
      createdAt: "2024-08-08T15:45:00Z",
      productId: 2
    },
    {
      _id: "3",
      id: "REV003",
      customerName: "Rajesh Kumar",
      productName: "Medjool Dates",
      rating: 5,
      comment: "Best dates I've ever had! Soft, sweet, and perfectly sized. Highly recommended!",
      status: "approved",
      createdAt: "2024-08-07T09:15:00Z",
      productId: 3
    },
    {
      _id: "4",
      id: "REV004",
      customerName: "Anita Singh",
      productName: "English Walnuts",
      rating: 3,
      comment: "Walnuts are okay but some pieces were broken. Expected better quality for the price.",
      status: "pending",
      createdAt: "2024-08-06T11:20:00Z",
      productId: 4
    },
    {
      _id: "5",
      id: "REV005",
      customerName: "Vikram Mehta",
      productName: "Premium Cashews",
      rating: 5,
      comment: "Outstanding cashews! Buttery, fresh, and perfectly roasted. Best purchase ever!",
      status: "approved",
      createdAt: "2024-08-05T14:10:00Z",
      productId: 5
    },
    {
      _id: "6",
      id: "REV006",
      customerName: "Sneha Gupta",
      productName: "Mixed Dry Fruits Gift Box",
      rating: 2,
      comment: "Very disappointed with this product. Some nuts were stale and the packaging was damaged.",
      status: "rejected",
      createdAt: "2024-08-04T16:30:00Z",
      productId: 6
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(sampleReviews)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleApproveReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId ? { ...review, status: "approved" as const } : review
    ))
  }

  const handleRejectReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId ? { ...review, status: "rejected" as const } : review
    ))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ))
  }

  const stats = [
    {
      title: "Total Reviews",
      value: reviews.length,
      icon: Heart,
      color: "text-[#355E3B]"
    },
    {
      title: "Pending Approval",
      value: reviews.filter(r => r.status === "pending").length,
      icon: Heart,
      color: "text-yellow-600"
    },
    {
      title: "Approved",
      value: reviews.filter(r => r.status === "approved").length,
      icon: Heart,
      color: "text-green-600"
    },
    {
      title: "Average Rating",
      value: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1),
      icon: Star,
      color: "text-[#D4AF37]"
    }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
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
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Review Management</h1>
            <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#355E3B]">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                <Input
                  placeholder="Search reviews by customer, product, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#355E3B]/20 rounded-md focus:border-[#D4AF37] bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#355E3B] flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Customer Reviews ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">{review.id}</TableCell>
                    <TableCell>{review.customerName}</TableCell>
                    <TableCell className="max-w-xs truncate">{review.productName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm">({review.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate" title={review.comment}>
                        {review.comment}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
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
                          {review.status === "pending" && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleApproveReview(review._id)}
                                className="text-green-600"
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectReview(review._id)}
                                className="text-red-600"
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
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
