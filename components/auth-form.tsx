'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store'
import PasswordStrength from '@/components/password-strength'

interface AuthFormProps {
  defaultTab?: 'signin' | 'signup'
  onSuccess?: () => void
}

export default function AuthForm({ defaultTab = 'signin', onSuccess }: AuthFormProps) {
  const router = useRouter()
  const { login } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Form states
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!signinForm.email || !signinForm.password) {
      toast.error('Required Fields Missing', {
        description: 'Please enter both email and password'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signinForm.email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address'
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinForm),
        credentials: 'include' // Include cookies for authentication
      })

      const data = await response.json()

      if (!data.success) {
        // Show specific error messages
        let errorMessage = data.message || 'An error occurred during signin'
        
        if (response.status === 401) {
          errorMessage = data.message || 'Invalid email or password'
        } else if (response.status === 404) {
          errorMessage = data.message || 'Account not found. Please check your email or sign up.'
        } else if (response.status === 423) {
          errorMessage = data.message || 'Account is locked. Please try again later.'
        }
        
        throw new Error(errorMessage)
      }

      // Update auth store
      login(data.user, data.token)
      
      // Wait a moment for the auth state to be fully updated
      await new Promise(resolve => setTimeout(resolve, 200))
      
      toast.success('Welcome back!', {
        description: `Welcome back, ${data.user.firstName || 'User'}!`
      })

      // Handle success callback or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to the intended page or homepage
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirect') || '/'
        
        // Small delay to show the success message, then redirect
        setTimeout(() => {
          router.push(redirectTo)
        }, 1000)
      }

    } catch (error) {
      toast.error('Signin Failed', {
        description: error instanceof Error ? error.message : 'An error occurred during signin'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      toast.error('Required Fields Missing', {
        description: 'Please fill in all required fields'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupForm.email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address'
      })
      return
    }

    // Validate password strength
    if (signupForm.password.length < 8) {
      toast.error('Weak Password', {
        description: 'Password must be at least 8 characters long'
      })
      return
    }
    
    // Validate passwords match
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Password Mismatch', {
        description: 'Passwords do not match. Please check both password fields.'
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupForm.firstName,
          lastName: signupForm.lastName,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password
        })
      })

      const data = await response.json()

      if (!data.success) {
        // Show specific error messages for signup
        let errorMessage = data.message || 'An error occurred during signup'
        
        if (response.status === 409) {
          errorMessage = data.message || 'An account with this email already exists. Please sign in instead.'
        } else if (response.status === 400) {
          errorMessage = data.message || 'Invalid input. Please check your information.'
        } else if (response.status === 422) {
          errorMessage = data.message || 'Password does not meet requirements. Please use a stronger password.'
        }
        
        throw new Error(errorMessage)
      }


      toast.success('Account Created!', {
        description: 'We sent you a verification code. Please check your email.'
      })

      // Redirect to verify-email page
      router.push(`/verify-email?email=${encodeURIComponent(signupForm.email)}`)
      

    } catch (error) {
      toast.error('Signup Failed', {
        description: error instanceof Error ? error.message : 'An error occurred during signup'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignin = async () => {
    try {
      // Implement Google OAuth signin
      window.location.href = '/api/auth/signin/google'
    } catch (error) {
      toast.error('Google Signin Failed', {
        description: 'Unable to connect to Google'
      })
    }
  }

  const handleFacebookSignin = async () => {
    try {
      // Implement Facebook OAuth signin
      window.location.href = '/api/auth/signin/facebook'
    } catch (error) {
      toast.error('Facebook Signin Failed', {
        description: 'Unable to connect to Facebook'
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="john@example.com"
                    value={signinForm.email}
                    onChange={(e) => setSigninForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={signinForm.password}
                      onChange={(e) => setSigninForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={signinForm.rememberMe}
                      onCheckedChange={(checked) => 
                        setSigninForm(prev => ({ ...prev, rememberMe: !!checked }))
                      }
                    />
                    <Label htmlFor="remember-me" className="text-sm">Remember me</Label>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm" onClick={() => {
                    // TODO: Implement forgot password
                    toast.info('Forgot Password', {
                      description: 'Forgot password feature coming soon!'
                    })
                  }}>
                    Forgot password?
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={handleGoogleSignin} disabled={isLoading}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" onClick={handleFacebookSignin} disabled={isLoading}>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create account</CardTitle>
              <CardDescription>
                Enter your information to create a new account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john@example.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <PasswordStrength password={signupForm.password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
