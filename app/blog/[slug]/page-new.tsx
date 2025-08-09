"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Clock, ArrowLeft, Share2, Heart, Eye, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"

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

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/${params.slug}`)
        const data = await response.json()

        if (response.ok) {
          setPost(data.post)
          setRelatedPosts(data.relatedPosts || [])
        } else {
          console.error("Post not found:", data.error)
          router.push("/blog")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatContent = (content: string) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/# (.*$)/gm, '<h1 class="text-3xl font-bold text-[#355E3B] mb-6 mt-8">$1</h1>')
      .replace(/## (.*$)/gm, '<h2 class="text-2xl font-semibold text-[#355E3B] mb-4 mt-6">$1</h2>')
      .replace(/### (.*$)/gm, '<h3 class="text-xl font-medium text-[#355E3B] mb-3 mt-4">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#355E3B]">$1</strong>')
      .replace(/^\* (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="mb-2">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-[#6F4E37] leading-relaxed">')
      .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p class="mb-4 text-[#6F4E37] leading-relaxed">$1</p>')
  }

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
            <p className="text-[#6F4E37] mb-6">The article you're looking for doesn't exist or has been moved.</p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
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
      <div className="container mx-auto px-4 pt-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Featured Image */}
          <div className="relative h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Article Meta */}
          <div className="mb-6">
            <Badge className="bg-[#355E3B] text-white mb-4">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#355E3B] mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-[#6F4E37] mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{post.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span>Health Article</span>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-4">
              <span className="text-[#6F4E37] font-medium">Share:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.share?.({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                  })
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Separator className="mt-8" />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-xl text-[#6F4E37] mb-8 font-medium leading-relaxed">
              {post.excerpt}
            </div>
            
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(post.content) 
              }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12">
              <Separator className="mb-6" />
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="h-5 w-5 text-[#6F4E37]" />
                <span className="font-medium text-[#6F4E37]">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[#6F4E37]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-[#355E3B] mb-8 text-center">
                Related Articles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost._id} className="hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-[#355E3B] text-white">
                          {relatedPost.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-[#355E3B] mb-3 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-[#6F4E37] mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#6F4E37] mb-4">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        <span>{relatedPost.readTime} min read</span>
                      </div>
                      <Button asChild size="sm" className="w-full bg-[#355E3B] hover:bg-[#6F4E37]">
                        <Link href={`/blog/${relatedPost.slug}`}>
                          Read Article
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
