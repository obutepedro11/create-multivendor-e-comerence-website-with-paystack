"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, DollarSign, Package, ShoppingBag, Plus } from "lucide-react"
import { getProductsByVendor, getOrdersByVendor } from "@/lib/data-utils"

export default function VendorDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    // Check if user is vendor
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "vendor") {
      toast({
        title: "Access denied",
        description: "You do not have permission to access the vendor dashboard",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch vendor data
    const vendorProducts = getProductsByVendor(user.id)
    const vendorOrders = getOrdersByVendor(user.id)

    // Calculate stats
    const totalSales = vendorOrders.reduce((sum: number, order: any) => {
      // Calculate only this vendor's items in each order
      const vendorItems = order.items.filter((item: any) => item.vendorId === user.id)
      return sum + vendorItems.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0)
    }, 0)

    const pendingOrders = vendorOrders.filter((order: any) => order.status === "pending").length

    setStats({
      totalSales,
      totalOrders: vendorOrders.length,
      totalProducts: vendorProducts.length,
      pendingOrders,
    })

    // Get recent orders
    setRecentOrders(vendorOrders.slice(0, 5))

    // Get products
    setProducts(vendorProducts.slice(0, 5))
  }, [user, router, toast])

  if (!user || user.role !== "vendor") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <Button asChild>
          <Link href="/vendor/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <h3 className="text-2xl font-bold">₦{stats.totalSales.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest 5 orders</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₦
                        {order.items
                          .filter((item: any) => item.vendorId === user.id)
                          .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
                          .toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Analytics</CardTitle>
            <CardDescription>Revenue overview for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <BarChart className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Analytics visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <Button asChild>
              <Link href="/vendor/products">View All Products</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No products yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding your first product to the marketplace.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/vendor/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {product.stock} | ₦{product.price.toLocaleString()}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/vendor/products/${product.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
