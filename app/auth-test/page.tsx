"use client"

import { useState } from "react"
import { useAuthStore } from "@/lib/store"
import { TokenStorage } from "@/lib/cookies"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } = useAuthStore()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('Password123!')
  const [firstName, setFirstName] = useState('Test')
  const [lastName, setLastName] = useState('User')

  const testData = {
    user,
    isAuthenticated,
    isLoading,
    tokenExists: TokenStorage.exists(),
    token: TokenStorage.get()?.substring(0, 20) + "...",
    timestamp: new Date().toISOString()
  }

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Registration successful!')
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      toast.error('Registration failed')
    }
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          rememberMe: true
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        login(data.user, data.token)
        toast.success('Login successful!')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed')
    }
  }

  const handleForceAuthCheck = async () => {
    await checkAuth()
    toast.info('Auth check completed')
  }

  const testProtectedRoute = (route: string) => {
    window.location.href = route
  }

  return (
    <div className="min-h-screen bg-[#F4EBD0] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#355E3B] mb-8">🔐 Authentication Persistence Test</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Current Auth State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isAuthenticated ? '✅' : '❌'}</span>
                  <span><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isLoading ? '⏳' : '✅'}</span>
                  <span><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{testData.tokenExists ? '🔑' : '🚫'}</span>
                  <span><strong>Token Exists:</strong> {testData.tokenExists ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{user ? '👤' : '👻'}</span>
                  <span><strong>User:</strong> {user ? user.email : 'None'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  <span><strong>Role:</strong> {user?.role || 'None'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔑 Login/Register</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRegister} variant="outline" className="flex-1">
                    📝 Register
                  </Button>
                  <Button onClick={handleLogin} className="flex-1">
                    🔓 Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🧪 Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={handleForceAuthCheck} variant="outline">
                🔍 Force Auth Check
              </Button>
              <Button onClick={logout} variant="destructive">
                🚪 Logout
              </Button>
              <Button onClick={() => window.location.reload()} variant="secondary">
                🔄 Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🛡️ Protected Route Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Click these buttons to test if authentication persists when visiting protected pages:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={() => testProtectedRoute('/profile')} variant="outline">
                  👤 Profile
                </Button>
                <Button onClick={() => testProtectedRoute('/orders')} variant="outline">
                  📦 Orders
                </Button>
                <Button onClick={() => testProtectedRoute('/wishlist')} variant="outline">
                  ❤️ Wishlist
                </Button>
                <Button onClick={() => testProtectedRoute('/settings')} variant="outline">
                  ⚙️ Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔍 Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1. Register/Login:</strong> Use the form above to create account or login</p>
              <p><strong>2. Test Persistence:</strong> After login, click "Reload Page" - you should stay logged in</p>
              <p><strong>3. Test Protected Routes:</strong> Click the protected route buttons - should NOT redirect to login</p>
              <p><strong>4. Test New Tab:</strong> Open a new tab and visit /profile - should work without login</p>
              <p><strong>5. Test Logout:</strong> Click logout, then try protected routes - should redirect to login</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
