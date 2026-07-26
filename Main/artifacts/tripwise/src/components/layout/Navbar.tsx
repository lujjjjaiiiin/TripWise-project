import * as React from "react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { Compass, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [location] = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const routes = [
    { href: "/", label: "Home" },
    { href: "/planner", label: "Planner" },
    { href: "/explore", label: "Explore" },
  ]

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <Compass className="h-6 w-6" />
          <span className="font-serif font-bold text-xl tracking-tight">TripWise AI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {routes.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === r.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/planner">
              <Button>Start Planning</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className={cn(
                  "text-lg font-medium transition-colors",
                  location === r.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {r.label}
              </Link>
            ))}
            <div className="pt-4 border-t">
              <Link href="/planner">
                <Button className="w-full">Start Planning</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
