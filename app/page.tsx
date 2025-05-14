import { Button } from "@/components/ui/button"
import { FeaturedProducts } from "@/components/featured-products"
import { HeroSection } from "@/components/hero-section"
import { VendorShowcase } from "@/components/vendor-showcase"
import { CategoryShowcase } from "@/components/category-showcase"
import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <CategoryShowcase />
      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link href="/products">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <FeaturedProducts />
      </section>
      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Top Vendors</h2>
          <Link href="/vendors">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <VendorShowcase />
      </section>
    </div>
  )
}
