"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Award, Users, Globe, Heart, Shield, Truck, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const stats = [
  { number: "10,000+", label: "Happy Customers", icon: Users },
  { number: "50+", label: "Premium Products", icon: Award },
  { number: "15+", label: "States Covered", icon: Globe },
  { number: "5", label: "Years of Excellence", icon: Star },
]

const values = [
  {
    icon: Leaf,
    title: "100% Organic",
    description: "We source only certified organic dry fruits from trusted farmers who follow sustainable practices.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every product undergoes rigorous quality checks to ensure you receive only the finest dry fruits.",
  },
  {
    icon: Heart,
    title: "Health First",
    description: "We believe in promoting healthy living through natural, nutritious, and wholesome dry fruits.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description: "Your trust is our priority. We ensure safe packaging and secure delivery of every order.",
  },
]

const team = [
  {
    name: "Reyan Ali",
    role: "Founder & CEO",
    image: "/About/Reyan_Ali.jpg?height=200&width=200",
    description: "20+ years in organic farming and sustainable agriculture.",
  },
  {
    name: "Rahman Karim",
    role: "Head of Quality",
    image: "/About/rahman.webp?height=200&width=200",
    description: "Expert in food safety and quality assurance with 15 years experience.",
  },
  {
    name: "Mujtaba Hassan",
    role: "Supply Chain Director",
    image: "/About/muju.jpeg?height=200&width=200",
    description: "Ensures seamless sourcing from farmers to your doorstep.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 bg-[#355E3B] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/covers/appricot.jpg?height=600&width=1200" alt="Organic farm" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-[#D4AF37] text-[#355E3B] mb-6 px-4 py-2">
              <Leaf className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">From Nature's Heart to Your Home</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Founded with a passion for organic living, Organics by Walian brings you the finest selection of premium
              dry fruits, sourced directly from certified organic farms across India.
            </p>
            <Button
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold px-8 py-4"
              asChild
            >
              <Link href="/products">Explore Our Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#355E3B] rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-3xl font-bold text-[#355E3B] mb-2">{stat.number}</h3>
                <p className="text-[#6F4E37]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-[#F4EBD0]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#355E3B] mb-6">
                Our Journey Began in 2019
              </h2>
              <div className="space-y-4 text-[#6F4E37] leading-relaxed">
                <p>
                What started as a small family business in the breathtaking valleys of Hunza has grown into Pakistan’s most trusted premium organic dry fruits brand under Organics by Walian. Our founder, Rajesh Patel, grew up in a family of organic farmers in Hunza and witnessed firsthand the positive impact of sustainable farming on the environment and community.
                </p>
                <p>
                 Frustrated by the scarcity of truly organic, high-quality dry fruits in the local and international markets, he decided to bridge the gap between conscious consumers and authentic organic farmers of Hunza. Today, we work directly with over 200 certified organic farmers across the Hunza region and northern Pakistan.
                </p>
                <p>
                 Every almond, pistachio, apricot, and walnut that reaches your home has been carefully selected, quality-tested, and packaged with love. We believe that good food is not just about taste – it’s about nourishing your body and supporting sustainable agriculture that preserves the natural beauty of Hunza.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Image
                src="/Hunza/hunza.jpg?height=500&width=600"
                alt="Organic farming"
                width={600}
                height={500}
                className="rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#355E3B] rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#355E3B]">100% Organic</p>
                    <p className="text-sm text-[#6F4E37]">Certified & Natural</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#355E3B] mb-4">Our Core Values</h2>
            <p className="text-xl text-[#6F4E37] max-w-2xl mx-auto">
              These principles guide everything we do, from sourcing to delivery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-[#F4EBD0]">
                  <div className="w-16 h-16 bg-[#355E3B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#355E3B] mb-3">{value.title}</h3>
                  <p className="text-[#6F4E37] leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-[#F4EBD0]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#355E3B] mb-4">Meet Our Team</h2>
            <p className="text-xl text-[#6F4E37] max-w-2xl mx-auto">
              The passionate people behind Organics by Walian's success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-[#355E3B] mb-1">{member.name}</h3>
                  <p className="text-[#D4AF37] font-medium mb-3">{member.role}</p>
                  <p className="text-[#6F4E37] text-sm leading-relaxed">{member.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-20 bg-[#355E3B] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Promise to You</h2>
            <p className="text-xl text-gray-200 mb-8 leading-relaxed">
              We promise to deliver not just premium organic dry fruits, but a commitment to your health, the
              environment, and the farming communities we work with. Every purchase you make supports sustainable
              agriculture and helps build a healthier future for all.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <Truck className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Fast & Safe Delivery</h3>
                <p className="text-gray-300">Fresh products delivered within 24-48 hours</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quality Guarantee</h3>
                <p className="text-gray-300">100% satisfaction or money back guarantee</p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Customer Care</h3>
                <p className="text-gray-300">Dedicated support for all your needs</p>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold px-8 py-4 mt-8"
              asChild
            >
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Website Credits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#355E3B] mb-6">Website Development</h2>
            <div className="bg-[#F4EBD0] rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#355E3B] rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-[#D4AF37]" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#355E3B] mb-4">Indeset Pvt Ltd</h3>
              <p className="text-lg text-[#6F4E37] mb-6 leading-relaxed">
                This website was professionally designed and developed by Indeset Pvt Ltd, a leading web development
                company specializing in e-commerce solutions, digital marketing, and custom web applications. With
                expertise in modern technologies and user-centric design, Indeset Pvt Ltd creates powerful digital
                experiences that drive business growth.
              </p>
              <div className="space-y-4 text-[#6F4E37] mb-6">
                <p>
                  <strong>Services:</strong> Web Development, E-commerce Solutions, Mobile Apps, Digital Marketing,
                  UI/UX Design
                </p>
                <p>
                  <strong>Technologies:</strong> React, Next.js, Node.js, MongoDB, TypeScript, Tailwind CSS
                </p>
              </div>
              <Button size="lg" className="bg-[#355E3B] hover:bg-[#2A4A2F] text-white font-semibold px-8 py-4" asChild>
                <Link href="https://indeset.com" target="_blank" rel="noopener noreferrer">
                  Visit Indeset.com
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
