import { Metadata } from 'next'
import AuthForm from '@/components/auth-form'

export const metadata: Metadata = {
  title: 'Sign Up | Luxury Dry Fruits',
  description: 'Create an account to access premium dry fruits and nuts',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Us</h1>
          <p className="text-gray-600 mt-2">
            Create your account to start shopping premium dry fruits
          </p>
        </div>
        <AuthForm defaultTab="signup" />
      </div>
    </div>
  )
}
