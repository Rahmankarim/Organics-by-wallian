"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Clock, ArrowRight, BookOpen, Heart, Brain, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: number
  metaTitle?: string
  metaDescription?: string
}

const categories = [
  { id: "all", name: "All Articles", icon: BookOpen },
  { id: "Nutrition", name: "Nutrition", icon: Heart },
  { id: "Brain Health", name: "Brain Health", icon: Brain },
  { id: "Energy Foods", name: "Energy Foods", icon: Zap },
  { id: "Mental Health", name: "Mental Health", icon: Heart },
]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog")
        const data = await response.json()

        if (response.ok && data.posts) {
          const formattedPosts = data.posts.map((post: any) => ({
            ...post,
            _id: post._id?.toString() || Math.random().toString(),
            publishedAt: new Date(post.publishedAt).toLocaleDateString(),
          }))
          setPosts(formattedPosts)
          setFilteredPosts(formattedPosts)
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    let filtered = posts

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredPosts(filtered)
  }, [posts, selectedCategory, searchQuery])

  const featuredPost = posts[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6F4E37]">Loading health tips...</p>
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
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#355E3B] to-[#4A7C59]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-6">Health & Nutrition Blog</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover the amazing health benefits of organic dry fruits and nuts. 
              Learn how to incorporate these superfoods into your daily life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post Section */}
      {featuredPost && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-[#355E3B] mb-8 text-center">Featured Article</h2>
              <Card className="overflow-hidden bg-white shadow-xl">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <Image
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      width={600}
                      height={400}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <Badge className="mb-4 bg-[#355E3B] text-white">
                      {featuredPost.category}
                    </Badge>
                    <h3 className="text-2xl font-bold text-[#355E3B] mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-[#6F4E37] mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#8B4513] mb-6">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {featuredPost.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.publishedAt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime} min read
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button className="bg-[#355E3B] hover:bg-[#4A7C59] text-white">
                        Read Full Article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="py-8 border-b border-[#D2B48C]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id
                        ? "bg-[#355E3B] text-white"
                        : "border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 border-[#D2B48C] focus:border-[#355E3B]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-[#D2B48C] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#355E3B] mb-2">No articles found</h3>
              <p className="text-[#6F4E37]">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.slice(1).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-[#355E3B] text-white">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-[#355E3B] mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[#6F4E37] mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#8B4513] mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <Button className="w-full bg-[#355E3B] hover:bg-[#4A7C59] text-white">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
