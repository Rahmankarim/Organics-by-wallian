'use client'
import { Metadata } from 'next'
import AuthForm from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Home Button */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" asChild className="text-gray-700 hover:bg-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Access your account to continue shopping premium dry fruits
          </p>
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}
        </div>
        <AuthForm defaultTab="signin" />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
