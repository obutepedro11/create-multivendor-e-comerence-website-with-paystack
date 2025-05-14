"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export function VendorShowcase() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      // Initialize local storage if needed
      if (typeof window !== "undefined") {
        initializeLocalStorage()
      }

      // In a real app, this would be an API call
      const allVendors = getVendors().filter((v: Vendor) => v.vendorInfo?.approved)
      setVendors(allVendors.slice(0, 4)) // Show only 4 vendors

      // Get product count for each vendor
      const counts: Record<string, number> = {}
      allVendors.forEach((vendor: Vendor) => {
        const vendorProducts = getProductsByVendor(vendor.id)
        counts[vendor.id] = vendorProducts.length
      })
      setProductCounts(counts)
    } catch (error) {
      console.error("Error loading vendor showcase:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No vendors found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {vendors.map((vendor) => (
        <Card key={vendor.id} className="overflow-hidden">
          <Link href={`/vendors/${vendor.id}`}>
            <div className="relative h-32 overflow-hidden">
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
  )
}
