 import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ICartItem, IProduct, IUser, Address } from '@/lib/models'
import { TokenStorage } from '@/lib/cookies'
import { AuthUtils } from '@/lib/auth-utils'

// Guest cart item (doesn't require userId)
interface GuestCartItem {
  _id?: string
  productId: string  // Changed from number to string to store ObjectId
  variantId?: string
  quantity: number
  price: number
  addedAt: Date
}

// Cart Store
interface CartStore {
  items: (ICartItem | GuestCartItem)[]
  isOpen: boolean
  isLoading: boolean
  addItem: (item: Omit<ICartItem, 'addedAt' | 'userId' | '_id'>) => Promise<void>
  removeItem: (productId: string, variantId?: string) => Promise<void>  // Changed from number to string
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>  // Changed from number to string
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
          console.log('Adding item to cart:', newItem)
          const { isAuthenticated } = useAuthStore.getState()
          
          // Always call API to validate product exists and is in stock
          const response = isAuthenticated 
            ? await AuthUtils.authenticatedFetch('/api/cart', {
                method: 'POST',
                body: JSON.stringify({
                  productId: newItem.productId,
                  quantity: newItem.quantity,
                  variantId: newItem.variantId,
                  price: newItem.price
                })
              })
            : await fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  productId: newItem.productId,
                  quantity: newItem.quantity,
                  variantId: newItem.variantId,
                  price: newItem.price
                })
              })

          if (response.ok) {
            const result = await response.json()
            console.log('Cart API response:', result)
            
            if (isAuthenticated) {
              // Reload cart from server for authenticated users
              await get().loadCart()
            } else {
              // Update local storage for guest users
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
          } else {
            const errorData = await response.json()
            console.error('Cart API error:', errorData)
            throw new Error(errorData.error || 'Failed to add item to cart')
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
            const response = await AuthUtils.authenticatedFetch('/api/cart', {
              method: 'DELETE',
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
            const response = await AuthUtils.authenticatedFetch('/api/cart', {
              method: 'PUT',
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
            const response = await AuthUtils.authenticatedFetch('/api/cart', {
              method: 'DELETE'
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
          const response = await AuthUtils.authenticatedFetch('/api/cart')

          if (response.ok) {
            const data = await response.json()
            set({ items: data.items || [] })
          } else {
            console.error('Failed to load cart:', response.statusText)
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
  items: string[]
  isLoading: boolean
  addItem: (productId: string) => Promise<boolean>
  removeItem: (productId: string) => Promise<boolean>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  loadWishlist: () => Promise<void>
  syncWithServer: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      addItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState()
        const items = get().items
        
        if (items.includes(productId)) return true
        
        // Optimistically update local state
        set({ items: [...items, productId] })
        
        if (isAuthenticated) {
          try {
            const response = await AuthUtils.authenticatedFetch('/api/user/wishlist', {
              method: 'POST',
              body: JSON.stringify({ productId })
            })

            if (!response.ok) {
              // Revert on error
              set({ items: items })
              console.error('Failed to add to wishlist:', response.statusText)
              return false
            }
            return true
          } catch (error) {
            // Revert on error
            set({ items: items })
            console.error('Error adding to wishlist:', error)
            return false
          }
        }

        return true
      },
      
      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState()
        const items = get().items
        const newItems = items.filter(id => id !== productId)
        
        // Optimistically update local state
        set({ items: newItems })
        
        if (isAuthenticated) {
          try {
            const response = await AuthUtils.authenticatedFetch('/api/user/wishlist', {
              method: 'DELETE',
              body: JSON.stringify({ productId })
            })

            if (!response.ok) {
              // Revert on error
              set({ items: items })
              console.error('Failed to remove from wishlist:', response.statusText)
              return false
            }
            return true
          } catch (error) {
            // Revert on error
            set({ items: items })
            console.error('Error removing from wishlist:', error)
            return false
          }
        }

        return true
      },
      
      isInWishlist: (productId) => get().items.includes(productId),
      
      clearWishlist: () => set({ items: [] }),
      
      loadWishlist: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return

        try {
          set({ isLoading: true })
          const response = await AuthUtils.authenticatedFetch('/api/user/wishlist')

          if (response.ok) {
            const data = await response.json()
            const productIds = (data.items || []).map((item: any) => {
              // data.items contain { id: productId, product: { id: string | number } }
              const pid = item.product?.id ?? item.id ?? item.productId
              return pid ? String(pid) : null
            }).filter(Boolean)
            set({ items: productIds as string[] })
          } else {
            console.error('Failed to load wishlist:', response.statusText)
          }
        } catch (error) {
          console.error('Error loading wishlist:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      syncWithServer: async () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) return
        
        await get().loadWishlist()
      }
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
