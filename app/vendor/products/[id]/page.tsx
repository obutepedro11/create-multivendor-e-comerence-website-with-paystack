"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getCategories, getProductById } from "@/lib/data-utils"
import { initializeLocalStorage } from "@/lib/data-utils"
import { ArrowLeft } from "lucide-react"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    featured: false,
    images: [""],
  })

  useEffect(() => {
    // Initialize local storage
    if (typeof window !== "undefined") {
      initializeLocalStorage()
    }

    // Check if user is vendor
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "vendor") {
      toast({
        title: "Access denied",
        description: "You do not have permission to edit products",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch product
    const product = getProductById(productId)

    if (!product) {
      toast({
        title: "Product not found",
        description: "The product you are trying to edit does not exist",
        variant: "destructive",
      })
      router.push("/vendor/products")
      return
    }

    // Check if product belongs to vendor
    if (product.vendorId !== user.id) {
      toast({
        title: "Access denied",
        description: "You do not have permission to edit this product",
        variant: "destructive",
      })
      router.push("/vendor/products")
      return
    }

    // Set product data
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      featured: product.featured || false,
      images: product.images || [""],
    })

    // Fetch categories
    const allCategories = getCategories()
    setCategories(allCategories)

    setIsLoading(false)
  }, [user, router, toast, productId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProductData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProductData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    setProductData((prev) => {
      const newImages = [...prev.images]
      newImages[index] = value
      return { ...prev, images: newImages }
    })
  }

  const addImageField = () => {
    setProductData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }))
  }

  const removeImageField = (index: number) => {
    if (productData.images.length <= 1) return

    setProductData((prev) => {
      const newImages = [...prev.images]
      newImages.splice(index, 1)
      return { ...prev, images: newImages }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.categoryId ||
      !productData.stock
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate price and stock
    const price = Number.parseFloat(productData.price)
    const stock = Number.parseInt(productData.stock)

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price",
        variant: "destructive",
      })
      return
    }

    if (isNaN(stock) || stock < 0) {
      toast({
        title: "Invalid stock",
        description: "Please enter a valid stock quantity",
        variant: "destructive",
      })
      return
    }

    // Validate images
    if (productData.images.some((img) => !img)) {
      toast({
        title: "Invalid images",
        description: "Please provide valid image URLs for all image fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get all products
      const allProducts = JSON.parse(localStorage.getItem("products") || "[]")

      // Find product index
      const productIndex = allProducts.findIndex((p: any) => p.id === productId)

      if (productIndex === -1) {
        throw new Error("Product not found")
      }

      // Update product
      allProducts[productIndex] = {
        ...allProducts[productIndex],
        name: productData.name,
        description: productData.description,
        price: Number.parseFloat(productData.price),
        categoryId: productData.categoryId,
        images: productData.images,
        stock: Number.parseInt(productData.stock),
        featured: productData.featured,
        updatedAt: new Date().toISOString(),
      }

      // Save to localStorage
      localStorage.setItem("products", JSON.stringify(allProducts))

      toast({
        title: "Product updated",
        description: "Your product has been updated successfully",
      })

      // Redirect to vendor products
      router.push("/vendor/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "There was an error updating your product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={productData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={5}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      value={productData.stock}
                      onChange={handleInputChange}
                      placeholder="1"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={productData.categoryId}
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                    required
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={productData.featured}
                    onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {productData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`image-${index}`}>Image URL {index + 1}</Label>
                      <Input
                        id={`image-${index}`}
                        value={image}
                        onChange={(e) => handleImageChange(e, index)}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    {productData.images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="mt-8"
                        onClick={() => removeImageField(index)}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addImageField}>
                  Add Another Image
                </Button>
                <div className="text-sm text-muted-foreground">
                  <p>You can use image URLs from services like Unsplash or other image hosting sites.</p>
                  <p>Example: https://images.unsplash.com/photo-1505740420928-5e560c06d30e</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Product Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4">
                  <div className="aspect-square overflow-hidden rounded-md bg-muted">
                    {productData.images[0] ? (
                      <img
                        src={productData.images[0] || "/placeholder.svg"}
                        alt="Product preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No image provided
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium">{productData.name || "Product Name"}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {productData.description || "Product description will appear here"}
                    </p>
                    <div className="mt-2 font-bold">
                      ₦{productData.price ? Number.parseFloat(productData.price).toLocaleString() : "0.00"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Updating Product..." : "Update Product"}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/vendor/products">Cancel</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
