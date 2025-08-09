"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ProductForm {
  name: string
  price: string
  originalPrice: string
  category: string
  weight: string
  description: string
  badge: string
  inStock: boolean
  stockCount: string
  rating: string
  reviews: string
  images: string[]
  features: string[]
  benefits: string[]
  nutritionFacts: {
    calories: string
    protein: string
    fat: string
    carbs: string
    fiber: string
    vitaminE: string
  }
}

const initialForm: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "",
  weight: "",
  description: "",
  badge: "New",
  inStock: true,
  stockCount: "",
  rating: "4.5",
  reviews: "0",
  images: ["/placeholder.svg?height=500&width=500"],
  features: [""],
  benefits: [""],
  nutritionFacts: {
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
    fiber: "",
    vitaminE: "",
  },
}

export default function AddProductPage() {
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const categories = [
    { value: "almonds", label: "Almonds" },
    { value: "pistachios", label: "Pistachios" },
    { value: "dates", label: "Dates" },
    { value: "walnuts", label: "Walnuts" },
    { value: "cashews", label: "Cashews" },
    { value: "gifts", label: "Gift Boxes" },
  ]

  const badges = [
    { value: "New", label: "New" },
    { value: "Bestseller", label: "Bestseller" },
    { value: "Premium", label: "Premium" },
    { value: "Organic", label: "Organic" },
    { value: "Limited Edition", label: "Limited Edition" },
    { value: "Popular", label: "Popular" },
  ]

  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNutritionChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      nutritionFacts: {
        ...prev.nutritionFacts,
        [field]: value,
      },
    }))
  }

  const handleArrayChange = (field: "features" | "benefits" | "images", index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: "features" | "benefits" | "images") => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: "features" | "benefits" | "images", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stockCount: Number(form.stockCount),
        rating: Number(form.rating),
        reviews: Number(form.reviews),
        features: form.features.filter((f) => f.trim() !== ""),
        benefits: form.benefits.filter((b) => b.trim() !== ""),
        images: form.images.filter((img) => img.trim() !== ""),
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        const result = await response.json()
        alert("Product created successfully!")
        router.push("/admin/products")
      } else {
        alert("Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Error creating product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0]">
      {/* Header */}
      <header className="bg-[#355E3B] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold">Add New Product</h1>
              <p className="text-gray-200">Create a new organic dry fruit product</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-[#355E3B]">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-[#355E3B] font-medium">
                        Product Name *
                      </Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-[#355E3B] font-medium">
                        Category *
                      </Label>
                      <Select value={form.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="border-[#355E3B]/20 focus:border-[#D4AF37]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-[#355E3B] font-medium">
                        Price (₹) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="text-[#355E3B] font-medium">
                        Original Price (₹) *
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={form.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-[#355E3B] font-medium">
                        Weight *
                      </Label>
                      <Input
                        id="weight"
                        value={form.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="e.g., 500g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-[#355E3B] font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="border-[#355E3B]/20 focus:border-[#D4AF37] min-h-[100px]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Features & Benefits */}
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-[#355E3B]">Features & Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-[#355E3B] font-medium mb-3 block">Key Features</Label>
                    {form.features.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleArrayChange("features", index, e.target.value)}
                          placeholder="Enter feature"
                          className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("features", index)}
                          disabled={form.features.length === 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addArrayItem("features")}
                      className="border-[#355E3B] text-[#355E3B] bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>

                  <div>
                    <Label className="text-[#355E3B] font-medium mb-3 block">Health Benefits</Label>
                    {form.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={benefit}
                          onChange={(e) => handleArrayChange("benefits", index, e.target.value)}
                          placeholder="Enter benefit"
                          className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("benefits", index)}
                          disabled={form.benefits.length === 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addArrayItem("benefits")}
                      className="border-[#355E3B] text-[#355E3B] bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Benefit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Facts */}
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#355E3B]">Nutrition Facts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories" className="text-[#355E3B] font-medium">
                        Calories (per 100g)
                      </Label>
                      <Input
                        id="calories"
                        value={form.nutritionFacts.calories}
                        onChange={(e) => handleNutritionChange("calories", e.target.value)}
                        placeholder="e.g., 579 per 100g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein" className="text-[#355E3B] font-medium">
                        Protein
                      </Label>
                      <Input
                        id="protein"
                        value={form.nutritionFacts.protein}
                        onChange={(e) => handleNutritionChange("protein", e.target.value)}
                        placeholder="e.g., 21.2g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat" className="text-[#355E3B] font-medium">
                        Fat
                      </Label>
                      <Input
                        id="fat"
                        value={form.nutritionFacts.fat}
                        onChange={(e) => handleNutritionChange("fat", e.target.value)}
                        placeholder="e.g., 49.9g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs" className="text-[#355E3B] font-medium">
                        Carbohydrates
                      </Label>
                      <Input
                        id="carbs"
                        value={form.nutritionFacts.carbs}
                        onChange={(e) => handleNutritionChange("carbs", e.target.value)}
                        placeholder="e.g., 21.6g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fiber" className="text-[#355E3B] font-medium">
                        Fiber
                      </Label>
                      <Input
                        id="fiber"
                        value={form.nutritionFacts.fiber}
                        onChange={(e) => handleNutritionChange("fiber", e.target.value)}
                        placeholder="e.g., 12.5g"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vitaminE" className="text-[#355E3B] font-medium">
                        Vitamin E
                      </Label>
                      <Input
                        id="vitaminE"
                        value={form.nutritionFacts.vitaminE}
                        onChange={(e) => handleNutritionChange("vitaminE", e.target.value)}
                        placeholder="e.g., 25.6mg"
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              {/* Product Settings */}
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-[#355E3B]">Product Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="badge" className="text-[#355E3B] font-medium">
                      Badge
                    </Label>
                    <Select value={form.badge} onValueChange={(value) => handleInputChange("badge", value)}>
                      <SelectTrigger className="border-[#355E3B]/20 focus:border-[#D4AF37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {badges.map((badge) => (
                          <SelectItem key={badge.value} value={badge.value}>
                            {badge.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rating" className="text-[#355E3B] font-medium">
                        Rating
                      </Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={form.rating}
                        onChange={(e) => handleInputChange("rating", e.target.value)}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviews" className="text-[#355E3B] font-medium">
                        Reviews
                      </Label>
                      <Input
                        id="reviews"
                        type="number"
                        min="0"
                        value={form.reviews}
                        onChange={(e) => handleInputChange("reviews", e.target.value)}
                        className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={form.inStock}
                      onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                    />
                    <Label htmlFor="inStock" className="text-[#355E3B] font-medium">
                      In Stock
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="stockCount" className="text-[#355E3B] font-medium">
                      Stock Count
                    </Label>
                    <Input
                      id="stockCount"
                      type="number"
                      min="0"
                      value={form.stockCount}
                      onChange={(e) => handleInputChange("stockCount", e.target.value)}
                      className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Images */}
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-[#355E3B]">Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {form.images.map((image, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={image}
                          onChange={(e) => handleArrayChange("images", index, e.target.value)}
                          placeholder="Image URL"
                          className="border-[#355E3B]/20 focus:border-[#D4AF37]"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("images", index)}
                          disabled={form.images.length === 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addArrayItem("images")}
                      className="w-full border-[#355E3B] text-[#355E3B] bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full bg-[#355E3B] hover:bg-[#2A4A2F] text-white"
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Creating..." : "Create Product"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#355E3B] text-[#355E3B] bg-transparent"
                      asChild
                    >
                      <Link href="/admin/products">Cancel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
