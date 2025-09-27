import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign Up | Luxury Dry Fruits',
  description: 'Create an account to access premium dry fruits and nuts',
}

export default function RegisterPage() {
  // Redirect to the new signup page
  redirect('/signup')
}
