"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuthStore } from "@/lib/store"

export default function TestSignInPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [debugInfo, setDebugInfo] = useState("")

  const handleDebug = () => {
    setDebugInfo(`
      isAuthenticated: ${isAuthenticated}
      user: ${JSON.stringify(user, null, 2)}
      localStorage auth-token: ${typeof window !== 'undefined' ? localStorage.getItem('auth-token') : 'N/A'}
    `)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sign In Button Test</h1>
      
      <div className="space-y-4">
        <div>
          <p>Current auth state: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
        </div>
        
        <div>
          <Button onClick={handleDebug}>Debug Auth State</Button>
        </div>
        
        {debugInfo && (
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {debugInfo}
          </pre>
        )}
        
        <div className="space-x-4">
          <Button asChild>
            <Link href="/login">Test Link to Login</Link>
          </Button>
          
          <Button onClick={() => window.location.href = '/login'}>
            Test Direct Navigation
          </Button>
        </div>
        
        <div>
          <a href="/login" className="text-blue-600 underline">
            Test Regular Link
          </a>
        </div>
      </div>
    </div>
  )
}
