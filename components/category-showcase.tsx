"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCategories } from "@/lib/data-utils"

type Category = {
  id: string
  name: string
  slug: string
}

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // In a real app, this would be an API call
    const allCategories = getCategories()
    setCategories(allCategories)
  }, [])

  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="flex h-24 items-center justify-center rounded-lg bg-muted p-4 text-center font-medium hover:bg-muted/80"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
