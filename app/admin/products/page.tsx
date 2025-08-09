"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Package, Search, Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Product {
  _id: string
  id: number
  name: string
  price: number
  originalPrice: number
  images: string[]
  category: string
  inStock: boolean
  stockCount: number
  weight: string
  rating: number
  reviews: number
  badge: string
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function AdminProductsPage() {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "almonds", label: "Almonds" },
    { value: "pistachios", label: "Pistachios" },
    { value: "dates", label: "Dates" },
    { value: "walnuts", label: "Walnuts" },
    { value: "cashews", label: "Cashews" },
    { value: "gifts", label: "Gift Boxes" },
  ]

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm, categoryFilter, statusFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProductsData(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      const response = await fetch(`/api/admin/products/${deleteProductId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setShowDeleteDialog(false)
        setDeleteProductId(null)
        fetchProducts()
        alert("Product deleted successfully!")
      } else {
        alert("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product")
    }
  }

  const getStatusColor = (inStock: boolean) => {
    return inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  if (loading && !productsData) {
    return (
      <div className="min-h-screen bg-[#F4EBD0] p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#6F4E37]">Loading products...</p>
          </div>
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
            <h1 className="text-3xl font-serif font-bold text-[#355E3B]">Product Management</h1>
            <p className="text-gray-600 mt-1">Manage your organic dry fruits inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold" asChild>
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                />
              </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 border-[#355E3B]/20 focus:border-[#D4AF37] bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-[#355E3B] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Products ({productsData?.pagination.total || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsData?.products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12">
                              <Image
                                src={product.images[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-[#355E3B]">{product.name}</p>
                              <p className="text-sm text-[#6F4E37]">{product.weight}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[#355E3B] text-white capitalize">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-[#355E3B]">₹{product.price}</p>
                            <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{product.stockCount}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.inStock)}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-[#D4AF37]">★</span>
                            <span>{product.rating}</span>
                            <span className="text-sm text-gray-500">({product.reviews})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setDeleteProductId(product.id)
                                  setShowDeleteDialog(true)
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {productsData && productsData.pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-[#6F4E37]">
                      Page {currentPage} of {productsData.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(productsData.pagination.pages, currentPage + 1))}
                      disabled={currentPage === productsData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }
