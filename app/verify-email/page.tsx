"use client"
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      console.log({ email, code })
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setMessage('Email verified! Redirecting to sign in...')
      setTimeout(() => router.push('/signin'), 1200)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend code')
      setMessage('Verification code sent to your email.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-[#355E3B] mb-1">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code we sent to your email.</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 w-full border rounded-md px-3 py-2 tracking-widest text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="123456"
              required
            />
          </div>

          {message && <div className="text-green-600 text-sm">{message}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#355E3B] text-white py-2 rounded-md hover:bg-[#2b4b2f] disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-[#355E3B] hover:underline disabled:opacity-60"
          >
            Resend code
          </button>
          <button onClick={() => router.push('/signin')} className="text-sm text-gray-600 hover:underline">
            Back to Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
