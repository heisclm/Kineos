"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Home, Film, Tv } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KineosLogo } from "@/components/ui/logo";
import { SearchBar } from "./SearchBar";

const mainNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "TV Series", href: "/series", icon: Tv },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q");
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q.toString())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="h-[72px] md:h-[88px] w-full flex items-center justify-between px-4 md:px-10 bg-background/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 transition-apple">
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/" className="flex items-center group shrink-0" onClick={() => setMobileMenuOpen(false)}>
            <KineosLogo className="h-5 md:h-7 text-foreground group-hover:text-primary transition-apple group-hover:scale-[1.02]" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-apple py-1",
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4 flex-1 justify-end">
          {/* Desktop Search Bar */}
          <div className="hidden md:block w-full max-w-[400px]">
            <SearchBar />
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            type="button"
            className="md:hidden p-2 -mr-2 text-muted hover:text-foreground transition-apple relative z-[60]"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen((prev) => !prev);
            }}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 pointer-events-none" /> : <Menu className="w-6 h-6 pointer-events-none" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown (Apple Style) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] h-[calc(100vh-72px)] z-40 bg-background/95 backdrop-blur-2xl md:hidden overflow-y-auto animate-in fade-in duration-300">
          <div className="flex flex-col px-6 py-8 h-full">
            
            {/* Mobile Search */}
            <div className="w-full mb-8 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both" style={{ animationDelay: '50ms' }}>
               <SearchBar isMobile onSelect={() => setMobileMenuOpen(false)} />
            </div>

            {/* Mobile Links */}
            <nav className="flex flex-col">
              {mainNavItems.map((item, i) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-[28px] font-semibold tracking-tight py-4 border-b border-white/5 transition-apple flex items-center gap-4",
                      isActive ? "text-primary" : "text-foreground hover:text-primary",
                      "animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both"
                    )}
                    style={{ animationDelay: `${(i + 2) * 50}ms` }}
                  >
                    <Icon className={cn("w-7 h-7", isActive ? "text-primary" : "text-muted")} strokeWidth={2.5} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
