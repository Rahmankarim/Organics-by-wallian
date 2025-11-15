"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication
  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      return
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router, pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      // Clear localStorage
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/login')
    }
  }

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      href: "/admin/products",
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      href: "/admin/customers",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: TrendingUp,
      href: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
  ]

  // Sidebar Component
  const Sidebar = ({ className = "", onClose }: { className?: string; onClose?: () => void }) => (
    <div className={`bg-[#355E3B] text-white h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-[#D4AF37]">Admin Panel</h2>
        <p className="text-sm text-gray-300 mt-1">Origiganics by Wallian</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-[#D4AF37] text-[#355E3B] font-medium" 
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => onClose?.()}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-600/20"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {pathname === '/admin/login' ? (
        // Simple layout for login page - no admin sidebar
        <div className="min-h-screen">
          {children}
        </div>
      ) : (
        // Full admin layout for authenticated pages
        <div className="min-h-screen bg-[#F4EBD0] flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 h-screen sticky top-0">
            <Sidebar />
          </div>

          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden bg-[#355E3B] text-white p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-[#D4AF37]">Admin Panel</h1>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-600/20"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Page Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  )
}
