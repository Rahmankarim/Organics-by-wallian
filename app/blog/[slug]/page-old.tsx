"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Clock, ArrowLeft, Share2, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  author: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: number
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch("/api/blog")
        const data = await response.json()

        if (response.ok) {
          const foundPost = data.posts.find((p: BlogPost) => p.id === params.slug)
          if (foundPost) {
            setPost(foundPost)
            // Get related posts from same category
            const related = data.posts
              .filter((p: BlogPost) => p.category === foundPost.category && p.id !== foundPost.id)
              .slice(0, 3)
            setRelatedPosts(related)
          } else {
            router.push("/blog")
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error)
        router.push("/blog")
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchPost()
    }
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#355E3B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#6F4E37]">Loading article...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F4EBD0]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#355E3B] mb-4">Article not found</h1>
            <Button asChild>
              <Link href="/blog">Back to Health Tips</Link>
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

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" className="text-[#355E3B] hover:text-[#D4AF37]" asChild>
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Health Tips
          </Link>
        </Button>
      </div>

      <article className="container mx-auto px-4 py-8">
        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <Badge className="bg-[#355E3B] text-white mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#355E3B] mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-[#6F4E37] mb-8 leading-relaxed">{post.excerpt}</p>

            <div className="flex items-center justify-center gap-6 mb-8 text-[#6F4E37]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="sm"
                className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Article
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[#355E3B] text-[#355E3B] hover:bg-[#355E3B] hover:text-white bg-transparent"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save for Later
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-96 mb-12 rounded-2xl overflow-hidden shadow-lg">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
          </div>

          {/* Article Content */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-[#6F4E37] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: post.content
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/\n/g, "<br/>")
                      .replace(/^/, "<p>")
                      .replace(/$/, "</p>")
                      .replace(/#{1,6}\s/g, (match) => {
                        const level = match.trim().length - 1
                        return `</p><h${level} class="text-[#355E3B] font-serif font-bold mt-8 mb-4 ${level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : level === 3 ? "text-xl" : "text-lg"}"><div class="inline">`
                      })
                      .replace(/<div class="inline">(.*?)<\/p>/g, "$1</h1>")
                      .replace(/<div class="inline">(.*?)<\/p>/g, "$1</h2>")
                      .replace(/<div class="inline">(.*?)<\/p>/g, "$1</h3>")
                      .replace(/<div class="inline">(.*?)<\/p>/g, "$1</h4>"),
                  }}
                />
              </div>

              {/* Tags */}
              <Separator className="my-8" />
              <div className="flex flex-wrap gap-2">
                <span className="text-[#355E3B] font-medium mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-[#355E3B] text-[#355E3B]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Author Bio */}
          <Card className="mt-8 bg-[#F4EBD0]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-[#355E3B] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#355E3B] mb-2">{post.author}</h3>
                  <p className="text-[#6F4E37] leading-relaxed">
                    Expert in nutrition and wellness with years of experience in helping people achieve optimal health
                    through natural foods and lifestyle changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-6xl mx-auto mt-16"
          >
            <h2 className="text-3xl font-serif font-bold text-[#355E3B] mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={relatedPost.image || "/placeholder.svg"}
                      alt={relatedPost.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge className="bg-[#355E3B] text-white mb-3">{relatedPost.category}</Badge>
                    <h3 className="text-lg font-semibold text-[#355E3B] mb-2 line-clamp-2">{relatedPost.title}</h3>
                    <p className="text-[#6F4E37] text-sm mb-4 line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6F4E37]">{relatedPost.readTime} min read</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#355E3B] text-[#355E3B] bg-transparent"
                        asChild
                      >
                        <Link href={`/blog/${relatedPost.id}`}>Read More</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}
      </article>

      <Footer />
    </div>
  )
}
