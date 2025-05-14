"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { getOrderById } from "@/lib/data-utils"
import { ArrowLeft, CheckCircle, Truck, Package, Clock } from "lucide-react"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Fetch order details
    const fetchedOrder = getOrderById(orderId)

    if (!fetchedOrder) {
      toast({
        title: "Order not found",
        description: "The order you are looking for does not exist",
        variant: "destructive",
      })
      router.push("/account/orders")
      return
    }

    // Check if user has access to this order
    if (fetchedOrder.userId !== user.id && user.role !== "admin") {
      toast({
        title: "Access denied",
        description: "You do not have permission to view this order",
        variant: "destructive",
      })
      router.push("/account/orders")
      return
    }

    setOrder(fetchedOrder)
    setIsLoading(false)
  }, [orderId, user, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return null
  }

  // Get order status step (1-4)
  const getOrderStep = () => {
    switch (order.status) {
      case "pending":
        return 1
      case "processing":
        return 2
      case "shipped":
        return 3
      case "delivered":
        return 4
      default:
        return 1
    }
  }

  const orderStep = getOrderStep()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/account/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order #{orderId.slice(0, 8)}</h1>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6 mt-2">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-muted" />
              <div
                className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary transition-all duration-500"
                style={{ width: `${(orderStep - 1) * 33.33}%` }}
              />
              <div className="relative z-10 flex justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      orderStep >= 1
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background"
                    }`}
                  >
                    {orderStep > 1 ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <span className="mt-2 text-xs font-medium">Pending</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      orderStep >= 2
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background"
                    }`}
                  >
                    {orderStep > 2 ? <CheckCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  <span className="mt-2 text-xs font-medium">Processing</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      orderStep >= 3
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background"
                    }`}
                  >
                    {orderStep > 3 ? <CheckCircle className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                  </div>
                  <span className="mt-2 text-xs font-medium">Shipped</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      orderStep >= 4
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background"
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="mt-2 text-xs font-medium">Delivered</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium">
                {order.status === "pending" && "Your order has been received and is being reviewed."}
                {order.status === "processing" && "Your order is being processed and prepared for shipping."}
                {order.status === "shipped" && "Your order has been shipped and is on its way to you."}
                {order.status === "delivered" && "Your order has been delivered. Thank you for shopping with us!"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Order placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                          {item.name}
                        </Link>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Unit Price: ₦{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm">Quantity: {item.quantity}</div>
                    </div>
                    <div className="text-right font-medium">₦{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{order.shippingInfo.fullName}</p>
                    <p>{order.shippingInfo.email}</p>
                    <p>{order.shippingInfo.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Delivery Address</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>{order.shippingInfo.address}</p>
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                    </p>
                    <p>{order.shippingInfo.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Payment Method:</div>
                  <div className="flex items-center gap-2">
                    {order.paymentMethod === "paystack" ? (
                      <>
                        <Image
                          src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png"
                          alt="Paystack"
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                        <span>Paystack</span>
                      </>
                    ) : (
                      <>
                        <Image
                          src="https://cdn.filestackcontent.com/OITnwQnSemkfi5qu2qlH"
                          alt="Flutterwave"
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                        <span>Flutterwave</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Reference: {order.paymentReference}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₦{order.shipping?.toLocaleString() || "1,500"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (7.5%)</span>
                  <span>₦{order.tax?.toLocaleString() || (order.total * 0.075).toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  ₦{order.grandTotal?.toLocaleString() || (order.total + 1500 + order.total * 0.075).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
