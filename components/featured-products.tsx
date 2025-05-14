"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getFeaturedProducts, getVendorById } from "@/lib/data-utils"
import { initializeLocalStorage } from "@/lib/data-utils"

type Product = {
  id: string
  name: string
  description: string
  price: number
  vendorId: string
  images: string[]
  stock: number
  featured: boolean
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Record<string, any>>({})
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize local storage if needed
    if (typeof window !== "undefined") {
      initializeLocalStorage()
    }

    // In a real app, this would be an API call
    const featuredProducts = getFeaturedProducts()
    setProducts(featuredProducts)

    // Get vendor info for each product
    const vendorMap: Record<string, any> = {}
    featuredProducts.forEach((product: Product) => {
      if (!vendorMap[product.vendorId]) {
        const vendor = getVendorById(product.vendorId)
        if (vendor) {
          vendorMap[product.vendorId] = vendor
        }
      }
    })
    setVendors(vendorMap)
    setIsLoading(false)
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No featured products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Link href={`/products/${product.id}`}>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
            </div>
          </Link>
          <CardContent className="p-4">
            <div className="space-y-1">
              <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                {product.name}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              {vendors[product.vendorId] && (
                <Link href={`/vendors/${product.vendorId}`} className="text-xs text-muted-foreground hover:underline">
                  {vendors[product.vendorId].vendorInfo?.storeName || vendors[product.vendorId].name}
                </Link>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 pt-0">
            <div className="font-semibold">₦{product.price.toLocaleString()}</div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Add to wishlist</span>
              </Button>
              <Button size="sm" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
