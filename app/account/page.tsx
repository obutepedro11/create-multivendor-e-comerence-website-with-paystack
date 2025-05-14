"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to orders page
    router.push("/account/orders")
  }, [router])

  return null
}
