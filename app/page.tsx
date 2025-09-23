"use client"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, ArrowRight, Leaf, Award, Truck, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const featuredProducts = [
  {
    id: 1,
    name: "Premium Kashmiri Almonds",
    price: 899,
    originalPrice: 1199,
    image: "/Features/almond.jpg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    badge: "Bestseller",
    nutrition: "Rich in Vitamin E & Protein",
  },
  {
    id: 2,
    name: "Royal Pistachios",
    price: 1299,
    originalPrice: 1599,
    image: "/Features/Pistachios.jpg?height=300&width=300",
    rating: 4.9,
    reviews: 89,
    badge: "Premium",
    nutrition: "High in Antioxidants",
  },
  {
    id: 3,
    name: "Organic Dates Medley",
    price: 649,
    originalPrice: 799,
    image: "/Features/dates.jpg?height=300&width=300",
    rating: 4.7,
    reviews: 156,
    badge: "Organic",
    nutrition: "Natural Energy Booster",
  },
  {
    id: 4,
    name: "Himalayan Walnuts",
    price: 1099,
    originalPrice: 1399,
    image: "/Features/walnut.jpg?height=300&width=300",
    rating: 4.8,
    reviews: 92,
    badge: "Limited Edition",
    nutrition: "Omega-3 Rich",
  },
]

const testimonials = [
  {
    name: "Rahman Karim",
    location: "Hunza",
    rating: 5,
    comment: "The quality is exceptional! These almonds taste like they're straight from Kashmir.",
    image: "/Testimonials/rahman.webp?height=60&width=60",
  },
  {
    name: "Anita Karim",
    location: "Delhi",
    rating: 5,
    comment: "Fast delivery and premium packaging. My family loves the variety pack!",
    image: "/Testimonials/anita.jpeg?height=60&width=60",
  },
  {
    name: "Mujtaba Hasan",
    location: "Gilgit",
    rating: 5,
    comment: "Perfect for gifting. The presentation is absolutely beautiful.",
    image: "/Testimonials/muju.jpeg?height=60&width=60",
  },
]

export default function HomePage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
          <Image
            src="/Dry_Fruits/wall1.jpg?height=1080&width=1920"
            alt="Premium organic dry fruits"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#355E3B]/80 to-transparent" />
        </motion.div>

        <motion.div style={{ y: y2 }} className="relative z-10 flex items-center justify-center h-full px-4">
          <div className="text-center text-white max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-6"
            >
              <Badge className="bg-[#D4AF37] text-[#355E3B] mb-4 px-4 py-2 text-sm font-medium">
                <Leaf className="w-4 h-4 mr-2" />
                100% Organic & Premium
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight"
            >
              Nature's Richest,
              <br />
              <span className="text-[#D4AF37]">Delivered to Your Door</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto"
            >
              Discover our curated collection of premium organic dry fruits, sourced directly from the finest orchards
              across Pakistan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold px-8 py-4 text-lg"
                asChild
              >
                <Link href="/products">
                  Explore Our Orchard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#355E3B] px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/about">Learn Our Story</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Animation Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-16 h-16 opacity-30"
        >
          <Leaf className="w-full h-full text-[#D4AF37]" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-32 left-16 w-12 h-12 opacity-20"
        >
          <Leaf className="w-full h-full text-[#D4AF37]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Premium Quality", desc: "Hand-picked from finest orchards" },
              { icon: Leaf, title: "100% Organic", desc: "Certified organic & natural" },
              { icon: Truck, title: "Fast Delivery", desc: "Fresh delivery within 24-48 hours" },
              { icon: Shield, title: "Quality Assured", desc: "Money-back guarantee" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#355E3B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-[#355E3B] mb-2">{feature.title}</h3>
                <p className="text-[#6F4E37]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#F4EBD0]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#355E3B] mb-4">Featured This Season</h2>
            <p className="text-xl text-[#6F4E37] max-w-2xl mx-auto">
              Discover our most loved premium organic dry fruits, carefully selected for their exceptional quality and
              taste.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-[#D4AF37] text-[#355E3B]">{product.badge}</Badge>
                    {/* The commented Section is the Start over the items */}
                    {/* <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white text-[#355E3B]"
                    >
                      <Heart className="w-4 h-4" />
                    </Button> */}
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

                    <p className="text-sm text-[#6F4E37] mb-3">{product.nutrition}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#355E3B]">₹{product.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      </div>
                    </div>

                    <Button className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white" asChild>
                      <Link href={`/products/${product.id}`}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white px-8 bg-transparent"
              asChild
            >
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#355E3B] mb-4">What Our Customers Say</h2>
            <p className="text-xl text-[#6F4E37] max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for premium organic dry fruits.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-[#F4EBD0]">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <p className="text-[#6F4E37] mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={50}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-[#355E3B]">{testimonial.name}</p>
                      <p className="text-sm text-[#6F4E37]">{testimonial.location}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#355E3B]">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Get 10% Off Your First Order</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive offers, health tips, and the latest updates from our orchard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-[#D4AF37] outline-none"
              />
              <Button className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold px-6">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
