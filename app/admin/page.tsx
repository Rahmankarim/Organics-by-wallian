"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to admin login page
    router.replace('/admin/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EBD0]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E3B] mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-[#355E3B]">Redirecting to Admin Login...</h1>
        <p className="text-gray-600 mt-2">Please wait while we redirect you to the admin portal.</p>
      </div>
    </div>
  )
}
