'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Minus, Plus, Package, Truck, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'
import { IProduct, ProductVariant } from '@/lib/models'

interface AddToCartProps {
  product: IProduct
}

export default function AddToCart({ product }: AddToCartProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  
  const { addItem, isLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  // Get current price and stock based on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.price
  const currentStock = selectedVariant ? selectedVariant.stockCount : product.stockCount
  const maxQuantity = Math.min(currentStock, 10) // Limit to 10 items max

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!product._id) {
      toast.error('Product ID is missing')
      return
    }

    if (!product.inStock || currentStock <= 0) {
      toast.error('Product out of stock')
      return
    }

    console.log('Add to cart clicked:', { 
      productId: product._id, 
      quantity, 
      variantId: selectedVariant?.id,
      price: currentPrice 
    })

    setIsAdding(true)
    
    try {
      await addItem({
        productId: product._id!,
        quantity,
        variantId: selectedVariant?.id,
        price: currentPrice
      })
      
      console.log('Item added successfully')
      
      if (isAuthenticated) {
        toast.success(`Added ${quantity} ${product.name} to cart`)
      } else {
        toast.success(`Added ${quantity} ${product.name} to cart (Guest mode)`)
      }
      
      // Reset quantity to 1 after adding
      setQuantity(1)
    } catch (error) {
      console.error('Add to cart error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a purchase')
      return
    }

    await handleAddToCart()
    // Redirect to cart/checkout page
    window.location.href = '/cart'
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#355E3B]">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="destructive" className="bg-red-500">
                    {Math.round(((product.originalPrice - currentPrice) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">Inclusive of all taxes</p>
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Select Size/Weight:
              </label>
              <Select
                value={selectedVariant?.id}
                onValueChange={(value) => {
                  const variant = product.variants?.find(v => v.id === value)
                  setSelectedVariant(variant || null)
                  setQuantity(1) // Reset quantity when variant changes
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{variant.name} ({variant.value})</span>
                        <span className="ml-4">Rs. {variant.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Quantity:
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                min={1}
                max={maxQuantity}
                className="w-20 text-center h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-500">
                (Max: {maxQuantity})
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">
              {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock || currentStock <= 0 || isAdding || isLoading}
              className="w-full bg-[#355E3B] hover:bg-[#2d4f31] text-white h-12"
            >
              {isAdding || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleBuyNow}
              disabled={!product.inStock || currentStock <= 0 || isAdding || isLoading}
              className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white h-12"
            >
              Buy Now
            </Button>
          </div>

          {/* Delivery Info */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>Free delivery on orders above Rs. 999</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span>100% authentic products</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
