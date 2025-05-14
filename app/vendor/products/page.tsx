"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { getProductsByVendor } from "@/lib/data-utils"
import { initializeLocalStorage } from "@/lib/data-utils"
import { Plus, Search, Edit, Trash2 } from "lucide-react"

export default function VendorProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
        description: "You do not have permission to access vendor products",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch vendor products
    const vendorProducts = getProductsByVendor(user.id)
    setProducts(vendorProducts)
    setFilteredProducts(vendorProducts)
    setIsLoading(false)
  }, [user, router, toast])

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const handleDeleteProduct = (productId: string) => {
    try {
      // Get all products from localStorage
      const allProducts = JSON.parse(localStorage.getItem("products") || "[]")

      // Filter out the product to delete
      const updatedProducts = allProducts.filter((p: any) => p.id !== productId)

      // Save back to localStorage
      localStorage.setItem("products", JSON.stringify(updatedProducts))

      // Update state
      const updatedVendorProducts = products.filter((p) => p.id !== productId)
      setProducts(updatedVendorProducts)
      setFilteredProducts(updatedVendorProducts)

      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "There was an error deleting the product. Please try again.",
        variant: "destructive",
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>No Products Found</CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            {products.length === 0 ? (
              <>
                <p className="mb-6 text-muted-foreground">You haven&apos;t added any products yet.</p>
                <Button asChild>
                  <Link href="/vendor/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">No products match your search criteria.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/products/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">₦{product.price.toLocaleString()}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                      </span>
                      {product.featured && (
                        <>
                          <span className="text-muted-foreground">|</span>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Featured
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/vendor/products/${product.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this product?")) {
                          handleDeleteProduct(product.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
