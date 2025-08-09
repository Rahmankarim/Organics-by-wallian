import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ICartItem, IProduct, IUser, Address } from '@/lib/models'
import { TokenStorage } from '@/lib/cookies'

// Cart Store
interface CartStore {
  items: ICartItem[]
  isOpen: boolean
  isLoading: boolean
  addItem: (item: Omit<ICartItem, 'addedAt'>) => Promise<void>
  removeItem: (productId: number, variantId?: string) => Promise<void>
  updateQuantity: (productId: number, quantity: number, variantId?: string) => Promise<void>
  clearCart: () => Promise<void>
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  syncWithServer: () => Promise<void>
  loadCart: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      
      addItem: async (newItem) => {
        set({ isLoading: true })
        try {
          // Check if user is authenticated
          const { isAuthenticated } = useAuthStore.getState()
          
          if (isAuthenticated) {
            // Sync with server for authenticated users
            const response = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                productId: newItem.productId,
                quantity: newItem.quantity,
                variantId: newItem.variantId,
                price: newItem.price
              })
            })

            if (response.ok) {
              // Reload cart from server
              await get().loadCart()
            } else {
              throw new Error('Failed to add item to cart')
            }
          } else {
            // Local storage for guest users
            const items = get().items
            const existingItemIndex = items.findIndex(
              item => item.productId === newItem.productId && item.variantId === newItem.variantId
            )
            
            if (existingItemIndex > -1) {
              // Update quantity if item exists
              const updatedItems = [...items]
              updatedItems[existingItemIndex].quantity += newItem.quantity
              set({ items: updatedItems })
            } else {
              // Add new item
              set({ items: [...items, { ...newItem, addedAt: new Date() }] })
            }
          }
        } catch (error) {
          console.error('Error adding item to cart:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      removeItem: async (productId, variantId) => {
        set({ isLoading: true })
        try {
          const { isAuthenticated } = useAuthStore.getState()
          
          if (isAuthenticated) {
            const response = await fetch('/api/cart', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ productId, variantId })
            })

            if (response.ok) {
              await get().loadCart()
            } else {
              throw new Error('Failed to remove item from cart')
            }
          } else {
            set({
              items: get().items.filter(
                item => !(item.productId === productId && item.variantId === variantId)
              )
            })
          }
        } catch (error) {
          console.error('Error removing item from cart:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      updateQuantity: async (productId, quantity, variantId) => {
        if (quantity <= 0) {
          await get().removeItem(productId, variantId)
          return
        }

        set({ isLoading: true })
        try {
          const { isAuthenticated } = useAuthStore.getState()
          
          if (isAuthenticated) {
            const response = await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ productId, quantity, variantId })
            })

            if (response.ok) {
              await get().loadCart()
            } else {
              throw new Error('Failed to update cart')
            }
          } else {
            set({
              items: get().items.map(item =>
                item.productId === productId && item.variantId === variantId
                  ? { ...item, quantity }
                  : item
              )
            })
          }
        } catch (error) {
          console.error('Error updating cart:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      clearCart: async () => {
        set({ isLoading: true })
        try {
          const { isAuthenticated } = useAuthStore.getState()
          
          if (isAuthenticated) {
            const response = await fetch('/api/cart', {
              method: 'DELETE',
              credentials: 'include'
            })

            if (!response.ok) {
              throw new Error('Failed to clear cart')
            }
          }
          
          set({ items: [] })
        } catch (error) {
          console.error('Error clearing cart:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),

      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return

        try {
          set({ isLoading: true })
          const localItems = get().items

          if (localItems.length > 0) {
            // Sync local cart with server
            const response = await fetch('/api/cart/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ items: localItems })
            })

            if (response.ok) {
              await get().loadCart()
            }
          } else {
            await get().loadCart()
          }
        } catch (error) {
          console.error('Error syncing cart:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      loadCart: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return

        try {
          set({ isLoading: true })
          const response = await fetch('/api/cart', {
            credentials: 'include'
          })

          if (response.ok) {
            const data = await response.json()
            set({ items: data.items || [] })
          }
        } catch (error) {
          console.error('Error loading cart:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Wishlist Store
interface WishlistStore {
  items: number[]
  addItem: (productId: number) => void
  removeItem: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (productId) => {
        const items = get().items
        if (!items.includes(productId)) {
          set({ items: [...items, productId] })
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(id => id !== productId) })
      },
      
      isInWishlist: (productId) => get().items.includes(productId),
      
      clearWishlist: () => set({ items: [] })
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// User Store
interface UserStore {
  user: IUser | null
  isLoading: boolean
  setUser: (user: IUser | null) => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<IUser>) => void
  addAddress: (address: Address) => void
  updateAddress: (addressId: string, updates: Partial<Address>) => void
  removeAddress: (addressId: string) => void
  setDefaultAddress: (addressId: string) => void
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  isLoading: false,
  
  setUser: (user) => set({ user }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  updateUser: (updates) => {
    const currentUser = get().user
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } })
    }
  },
  
  addAddress: (address) => {
    const user = get().user
    if (user) {
      const addresses = user.addresses || []
      set({
        user: {
          ...user,
          addresses: [...addresses, { ...address, _id: Date.now().toString() }]
        }
      })
    }
  },
  
  updateAddress: (addressId, updates) => {
    const user = get().user
    if (user && user.addresses) {
      set({
        user: {
          ...user,
          addresses: user.addresses.map(addr =>
            addr._id === addressId ? { ...addr, ...updates } : addr
          )
        }
      })
    }
  },
  
  removeAddress: (addressId) => {
    const user = get().user
    if (user && user.addresses) {
      set({
        user: {
          ...user,
          addresses: user.addresses.filter(addr => addr._id !== addressId)
        }
      })
    }
  },
  
  setDefaultAddress: (addressId) => {
    const user = get().user
    if (user && user.addresses) {
      set({
        user: {
          ...user,
          addresses: user.addresses.map(addr => ({
            ...addr,
            isDefault: addr._id === addressId
          }))
        }
      })
    }
  }
}))

// Search Store
interface SearchStore {
  query: string
  filters: {
    category?: string
    priceRange?: [number, number]
    rating?: number
    inStock?: boolean
    tags?: string[]
  }
  results: IProduct[]
  isLoading: boolean
  setQuery: (query: string) => void
  setFilters: (filters: Partial<SearchStore['filters']>) => void
  setResults: (results: IProduct[]) => void
  setLoading: (loading: boolean) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchStore>()((set, get) => ({
  query: '',
  filters: {},
  results: [],
  isLoading: false,
  
  setQuery: (query) => set({ query }),
  
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
  },
  
  setResults: (results) => set({ results }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearFilters: () => set({ filters: {} })
}))

// Toast/Notification Store
interface NotificationStore {
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }>
  addNotification: (notification: Omit<NotificationStore['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    
    set({
      notifications: [...get().notifications, newNotification]
    })
    
    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration || 5000
    setTimeout(() => {
      get().removeNotification(id)
    }, duration)
  },
  
  removeNotification: (id) => {
    set({
      notifications: get().notifications.filter(n => n.id !== id)
    })
  },
  
  clearAll: () => set({ notifications: [] })
}))

// Recently Viewed Store
interface RecentlyViewedStore {
  products: number[]
  addProduct: (productId: number) => void
  clearHistory: () => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (productId) => {
        const products = get().products.filter(id => id !== productId)
        // Keep only last 10 viewed products
        const updatedProducts = [productId, ...products].slice(0, 10)
        set({ products: updatedProducts })
      },
      
      clearHistory: () => set({ products: [] })
    }),
    {
      name: 'recently-viewed-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Auth Store
interface AuthStore {
  user: IUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: IUser, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<IUser>) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<boolean>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (userData, token) => {
        set({ 
          user: userData, 
          isAuthenticated: true 
        })
        // Store token securely in both localStorage and cookies
        TokenStorage.set(token)
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        })
        // Clear token from all storage locations
        TokenStorage.clear()
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Check if user is authenticated with valid token
      checkAuth: async () => {
        const token = TokenStorage.get()
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return false
        }

        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            set({ 
              user: userData.user, 
              isAuthenticated: true 
            })
            return true
          } else {
            // Token is invalid, clear auth
            get().logout()
            return false
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          get().logout()
          return false
        }
      },

      // Initialize authentication state
      initializeAuth: async () => {
        const token = TokenStorage.get()
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            set({ 
              user: userData.user, 
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            // Token is invalid, clear auth
            get().logout()
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          get().logout()
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated from localStorage, check token validity
        if (state?.user && state?.isAuthenticated) {
          // Check if token still exists in storage
          if (!TokenStorage.exists()) {
            // No token but user exists in store, clear auth state
            state.user = null
            state.isAuthenticated = false
          }
          // Token existence verified, AuthProvider will handle validation
        }
      }
    }
  )
)
