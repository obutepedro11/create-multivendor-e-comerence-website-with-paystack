"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

export type CartItem = {
  id: string
  productId: string
  vendorId: string
  name: string
  price: number
  quantity: number
  image: string
}

type CartContextType = {
  cart: {
    items: CartItem[]
    total: number
  }
  addToCart: (item: Omit<CartItem, "id">) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({
    items: [],
    total: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.items.findIndex((cartItem) => cartItem.productId === item.productId)

      let newItems

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newItems = [...prevCart.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity,
        }
      } else {
        // Add new item
        newItems = [...prevCart.items, { ...item, id: crypto.randomUUID() }]
      }

      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
      })

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.id !== itemId)

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.id === itemId ? { ...item, quantity } : item))

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }

  const clearCart = () => {
    setCart({ items: [], total: 0 })
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
