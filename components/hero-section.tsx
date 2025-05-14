import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-2 md:gap-12 lg:grid-cols-[1fr_500px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Shop from Multiple Vendors in One Place
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover unique products from various vendors, all in one marketplace. Shop with confidence and
                convenience.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
              <Link href="/vendors">
                <Button size="lg" variant="outline">
                  Explore Vendors
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-full overflow-hidden rounded-lg md:h-[450px]">
              <Image
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop"
                alt="Marketplace Hero"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
