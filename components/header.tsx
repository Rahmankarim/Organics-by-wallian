"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ShoppingCart, Heart, User, Menu, Leaf, ChevronDown, Phone, Mail, LogOut, Settings, Package, X, Shield } from "lucide-react"
import { TokenStorage } from "@/lib/cookies"
import Link from "next/link"
import Image from "next/image"
import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const categories = [
  { 
    name: "Dry Fruits & Nuts", 
    href: "/products?category=dry-fruits-nuts", 
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop" 
  },
  { 
    name: "Grains & Pulses", 
    href: "/products?category=grains-pulses", 
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" 
  },
  { 
    name: "Spices & Herbs", 
    href: "/products?category=spices-herbs", 
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=300&fit=crop" 
  },
  { 
    name: "Honey & Natural Sweeteners", 
    href: "/products?category=honey-sweeteners", 
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop" 
  },
  { 
    name: "Oils & Ghee", 
    href: "/products?category=oils-ghee", 
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop" 
  },
  { 
    name: "Herbal Products", 
    href: "/products?category=herbal-products", 
    image: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400&h=300&fit=crop" 
  },
  { 
    name: "Fresh Produce", 
    href: "/products?category=fresh-produce", 
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop" 
  },
  { 
    name: "Organic Snacks", 
    href: "/products?category=organic-snacks", 
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop" 
  },
  { 
    name: "Beverages", 
    href: "/products?category=beverages", 
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop" 
  },
]

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(5)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Fetch cart count only for authenticated users
    const fetchCartCount = async () => {
      if (!isAuthenticated) {
        setCartCount(0)
        return
      }
      
      try {
        const token = TokenStorage.get()
        if (!token) {
          setCartCount(0)
          return
        }
        
        const response = await fetch("/api/cart", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          setCartCount(data.items.reduce((total: number, item: any) => total + item.quantity, 0))
        } else if (response.status === 401) {
          // Unauthorized, token might be invalid
          setCartCount(0)
        }
      } catch (error) {
        console.error("Error fetching cart count:", error)
        setCartCount(0)
      }
    }

    fetchCartCount()

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)
    return () => window.removeEventListener("cartUpdated", handleCartUpdate)
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      router.push('/')
      toast.success('Logged Out', {
        description: 'You have been logged out successfully.'
      })
    } catch (error) {
      toast.error('Logout Failed', {
        description: 'Failed to logout properly'
      })
    }
  }

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gradient-to-r from-[#355E3B] to-[#2A4A2F] text-white py-2 text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-10"></div>
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2 hover:text-[#D4AF37] transition-colors cursor-pointer">
              <Phone className="w-4 h-4" />
              <span className="font-medium">+92 318 0441303</span>
            </div>
            <div className="hidden md:flex items-center gap-2 hover:text-[#D4AF37] transition-colors cursor-pointer">
              <Mail className="w-4 h-4" />
              <span>OrganicsByWALLIAN@gmail.com</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:flex items-center gap-4"
          >
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              <Leaf className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-medium">100% Organic</span>
            </div>
            <Badge className="bg-[#D4AF37] text-[#355E3B] hover:bg-[#B8941F] transition-colors px-3 py-1 rounded-full">
              Free shipping on orders above ₹999
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Modern Main Header */}
      <motion.header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-[#355E3B]/10' 
            : 'bg-[#F4EBD0] shadow-sm'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Section with Animation */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#355E3B] to-[#2A4A2F] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Leaf className="w-6 h-6 text-[#D4AF37] group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#355E3B] to-[#2A4A2F] bg-clip-text text-transparent">
                    Origiganics
                  </h1>
                  <p className="text-xs text-[#6F4E37] font-medium tracking-wide">BY WALLIAN</p>
                </div>
              </Link>
            </motion.div>

            {/* Navigation Links - Floating Design */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-2 py-2 shadow-lg border border-white/20">
                <Link href="/" className="px-4 py-2 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white rounded-full transition-all duration-300 font-medium">
                  Home
                </Link>
                
                {/* Products Mega Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-4 py-2 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white rounded-full transition-all duration-300 font-medium">
                      Products
                      <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[800px] p-6 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl">
                    <div className="grid grid-cols-5 gap-4">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          href={category.href}
                          className="flex flex-col items-center p-3 rounded-xl hover:bg-[#F4EBD0] transition-all duration-300 group"
                        >
                          <div className="relative mb-2 overflow-hidden rounded-lg w-20 h-20">
                            <Image
                              src={category.image || "/placeholder.svg"}
                              alt={category.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-xs font-medium text-[#355E3B] group-hover:text-[#D4AF37] transition-colors text-center">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/about" className="px-4 py-2 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white rounded-full transition-all duration-300 font-medium">
                  About
                </Link>
                <Link href="/blog" className="px-4 py-2 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white rounded-full transition-all duration-300 font-medium">
                  Health Tips
                </Link>
                <Link href="/contact" className="px-4 py-2 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white rounded-full transition-all duration-300 font-medium">
                  Contact
                </Link>
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              
              {/* Search Button/Bar */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="w-11 h-11 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
                >
                  <Search className="w-5 h-5" />
                </Button>
                
                {/* Expandable Search */}
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 top-0 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-white/20 overflow-hidden"
                  >
                    <div className="flex items-center p-2">
                      <Search className="w-5 h-5 text-[#6F4E37] ml-3" />
                      <Input
                        placeholder="Search premium dry fruits..."
                        className="border-0 bg-transparent text-[#355E3B] placeholder:text-[#6F4E37] focus:ring-0 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const searchTerm = (e.target as HTMLInputElement).value
                            if (searchTerm.trim()) {
                              window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`
                              setIsSearchOpen(false)
                            }
                          }
                          if (e.key === "Escape") {
                            setIsSearchOpen(false)
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-1 h-auto text-[#6F4E37] hover:text-[#355E3B]"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Wishlist - Hidden for now */}
              {isAuthenticated && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative w-11 h-11 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
                  asChild
                >
                  <Link href="/wishlist">
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-white rounded-full animate-pulse">
                        {wishlistCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative w-11 h-11 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
                asChild
              >
                <Link href="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-white rounded-full animate-bounce">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User Profile */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {/* Profile Avatar */}
                  <Link href="/profile">
                    <Avatar className="h-11 w-11 cursor-pointer hover:ring-2 hover:ring-[#D4AF37] transition-all duration-300 shadow-lg border-2 border-white">
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-gradient-to-br from-[#355E3B] to-[#2A4A2F] text-white text-sm font-medium">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 p-2 hover:bg-white/50 backdrop-blur-sm rounded-full transition-all duration-300">
                        <div className="hidden md:flex flex-col items-start text-left">
                          <span className="text-sm font-medium text-[#355E3B]">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-[#6F4E37]">
                            {user.role === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-[#355E3B]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl p-2">
                      <div className="px-4 py-3 border-b border-[#355E3B]/10">
                        <p className="text-sm font-medium text-[#355E3B]">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-[#6F4E37]">{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild className="rounded-xl m-1">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2">
                          <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-[#355E3B]" />
                          </div>
                          <span className="font-medium">My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl m-1">
                        <Link href="/orders" className="flex items-center gap-3 px-3 py-2">
                          <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#355E3B]" />
                          </div>
                          <span className="font-medium">My Orders</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl m-1">
                        <Link href="/wishlist" className="flex items-center gap-3 px-3 py-2">
                          <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-[#355E3B]" />
                          </div>
                          <span className="font-medium">Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl m-1">
                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2">
                          <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-[#355E3B]" />
                          </div>
                          <span className="font-medium">Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        className="flex items-center gap-3 px-3 py-2 text-red-600 rounded-xl m-1 focus:bg-red-50"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941F] hover:from-[#B8941F] hover:to-[#9A7A19] text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                      Sign In
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl p-2">
                    <DropdownMenuItem asChild className="rounded-xl m-1">
                      <div onClick={() => {
                        console.log('User Sign In clicked - navigating to /signin')
                        router.push('/signin')
                      }} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-[#355E3B]" />
                        </div>
                        <span className="font-medium">Sign In</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl m-1">
                      <Link href="/admin/login" className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium">Admin Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden w-11 h-11 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 text-[#355E3B] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-gradient-to-b from-[#F4EBD0] to-white">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="space-y-4">
                      <Link href="/" className="block text-lg font-medium text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                        Home
                      </Link>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-[#355E3B]">Products</h3>
                        <div className="grid grid-cols-2 gap-2 ml-4">
                          {categories.map((category) => (
                            <Link
                              key={category.name}
                              href={category.href}
                              className="text-sm text-[#6F4E37] hover:text-[#D4AF37] transition-colors"
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <Link href="/about" className="block text-lg font-medium text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                        About
                      </Link>
                      <Link href="/blog" className="block text-lg font-medium text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                        Health Tips
                      </Link>
                      <Link href="/contact" className="block text-lg font-medium text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                        Contact
                      </Link>
                    </div>
                    
                    {isAuthenticated && user ? (
                      <div className="border-t border-[#355E3B]/20 pt-6 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.firstName} />
                            <AvatarFallback className="bg-[#355E3B] text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-[#355E3B]">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-[#6F4E37]">{user.email}</p>
                          </div>
                        </div>
                        <Link href="/profile" className="block text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                          My Profile
                        </Link>
                        <Link href="/orders" className="block text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                          My Orders
                        </Link>
                        <Link href="/wishlist" className="block text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                          Wishlist
                        </Link>
                        <Link href="/settings" className="block text-[#355E3B] hover:text-[#D4AF37] transition-colors">
                          Settings
                        </Link>
                        <Button 
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="border-t border-[#355E3B]/20 pt-6 space-y-3">
                        <div onClick={() => {
                          console.log('Mobile User Sign In clicked - navigating to /signin')
                          router.push('/signin')
                        }} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                          <div className="w-8 h-8 bg-[#F4EBD0] rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-[#355E3B]" />
                          </div>
                          <span className="font-medium text-[#355E3B]">Sign In</span>
                        </div>
                        <Link href="/admin/login" className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium text-red-600">Admin Login</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  )
}
