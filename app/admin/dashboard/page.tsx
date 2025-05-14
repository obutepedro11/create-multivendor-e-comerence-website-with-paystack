"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { BarChart, DollarSign, Package, ShoppingBag, Users } from "lucide-react"
import { getProducts, getVendors, getOrders } from "@/lib/data-utils"

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalVendors: 0,
    pendingVendors: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You do not have permission to access the admin dashboard",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Fetch dashboard data
    const products = getProducts()
    const vendors = getVendors()
    const orders = getOrders()

    // Calculate stats
    const totalSales = orders.reduce((sum: number, order: any) => sum + order.total, 0)
    const pendingVendors = vendors.filter((v: any) => !v.vendorInfo?.approved).length

    setStats({
      totalSales,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalVendors: vendors.length,
      pendingVendors,
    })

    // Get recent orders
    setRecentOrders(orders.slice(0, 5))
  }, [user, router, toast])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/admin/vendors/pending">
            {stats.pendingVendors > 0 && <>Pending Vendors ({stats.pendingVendors})</>}
            {stats.pendingVendors === 0 && <>Manage Vendors</>}
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <h3 className="text-2xl font-bold">{stats.totalVendors}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders across all vendors</CardDescription>
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
                      <div className="font-medium">${order.total.toFixed(2)}</div>
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
        <Tabs defaultValue="products">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>Manage all products across vendors</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/products">View All Products</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From here you can view, edit, and manage all products in the marketplace.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="vendors" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>Manage all vendors on the platform</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/vendors">View All Vendors</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">From here you can approve, suspend, or manage vendor accounts.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="customers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Customer Management</CardTitle>
                  <CardDescription>Manage all customers on the platform</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/customers">View All Customers</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">From here you can view and manage customer accounts.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
