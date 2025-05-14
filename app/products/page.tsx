"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Heart, Search } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { getProducts, getCategories, getVendors } from "@/lib/data-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeLocalStorage } from "@/lib/data-utils"

type Product = {
  id: string
  name: string
  description: string
  price: number
  vendorId: string
  categoryId: string
  images: string[]
  stock: number
}

type Category = {
  id: string
  name: string
  slug: string
}

type Vendor = {
  id: string
  name: string
  vendorInfo: {
    storeName: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [sortBy, setSortBy] = useState("featured")
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize local storage if needed
    if (typeof window !== "undefined") {
      initializeLocalStorage()
    }

    // In a real app, these would be API calls
    const allProducts = getProducts()
    const allCategories = getCategories()
    const allVendors = getVendors().filter((v: Vendor) => v.vendorInfo?.approved)

    setProducts(allProducts)
    setFilteredProducts(allProducts)
    setCategories(allCategories)
    setVendors(allVendors)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let result = [...products]

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.categoryId))
    }

    // Apply vendor filter
    if (selectedVendors.length > 0) {
      result = result.filter((product) => selectedVendors.includes(product.vendorId))
    }

    // Apply price filter
    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredProducts(result)
  }, [products, searchTerm, selectedCategories, selectedVendors, priceRange, sortBy])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendors((prev) => (prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]))
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">All Products</h1>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr]">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Vendors</h3>
            <div className="space-y-2">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vendor-${vendor.id}`}
                    checked={selectedVendors.includes(vendor.id)}
                    onCheckedChange={() => handleVendorChange(vendor.id)}
                  />
                  <Label htmlFor={`vendor-${vendor.id}`}>{vendor.vendorInfo?.storeName || vendor.name}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Price Range (₦)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>₦{priceRange[0].toLocaleString()}</span>
                <span>₦{priceRange[1].toLocaleString()}</span>
              </div>
              <div className="flex gap-4">
                <Input
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                />
                <Input
                  type="number"
                  min="0"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          {filteredProducts.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
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
                      {vendors.find((v) => v.id === product.vendorId) && (
                        <Link
                          href={`/vendors/${product.vendorId}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          {vendors.find((v) => v.id === product.vendorId)?.vendorInfo?.storeName ||
                            vendors.find((v) => v.id === product.vendorId)?.name}
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
          )}
        </div>
      </div>
    </div>
  )
}
