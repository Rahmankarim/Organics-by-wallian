"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Star, ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, Award, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Product {
  _id?: string  // MongoDB ObjectId
  id: number    // Legacy numeric id for backward compatibility
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
  description: string
  features: string[]
  nutritionFacts: {
    calories: string
    protein: string
    fat: string
    carbs: string
    fiber: string
    vitaminE: string
  }
  benefits: string[]
}

interface Review {
  _id: string
  userId: {
    _id: string
    name: string
    avatar?: string
  }
  productId: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  verified: boolean
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        const data = await response.json()

        if (response.ok) {
          setProduct(data.product)
          setRelatedProducts(data.relatedProducts || [])
        } else {
          console.error("Product not found")
          router.push("/products")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        router.push("/products")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!params.id) return
      
      setReviewsLoading(true)
      try {
        const response = await fetch(`/api/reviews?productId=${params.id}`)
        const data = await response.json()
        
        if (response.ok) {
          setReviews(data.reviews || [])
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [params.id])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) return
        
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    fetchUser()
  }, [])

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    setAddingToCart(true)
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id, // Use numeric id - API will handle conversion
          quantity: quantity,
        }),
      })

      if (response.ok) {
        // Show success message or update cart count
        alert("Product added to cart successfully!")
        // You could also dispatch an event to update cart count in header
        window.dispatchEvent(new CustomEvent("cartUpdated"))
      } else {
        alert("Failed to add product to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding product to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a review",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    if (reviewRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive"
      })
      return
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a review comment",
        variant: "destructive"
      })
      return
    }

    setSubmittingReview(true)
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: params.id,
          rating: reviewRating,
          comment: reviewComment
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!"
        })
        setShowReviewForm(false)
        setReviewRating(0)
        setReviewComment("")
        
        // Refresh reviews
        const reviewsResponse = await fetch(`/api/reviews?productId=${params.id}`)
        const reviewsData = await reviewsResponse.json()
        if (reviewsResponse.ok) {
          setReviews(reviewsData.reviews || [])
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6F4E37]">Loading product details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#355E3B] mb-4">Product not found</h1>
            <Button asChild>
              <Link href="/products">Back to Products</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-[#6F4E37]">
          <Link href="/" className="hover:text-[#D4AF37]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#D4AF37]">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-[#D4AF37] capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#355E3B] font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <Badge className="absolute top-4 left-4 bg-[#D4AF37] text-[#355E3B]">{product.badge}</Badge>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-[#355E3B]"}`} />
              </Button>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? "border-[#D4AF37] shadow-lg" : "border-gray-200 hover:border-[#355E3B]"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-[#6F4E37] ml-2">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#355E3B] mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-[#355E3B]">Rs. {product.price}</span>
                <span className="text-xl text-gray-500 line-through">Rs. {product.originalPrice}</span>
                <Badge className="bg-green-100 text-green-800">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              </div>

              <p className="text-[#6F4E37] leading-relaxed mb-6">{product.description}</p>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#355E3B] mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-[#6F4E37]">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-medium ${product.inStock ? "text-green-700" : "text-red-700"}`}>
                  {product.inStock ? `In Stock (${product.stockCount} items available)` : "Out of Stock"}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-medium text-[#355E3B]">Quantity:</span>
                  <div className="flex items-center border border-[#355E3B]/20 rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="text-[#355E3B] hover:bg-[#F4EBD0]"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium text-[#355E3B]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="text-[#355E3B] hover:bg-[#F4EBD0]"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-[#6F4E37]">Total: Rs. {product.price * quantity}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="flex-1 bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addingToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white bg-transparent"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Truck, text: "Free Delivery" },
                  { icon: Shield, text: "Secure Payment" },
                  { icon: RotateCcw, text: "Easy Returns" },
                  { icon: Award, text: "Premium Quality" },
                ].map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-[#6F4E37]">
                    <badge.icon className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-sm">{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white border border-[#355E3B]/20">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white"
              >
                Nutrition Facts
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-[#355E3B] data-[state=active]:text-white">
                Reviews ({product.reviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#355E3B] mb-4">Product Description</h3>
                <p className="text-[#6F4E37] leading-relaxed mb-6">{product.description}</p>

                <h4 className="font-semibold text-[#355E3B] mb-3">Health Benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-[#6F4E37]">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-6">
              <Card className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-[#355E3B] mb-4">Nutrition Facts</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.entries(product.nutritionFacts).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-[#F4EBD0] rounded-lg">
                      <div className="text-2xl font-bold text-[#355E3B] mb-1">{value}</div>
                      <div className="text-sm text-[#6F4E37] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="p-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-[#355E3B]">Customer Reviews ({reviews.length})</h3>
                  <Button
                    variant="outline"
                    className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white bg-transparent"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </Button>
                </div>

                {showReviewForm && (
                  <Card className="p-4 bg-[#F4EBD0] mb-6">
                    <h4 className="font-semibold text-[#355E3B] mb-4">Write Your Review</h4>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#355E3B] mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 cursor-pointer transition-colors ${
                                rating <= reviewRating
                                  ? "fill-[#D4AF37] text-[#D4AF37]"
                                  : "text-gray-300 hover:text-[#D4AF37]"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-[#355E3B] mb-2">Your Review</label>
                      <Textarea
                        placeholder="Share your experience with this product..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="min-h-[100px] bg-white border-[#355E3B]/20"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </Card>
                )}

                {reviewsLoading ? (
                  <div className="text-center py-8 text-[#6F4E37]">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-[#6F4E37]">
                    <p>No reviews yet. Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[#355E3B]">{review.userId.name}</span>
                              {review.verified && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Verified Purchase</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-[#6F4E37]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h5 className="font-medium text-[#355E3B] mb-1">{review.title}</h5>
                        )}
                        <p className="text-[#6F4E37]">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-serif font-bold text-[#355E3B] mb-8 text-center">You Might Also Like</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group"
                >
                  <div className="relative">
                    <Image
                      src={relatedProduct.images?.[0] || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(relatedProduct.rating) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <h3 className="font-semibold text-[#355E3B] mb-2">{relatedProduct.name}</h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#355E3B]">Rs. {relatedProduct.price}</span>
                        <span className="text-sm text-gray-500 line-through">Rs. {relatedProduct.originalPrice}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white" asChild>
                      <Link href={`/products/${relatedProduct.id}`}>View Product</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </div>
  )
}
