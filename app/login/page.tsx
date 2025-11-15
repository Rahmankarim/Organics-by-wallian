"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/signin")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Redirecting to Sign In...</h1>
        <p className="text-gray-600 mt-2">Please wait while we redirect you to the sign in page.</p>
      </div>
    </div>
  )
}
