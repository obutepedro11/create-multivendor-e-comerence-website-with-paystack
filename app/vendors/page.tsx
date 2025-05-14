"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getVendors, getProductsByVendor } from "@/lib/data-utils"
import { initializeLocalStorage } from "@/lib/data-utils"

type Vendor = {
  id: string
  name: string
  vendorInfo?: {
    storeName: string
    description: string
    logo: string
    banner: string
    approved: boolean
  }
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Initialize local storage if needed
      if (typeof window !== "undefined") {
        initializeLocalStorage()
      }

      // Fetch vendors
      const allVendors = getVendors().filter((v: Vendor) => v.vendorInfo?.approved)
      setVendors(allVendors)
      setFilteredVendors(allVendors)

      // Get product count for each vendor
      const counts: Record<string, number> = {}
      allVendors.forEach((vendor: Vendor) => {
        const vendorProducts = getProductsByVendor(vendor.id)
        counts[vendor.id] = vendorProducts.length
      })
      setProductCounts(counts)
    } catch (error) {
      console.error("Error loading vendors:", error)
      setError("Failed to load vendors. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Filter vendors based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = vendors.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vendor.vendorInfo?.storeName &&
            vendor.vendorInfo.storeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (vendor.vendorInfo?.description &&
            vendor.vendorInfo.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredVendors(filtered)
    } else {
      setFilteredVendors(vendors)
    }
  }, [searchTerm, vendors])

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Error</h1>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">All Vendors</h1>

      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="overflow-hidden">
              <Link href={`/vendors/${vendor.id}`}>
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={vendor.vendorInfo?.banner || "/placeholder.svg"}
                    alt={vendor.vendorInfo?.storeName || vendor.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-semibold text-white">{vendor.vendorInfo?.storeName || vendor.name}</h3>
                  </div>
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                    <Image
                      src={vendor.vendorInfo?.logo || "/placeholder.svg"}
                      alt={vendor.vendorInfo?.storeName || vendor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{productCounts[vendor.id] || 0} Products</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {vendor.vendorInfo?.description || "No description available"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/vendors/${vendor.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Visit Store
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
