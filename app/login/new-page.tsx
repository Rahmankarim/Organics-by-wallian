import { Metadata } from 'next'
import AuthForm from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign In | Luxury Dry Fruits',
  description: 'Sign in to your account to access premium dry fruits and nuts',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Access your account to continue shopping premium dry fruits
          </p>
        </div>
        <AuthForm defaultTab="signin" />
      </div>
    </div>
  )
}
