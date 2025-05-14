"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Heart, Mail, MapPin, Phone } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getVendorById, getProductsByVendor } from "@/lib/data-utils"
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

type Vendor = {
  id: string
  name: string
  email: string
  createdAt: string
  vendorInfo?: {
    storeName: string
    description: string
    logo: string
    banner: string
    approved: boolean
  }
}

export default function VendorPage() {
  const params = useParams()
  const vendorId = params.id as string
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    try {
      // Initialize local storage if needed
      if (typeof window !== "undefined") {
        initializeLocalStorage()
      }

      // Fetch vendor and products
      const fetchedVendor = getVendorById(vendorId)
      if (fetchedVendor) {
        setVendor(fetchedVendor)
        const vendorProducts = getProductsByVendor(vendorId)
        setProducts(vendorProducts)
      } else {
        setError("Vendor not found")
      }
    } catch (error) {
      console.error("Error loading vendor:", error)
      setError("Failed to load vendor information. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [vendorId])

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
      <div className="container mx-auto flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Vendor Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The vendor you are looking for does not exist or has been removed.
          </p>
          <Link href="/vendors">
            <Button>Back to Vendors</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="relative h-64 w-full overflow-hidden rounded-lg">
          <Image
            src={vendor.vendorInfo?.banner || "/placeholder.svg"}
            alt={vendor.vendorInfo?.storeName || vendor.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-background">
                <Image
                  src={vendor.vendorInfo?.logo || "/placeholder.svg"}
                  alt={vendor.vendorInfo?.storeName || vendor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{vendor.vendorInfo?.storeName || vendor.name}</h1>
                <p className="text-sm text-white/80">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Contact Vendor
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">About the Vendor</h2>
              <p className="mb-6 text-muted-foreground">
                {vendor.vendorInfo?.description || "No description available."}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Lagos, Nigeria</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+234 800 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{vendor.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="products">
            <TabsList className="w-full">
              <TabsTrigger value="products" className="flex-1">
                Products
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-muted-foreground">This vendor has no products yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold">Customer Reviews</h2>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                          JD
                        </span>
                      </div>
                      <span className="font-medium">John Doe</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Great vendor! Products were exactly as described and shipping was fast.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
