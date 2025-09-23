import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Leaf,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#355E3B] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#355E3B]" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold">Organic by Wallian</h3>
                <p className="text-sm text-gray-300">Premium Organic Products</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We source the finest organic products directly from premium sources across Pakistan, ensuring exceptional
              quality and freshness.
            </p>
            <div className="flex gap-4">
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#D4AF37] hover:bg-white/10">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#D4AF37] hover:bg-white/10">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#D4AF37] hover:bg-white/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-300 hover:text-[#D4AF37] hover:bg-white/10">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#D4AF37]">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                About Us
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                All Products
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Health Tips
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Contact Us
              </Link>
              <Link href="/track-order" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Track Order
              </Link>
              <Link href="/bulk-orders" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Bulk Orders
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#D4AF37]">Customer Service</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/faq" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Help & FAQs
              </Link>
              <Link href="/shipping" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Returns & Refunds
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                Terms & Conditions
              </Link>
            </nav>

            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91 346 5750452</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>helloorganicbywallian@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Mohallah Garabrass Karimabad Hunza, Gilgit-Baltittan Pakistan</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#D4AF37]">Stay Updated</h4>
            <p className="text-gray-300">Subscribe for exclusive offers, health tips, and new product launches.</p>
            <div className="space-y-2">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#D4AF37]"
              />
              <Button className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-[#355E3B] font-semibold">Subscribe</Button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4">
              <h5 className="text-sm font-semibold text-[#D4AF37] mb-3">Why Choose Us</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <RotateCcw className="w-4 h-4 text-[#D4AF37]" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Leaf className="w-4 h-4 text-[#D4AF37]" />
                  <span>100% Organic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-white/20" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-300 text-sm">© 2024 Organic by Wallian. All rights reserved. | Made with ❤️ by Indeset Pvt Ltd</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">We Accept:</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#355E3B]" />
              </div>
              <Image src="/placeholder.svg?height=20&width=32" alt="Visa" width={32} height={20} className="rounded" />
              <Image
                src="/placeholder.svg?height=20&width=32"
                alt="Mastercard"
                width={32}
                height={20}
                className="rounded"
              />
              <Image src="/placeholder.svg?height=20&width=32" alt="UPI" width={32} height={20} className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
