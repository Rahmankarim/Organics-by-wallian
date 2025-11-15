"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  })
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [resendLoading, setResendLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setStep(2)
      setMessage(data.message || "Verification code sent to your email.")
    } else {
      setError(data.message || "Signup failed")
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setMessage(data.message || "Account created successfully. You can now log in.")
      setTimeout(() => router.push("/login"), 2000)
    } else {
      setError(data.message || "Verification failed")
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError("")
    setMessage("")
    const res = await fetch("/api/auth/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    })
    const data = await res.json()
    setResendLoading(false)
    if (res.ok) {
      setMessage("Verification code resent to your email.")
    } else {
      setError(data.error || "Could not resend code")
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-[#355E3B] mb-1">Sign Up</h1>
        {step === 1 && (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#355E3B] text-white py-2 rounded-md hover:bg-[#2b4b2f] disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Sign Up"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit verification code to <strong>{form.email}</strong>. Please enter it below:
            </p>
            <input
              name="code"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              required
              className="w-full border rounded-md px-3 py-2 tracking-widest text-lg text-center"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-[#355E3B] hover:underline disabled:opacity-60"
              >
                {resendLoading ? "Resending..." : "Resend code"}
              </button>
              <span className="text-xs text-gray-400">Didn't get the code?</span>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#355E3B] text-white py-2 rounded-md hover:bg-[#2b4b2f] disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
