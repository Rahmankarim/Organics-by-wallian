'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Suspense } from 'react'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''
  const codeFromUrl = searchParams.get('code') || ''

  const [email, setEmail] = useState(emailFromUrl)
  const [verificationCode, setVerificationCode] = useState(codeFromUrl)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleVerification = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!email || !verificationCode) {
      toast.error('Missing Information', {
        description: 'Please enter both email and verification code'
      })
      return
    }

    if (verificationCode.length !== 6) {
      toast.error('Invalid Code', {
        description: 'Verification code must be 6 digits'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          code: verificationCode 
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Account Created!', {
          description: 'Your account has been created successfully. Please sign in.'
        })
        
        // Redirect to signin with success message
        setTimeout(() => {
          router.push('/signin?message=Account created successfully! Please sign in.')
        }, 1500)
      } else {
        let title = 'Verification Failed'
        let description = data.message || 'Invalid verification code. Please try again.'

        if (data.message === 'Pending user not found') {
          title = 'No Pending Signup'
          description = 'We could not find a pending signup for this email. Please sign up again.'
          // Redirect user back after short delay
          setTimeout(() => router.push('/signin'), 2000)
        } else if (data.message === 'Verification code expired. Please sign up again.') {
          title = 'Code Expired'
          description = 'Your verification code has expired. Please register again.'
          setTimeout(() => router.push('/signin'), 2000)
        } else if (data.message === 'Invalid verification code') {
          title = 'Invalid Code'
          description = 'The code you entered is incorrect. Please try again.'
        }

        toast.error(title, { description })
        setVerificationCode('')
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Network Error', {
        description: 'Unable to verify code. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }, [email, verificationCode, router])

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email Required', {
        description: 'Please enter your email address'
      })
      return
    }

    setResendLoading(true)

    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Code Sent!', {
          description: 'A new verification code has been sent to your email.'
        })
        setVerificationCode('')
      } else {
        toast.error('Resend Failed', {
          description: data.message || 'Unable to resend code. Please try again.'
        })
      }
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Network Error', {
        description: 'Unable to resend code. Please try again.'
      })
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    // If no email in URL, redirect back to signin
    if (!emailFromUrl) {
      router.push('/signin')
      return
    }
    
    // If code is provided in URL, auto-verify
    if (emailFromUrl && codeFromUrl && codeFromUrl.length === 6) {
      handleVerification()
    }
  }, [emailFromUrl, codeFromUrl, handleVerification])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-between items-center">
          <Button variant="ghost" asChild className="text-gray-700 hover:bg-gray-100">
            <Link href="/signin" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </Button>
          <Button asChild className="bg-[#355E3B] hover:bg-[#355E3B]/90 text-white">
            <Link href="/" className="flex items-center gap-2">
              🏠 Home
            </Link>
          </Button>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4 mb-8">
            <div className="mx-auto w-16 h-16 bg-[#355E3B]/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#355E3B]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to:
            </p>
            <p className="text-[#355E3B] font-semibold break-all">{email}</p>
          </div>

          <form onSubmit={handleVerification} className="space-y-6">
            {/* Email Input (hidden if from URL) */}
            {!emailFromUrl && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent"
                />
              </div>
            )}

            {/* Verification Code Input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#355E3B] focus:border-transparent text-center text-2xl tracking-widest font-mono"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-[#355E3B] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#2d4a2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying...
                </div>
              ) : (
                'Verify & Create Account'
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-[#355E3B] hover:bg-[#355E3B]/10 font-medium"
              >
                {resendLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Check your spam folder if you don't see the email
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#355E3B]" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}