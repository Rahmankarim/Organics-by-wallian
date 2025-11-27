import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Sign Up | Origiganics by Wallian',
  description: 'Create an account to access premium dry fruits and nuts',
}

export default function RegisterPage() {
  // Redirect to signin page with signup tab
  redirect('/signin')
}
