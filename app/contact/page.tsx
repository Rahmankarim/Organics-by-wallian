"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Headphones, HelpCircle } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import FastMap from "@/components/fast-map"

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    details: ["+92 318 0441303", "+92 346 5750452"],
    description: "Mon-Sat, 9 AM - 7 PM",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["helloorganicorchard@gmail.com", "supportorganicorchard@gmail.com"],
    description: "We'll respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Mohallah garabrass karimabad hunza Glgit-Baltitan Pakistan"],
    description: "Mon-Fri, 10 AM - 6 PM",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Monday - Saturday: 9 AM - 7 PM", "Sunday: 10 AM - 5 PM"],
    description: "Customer support available",
  },
]

const faqCategories = [
  {
    icon: HelpCircle,
    title: "General Questions",
    description: "Learn about our products and services",
  },
  {
    icon: MessageCircle,
    title: "Order Support",
    description: "Help with placing and tracking orders",
  },
  {
    icon: Headphones,
    title: "Technical Support",
    description: "Website and account related issues",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitError, setSubmitError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")
    setSubmitError("")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitMessage(data.message)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          category: "",
          message: "",
        })
      } else {
        setSubmitError(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setSubmitError("Failed to send message. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Have questions about our premium organic dry fruits? We're here to help you make the best choice for your
              health.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold text-[#355E3B] mb-6">Contact Information</h2>

              {contactInfo.map((info, index) => (
                <Card key={index} className="p-6 bg-white shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#355E3B] rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#355E3B] mb-2">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-[#6F4E37] mb-1">
                          {detail}
                        </p>
                      ))}
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {/* FAQ Categories
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-[#355E3B] mb-4">Quick Help</h3>
                <div className="space-y-3">
                  {faqCategories.map((category, index) => (
                    <Card
                      key={index}
                      className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <category.icon className="w-5 h-5 text-[#D4AF37]" />
                        <div>
                          <h4 className="font-medium text-[#355E3B]">{category.title}</h4>
                          <p className="text-sm text-[#6F4E37]">{category.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div> */}
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif font-bold text-[#355E3B]">Send us a Message</CardTitle>
                  <p className="text-[#6F4E37]">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#355E3B] font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#355E3B] font-medium">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#355E3B] font-medium">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-[#355E3B] font-medium">
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="order">Order Support</SelectItem>
                            <SelectItem value="product">Product Information</SelectItem>
                            <SelectItem value="bulk">Bulk Orders</SelectItem>
                            <SelectItem value="complaint">Complaint</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[#355E3B] font-medium">
                        Subject *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="Brief description of your inquiry"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[#355E3B] font-medium">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Please provide details about your inquiry..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37] bg-white min-h-[120px]"
                        required
                      />
                    </div>

                    {/* Success/Error Messages */}
                    {submitMessage && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm">{submitMessage}</p>
                      </div>
                    )}
                    
                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{submitError}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white py-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Interactive Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#355E3B] mb-4">
              Visit Our Store
            </h2>
            <p className="text-[#6F4E37] max-w-2xl mx-auto">
              Come experience our premium organic dry fruits in person. Located in the beautiful Hunza Valley, 
              our store offers the finest selection of naturally grown dry fruits.
            </p>
          </div>
          <FastMap height="500px" showDetails={true} />
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
