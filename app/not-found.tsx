import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4EBD0] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-24 h-24 bg-[#355E3B] rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-[#D4AF37]">404</span>
          </div>
          <CardTitle className="text-2xl text-[#355E3B]">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/products">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Link>
            </Button>
          </div>
          <div className="text-center text-sm text-gray-600">
            <p>Looking for something specific?</p>
            <Link href="/contact" className="text-[#355E3B] hover:underline">
              Contact our support team
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
