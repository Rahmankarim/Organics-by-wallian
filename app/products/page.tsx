"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Star, ShoppingCart, Heart, Filter, Search, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useSearchParams } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  images: string[]
  rating: number
  reviews: number
  badge: string
  category: string
  inStock: boolean
  stockCount: number
  weight: string
}

const categories = [
  { id: "all", name: "All Products" },
  { id: "almonds", name: "Almonds" },
  { id: "pistachios", name: "Pistachios" },
  { id: "dates", name: "Dates" },
  { id: "walnuts", name: "Walnuts" },
  { id: "cashews", name: "Cashews" },
  { id: "gifts", name: "Gift Boxes" },
]

const priceRanges = [
  { id: "0-500", name: "Under ₹500", min: 0, max: 500 },
  { id: "500-1000", name: "₹500 - ₹1000", min: 500, max: 1000 },
  { id: "1000-1500", name: "₹1000 - ₹1500", min: 1000, max: 1500 },
  { id: "1500+", name: "Above ₹1500", min: 1500, max: Number.POSITIVE_INFINITY },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [showInStockOnly, setShowInStockOnly] = useState(false)

  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        const data = await response.json()

        if (response.ok) {
          setProducts(data.products)
          setFilteredProducts(data.products)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by price ranges
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter((product) => {
        return selectedPriceRanges.some((rangeId) => {
          const range = priceRanges.find((r) => r.id === rangeId)
          if (!range) return false
          return product.price >= range.min && product.price <= range.max
        })
      })
    }

    // Filter by stock
    if (showInStockOnly) {
      filtered = filtered.filter((product) => product.inStock)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Keep original order for newest
        break
      default:
        // Featured - keep original order
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedPriceRanges, sortBy, searchQuery, showInStockOnly])

  useEffect(() => {
    const urlSearch = searchParams.get("search")
    const urlCategory = searchParams.get("category")

    if (urlSearch) {
      setSearchQuery(urlSearch)
    }

    if (urlCategory && urlCategory !== "all") {
      setSelectedCategory(urlCategory)
    }
  }, [searchParams])

  const handlePriceRangeChange = (rangeId: string, checked: boolean) => {
    if (checked) {
      setSelectedPriceRanges([...selectedPriceRanges, rangeId])
    } else {
      setSelectedPriceRanges(selectedPriceRanges.filter((id) => id !== rangeId))
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        // Show success message or update cart count
        alert("Product added to cart successfully!")
        // Dispatch event to update cart count in header
        window.dispatchEvent(new CustomEvent("cartUpdated"))
      } else {
        alert("Failed to add product to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding product to cart")
    }
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold text-[#355E3B] mb-3">Search Products</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6F4E37] w-4 h-4" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#355E3B]/20 focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-[#355E3B] mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id ? "bg-[#355E3B] text-white" : "text-[#6F4E37] hover:bg-[#F4EBD0]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-[#355E3B] mb-3">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <div key={range.id} className="flex items-center space-x-2">
              <Checkbox
                id={range.id}
                checked={selectedPriceRanges.includes(range.id)}
                onCheckedChange={(checked) => handlePriceRangeChange(range.id, checked as boolean)}
              />
              <Label htmlFor={range.id} className="text-[#6F4E37] cursor-pointer">
                {range.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="font-semibold text-[#355E3B] mb-3">Availability</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="in-stock" checked={showInStockOnly} onCheckedChange={setShowInStockOnly} />
          <Label htmlFor="in-stock" className="text-[#6F4E37] cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6F4E37]">Loading products...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Page Header */}
      <section className="bg-[#355E3B] text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Premium Organic Collection</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Discover our carefully curated selection of the finest organic dry fruits, sourced directly from premium
              orchards across India.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <FilterSidebar />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-[#6F4E37]">
                  Showing {filteredProducts.length} of {products.length} products
                </p>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center border border-[#355E3B]/20 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-[#355E3B] text-white" : "text-[#6F4E37]"}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-[#355E3B] text-white" : "text-[#6F4E37]"}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 border-[#355E3B]/20 focus:border-[#D4AF37]">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  {viewMode === "grid" ? (
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                      <div className="relative">
                        <Image
                          src={product.images?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#355E3B]">{product.badge}</Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-3 right-3 bg-white/80 hover:bg-white text-[#355E3B]"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Out of Stock</Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-[#6F4E37] ml-1">({product.reviews})</span>
                        </div>

                        <h3 className="text-lg font-semibold text-[#355E3B] mb-2">{product.name}</h3>

                        <p className="text-sm text-[#6F4E37] mb-3">Weight: {product.weight}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#355E3B]">₹{product.price}</span>
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-[#355E3B] hover:bg-[#2A4A2F] text-white text-sm"
                            disabled={!product.inStock}
                            onClick={() => handleAddToCart(product.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#355E3B] text-[#355E3B] bg-transparent"
                            asChild
                          >
                            <Link href={`/products/${product.id}`}>View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                      <div className="flex gap-6 p-6">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <Image
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <Badge className="absolute top-2 left-2 bg-[#D4AF37] text-[#355E3B] text-xs">
                            {product.badge}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-[#355E3B]">{product.name}</h3>
                            <Button size="icon" variant="ghost" className="text-[#355E3B] hover:text-[#D4AF37]">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-[#6F4E37] ml-1">({product.reviews})</span>
                          </div>

                          <p className="text-[#6F4E37] mb-3">Weight: {product.weight}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-[#355E3B]">₹{product.price}</span>
                              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white px-6"
                                disabled={!product.inStock}
                                onClick={() => handleAddToCart(product.id)}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                className="border-[#355E3B] text-[#355E3B] bg-transparent"
                                asChild
                              >
                                <Link href={`/products/${product.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 bg-[#F4EBD0] rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-[#6F4E37]" />
                </div>
                <h3 className="text-2xl font-semibold text-[#355E3B] mb-2">No products found</h3>
                <p className="text-[#6F4E37] mb-6">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedPriceRanges([])
                    setSearchQuery("")
                    setShowInStockOnly(false)
                  }}
                  className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
