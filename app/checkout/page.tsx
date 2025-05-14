"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { initializePaystack, initializeFlutterwave, verifyPayment } from "@/lib/payment-utils"
import { saveOrder } from "@/lib/data-utils"
import Script from "next/script"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [paymentOption, setPaymentOption] = useState("card")
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false)

  useEffect(() => {
    // Check if cart is empty
    if (cart.items.length === 0) {
      router.push("/cart")
    }
  }, [cart.items.length, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaystackPayment = async () => {
    try {
      setIsProcessing(true)

      // Calculate total amount in kobo (Paystack uses the smallest currency unit)
      const amount = Math.round((cart.total + 1500 + cart.total * 0.075) * 100)

      // Initialize transaction
      const response = await initializePaystack(shippingInfo.email, amount, (reference) => {
        // This callback will be called when the payment is completed
        processOrder(reference, "paystack")
      })

      // In a real implementation, you would redirect to the authorization URL
      // window.location.href = response.authorization_url

      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        processOrder(response.reference, "paystack")
      }, 2000)
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFlutterwavePayment = async () => {
    try {
      setIsProcessing(true)

      // Calculate total amount (Flutterwave uses the actual currency amount)
      const amount = Math.round(cart.total + 1500 + cart.total * 0.075)

      // Initialize transaction
      const response = await initializeFlutterwave(shippingInfo.email, amount, (reference) => {
        // This callback will be called when the payment is completed
        processOrder(reference, "flutterwave")
      })

      // In a real implementation, you would redirect to the authorization URL
      // window.location.href = response.authorization_url

      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        processOrder(response.reference, "flutterwave")
      }, 2000)
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const processOrder = async (reference: string, provider: string) => {
    try {
      // Verify payment
      const verification = await verifyPayment(reference)

      if (verification.status === "success") {
        // Create order in localStorage
        const orderId = crypto.randomUUID()

        const newOrder = {
          id: orderId,
          userId: user?.id,
          items: cart.items,
          total: cart.total,
          shipping: 1500,
          tax: cart.total * 0.075,
          grandTotal: cart.total + 1500 + cart.total * 0.075,
          shippingInfo,
          paymentMethod: provider,
          paymentReference: reference,
          status: "pending",
          createdAt: new Date().toISOString(),
        }

        // Save order
        saveOrder(newOrder)

        // Clear cart
        clearCart()

        setIsProcessing(false)

        toast({
          title: "Order placed successfully",
          description: `Your order #${orderId.slice(0, 8)} has been placed`,
        })

        router.push(`/account/orders/${orderId}`)
      } else {
        throw new Error("Payment verification failed")
      }
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Order processing failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const requiredFields = ["fullName", "email", "phone", "address", "city", "state", "zipCode", "country"]
    const emptyFields = requiredFields.filter((field) => !shippingInfo[field as keyof typeof shippingInfo])

    if (emptyFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Process payment based on selected method
    if (paymentMethod === "paystack") {
      handlePaystackPayment()
    } else if (paymentMethod === "flutterwave") {
      handleFlutterwavePayment()
    }
  }

  if (cart.items.length === 0) {
    return null
  }

  return (
    <>
      {/* Load payment scripts */}
      <Script src="https://js.paystack.co/v1/inline.js" onLoad={() => setPaystackLoaded(true)} />
      <Script src="https://checkout.flutterwave.com/v3.js" onLoad={() => setFlutterwaveLoaded(true)} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <form onSubmit={handleSubmit}>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="paystack" onValueChange={setPaymentMethod}>
                    <TabsList className="w-full">
                      <TabsTrigger value="paystack" className="flex-1">
                        <div className="flex items-center gap-2">
                          <Image
                            src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png"
                            alt="Paystack"
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                          Paystack
                        </div>
                      </TabsTrigger>
                      <TabsTrigger value="flutterwave" className="flex-1">
                        <div className="flex items-center gap-2">
                          <Image
                            src="https://cdn.filestackcontent.com/OITnwQnSemkfi5qu2qlH"
                            alt="Flutterwave"
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                          Flutterwave
                        </div>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="paystack" className="mt-4">
                      <div className="rounded-lg border p-4">
                        <RadioGroup defaultValue="card" value={paymentOption} onValueChange={setPaymentOption}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="card" id="paystack-card" />
                            <Label htmlFor="paystack-card" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                                alt="Card"
                                width={24}
                                height={24}
                              />
                              Card Payment
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bank" id="paystack-bank" />
                            <Label htmlFor="paystack-bank" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png"
                                alt="Bank"
                                width={24}
                                height={24}
                              />
                              Bank Transfer
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ussd" id="paystack-ussd" />
                            <Label htmlFor="paystack-ussd" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/2920/2920229.png"
                                alt="USSD"
                                width={24}
                                height={24}
                              />
                              USSD
                            </Label>
                          </div>
                        </RadioGroup>
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            You will be redirected to Paystack to complete your payment.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="flutterwave" className="mt-4">
                      <div className="rounded-lg border p-4">
                        <RadioGroup defaultValue="card" value={paymentOption} onValueChange={setPaymentOption}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="card" id="flutterwave-card" />
                            <Label htmlFor="flutterwave-card" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                                alt="Card"
                                width={24}
                                height={24}
                              />
                              Card Payment
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="bank" id="flutterwave-bank" />
                            <Label htmlFor="flutterwave-bank" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png"
                                alt="Bank"
                                width={24}
                                height={24}
                              />
                              Bank Transfer
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="mobile" id="flutterwave-mobile" />
                            <Label htmlFor="flutterwave-mobile" className="flex items-center gap-2">
                              <Image
                                src="https://cdn-icons-png.flaticon.com/512/0/191.png"
                                alt="Mobile Money"
                                width={24}
                                height={24}
                              />
                              Mobile Money
                            </Label>
                          </div>
                        </RadioGroup>
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            You will be redirected to Flutterwave to complete your payment.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-[300px] space-y-4 overflow-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₦{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right font-medium">₦{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
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
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{(cart.total + 1500 + cart.total * 0.075).toLocaleString()}</span>
                </div>

                <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">Payment Security</p>
                  <p className="text-muted-foreground">
                    All transactions are secure and encrypted. Your payment information is never stored on our servers.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                      alt="Visa"
                      width={32}
                      height={32}
                    />
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/349/349228.png"
                      alt="Mastercard"
                      width={32}
                      height={32}
                    />
                    <Image
                      src="https://cdn-icons-png.flaticon.com/512/196/196565.png"
                      alt="Verve"
                      width={32}
                      height={32}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
