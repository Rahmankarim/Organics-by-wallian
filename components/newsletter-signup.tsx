'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface NewsletterSignupProps {
  className?: string
  variant?: 'card' | 'inline'
  title?: string
  description?: string
}

export default function NewsletterSignup({
  className = '',
  variant = 'card',
  title = 'Stay Updated',
  description = 'Get the latest offers and health tips delivered to your inbox.'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Email Required', {
        description: 'Please enter your email address'
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address'
      })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement newsletter signup API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      setIsSubscribed(true)
      setEmail('')
      
      toast.success('Subscribed!', {
        description: 'Thank you for subscribing to our newsletter.'
      })
    } catch (error) {
      toast.error('Subscription Failed', {
        description: 'Please try again later.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">You're subscribed!</span>
      </div>
    )
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      <p className="text-xs text-gray-600">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  )

  if (variant === 'inline') {
    return (
      <div className={className}>
        <div className="mb-3">
          <h3 className="font-semibold text-[#355E3B] flex items-center gap-2">
            <Mail className="w-4 h-4" />
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {content}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#355E3B]" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
