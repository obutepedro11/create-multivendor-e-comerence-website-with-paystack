"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProductById, getVendorById, getCategoryById } from "@/lib/data-utils"

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart, cart } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, these would be API calls
    const fetchedProduct = getProductById(productId)
    if (fetchedProduct) {
      setProduct(fetchedProduct)

      const fetchedVendor = getVendorById(fetchedProduct.vendorId)
      setVendor(fetchedVendor)

      const fetchedCategory = getCategoryById(fetchedProduct.categoryId)
      setCategory(fetchedCategory)
    }

    setIsLoading(false)
  }, [productId])

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= (product?.stock || 1)) {
      setQuantity(value)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        vendorId: product.vendorId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0],
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-auto pb-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  className={`relative h-20 w-20 overflow-hidden rounded-md border ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= 4 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(24 reviews)</span>
            </div>
          </div>

          <div className="text-3xl font-bold">₦{product.price.toLocaleString()}</div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {vendor && (
              <div>
                <h3 className="mb-2 font-medium">Vendor</h3>
                <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-2 text-primary hover:underline">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <Image
                      src={vendor.vendorInfo?.logo || "/placeholder.svg"}
                      alt={vendor.vendorInfo?.storeName || vendor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>{vendor.vendorInfo?.storeName || vendor.name}</span>
                </Link>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-medium">Availability</h3>
              <p className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-medium">Quantity</h3>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                  className="mx-2 w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Product Specifications</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                  <p className="text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              JD
                            </span>
                          </div>
                          <span className="font-medium">John Doe</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= 5 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great product! Exactly as described and arrived quickly.
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                              JS
                            </span>
                          </div>
                          <span className="font-medium">Jane Smith</span>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= 4 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Good quality but slightly smaller than I expected. Overall satisfied with my purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Shipping Information</h3>
                  <p className="text-muted-foreground">
                    We ship to most countries worldwide. Shipping times vary depending on your location:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Domestic: 3-5 business days</li>
                    <li>International: 7-14 business days</li>
                  </ul>

                  <h3 className="text-lg font-semibold">Return Policy</h3>
                  <p className="text-muted-foreground">
                    We accept returns within 30 days of delivery. Items must be unused and in original packaging.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{cart.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₦1,500</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>₦{(cart.total * 0.075).toLocaleString()}</span>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₦{(cart.total + 1500 + cart.total * 0.075).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
