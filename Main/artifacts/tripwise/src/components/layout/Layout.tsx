import * as React from "react"
import { Navbar } from "./Navbar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col relative w-full">
        {children}
      </main>
      <footer className="border-t py-12 bg-card text-muted-foreground">
        <div className="container mx-auto px-4 md:px-8 text-center text-sm flex flex-col items-center justify-center gap-4">
          <div className="font-serif font-bold text-lg text-primary">TripWise AI</div>
          <p className="max-w-md">The precision instrument for the world's most extraordinary destinations. Powered by K-Means clustering and cosine similarity.</p>
          <div className="mt-4">© {new Date().getFullYear()} TripWise AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
