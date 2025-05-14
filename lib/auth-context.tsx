"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "vendor" | "customer"
  avatar?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For now, we'll check against users in localStorage
      const usersJson = localStorage.getItem("users")
      const users = usersJson ? JSON.parse(usersJson) : []

      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (!foundUser) {
        throw new Error("Invalid email or password")
      }

      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = foundUser

      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

      toast({
        title: "Login successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      })

      // Redirect based on role
      if (userWithoutPassword.role === "admin") {
        router.push("/admin/dashboard")
      } else if (userWithoutPassword.role === "vendor") {
        router.push("/vendor/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For now, we'll store in localStorage
      const usersJson = localStorage.getItem("users")
      const users = usersJson ? JSON.parse(usersJson) : []

      // Check if email already exists
      if (users.some((u: any) => u.email === userData.email)) {
        throw new Error("Email already in use")
      }

      const newUser = {
        id: crypto.randomUUID(),
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "customer",
        password: userData.password,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = newUser

      setUser(userWithoutPassword)
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))

      toast({
        title: "Registration successful",
        description: `Welcome, ${userWithoutPassword.name}!`,
      })

      // Redirect based on role
      if (userWithoutPassword.role === "vendor") {
        router.push("/vendor/onboarding")
      } else {
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
