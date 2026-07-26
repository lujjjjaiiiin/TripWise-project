import { Link, useLocation } from "wouter";
import { useLanguage, useT } from "@/lib/i18n";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/planner", label: t("planner") },
    { href: "/explore", label: t("explore") },
    { href: "/about", label: t("about" as any) },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[68px] bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm transition-colors">
      <div className="container mx-auto px-6 md:px-10 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-primary">
            TripWise<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:rounded-full after:transition-transform after:duration-200 pb-1 ${
                location === link.href
                  ? "text-primary after:bg-primary after:scale-x-100"
                  : "text-muted-foreground hover:text-primary after:bg-primary after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center rounded-full border border-border bg-white shadow-sm overflow-hidden text-sm font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`px-4 py-1.5 transition-colors ${lang === "en" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"}`}
            >
              EN
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={() => setLang("ar")}
              className={`px-4 py-1.5 transition-colors ${lang === "ar" ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"}`}
              dir="rtl"
            >
              عربي
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[68px] left-0 right-0 bg-white border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium transition-colors ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="h-px bg-border w-full" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setLang("en"); setMobileMenuOpen(false); }}
              className={`text-sm font-medium ${lang === "en" ? "text-primary" : "text-muted-foreground"}`}
            >
              English
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => { setLang("ar"); setMobileMenuOpen(false); }}
              className={`text-sm font-medium ${lang === "ar" ? "text-primary" : "text-muted-foreground"}`}
            >
              العربية
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
