"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Home, Film, Tv, Bookmark, MessageSquarePlus, Users } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { KineosLogo } from "@/components/ui/logo";
import { SearchBar } from "./SearchBar";
import { SurpriseMeButton } from "@/components/content/SurpriseMeButton";
import { RequestModal } from "@/components/content/RequestModal";
import { useWatchlist } from "@/lib/watchlist";

const mainNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Movies", href: "/movies", icon: Film },
  { name: "TV Series", href: "/series", icon: Tv },
  { name: "Cast", href: "/cast", icon: Users },
  { name: "My List", href: "/watchlist", icon: Bookmark },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const { count: watchlistCount, isLoaded: watchlistLoaded } = useWatchlist();

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
          <Link href="/" className="flex items-center group shrink-0 outline-none focus:outline-none focus:ring-0 select-none !tap-highlight-transparent" style={{ WebkitTapHighlightColor: 'transparent' }} onClick={() => setMobileMenuOpen(false)}>
            <KineosLogo className="h-5 md:h-7 text-foreground transition-apple" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative text-sm font-medium transition-apple py-1 flex items-center gap-1.5",
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  <span>{item.name}</span>
                  {item.href === "/watchlist" && watchlistLoaded && watchlistCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold">
                      {watchlistCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end">
          {/* Desktop Search Bar */}
          <div className="hidden md:block w-full max-w-[320px] lg:max-w-[380px]">
            <SearchBar />
          </div>

          {/* Desktop "Surprise Me" Button */}
          <div className="hidden sm:block">
            <SurpriseMeButton variant="navbar" />
          </div>

          {/* Desktop "Request" Button */}
          <button
            onClick={() => setRequestModalOpen(true)}
            title="Request a Movie or Series"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 text-white/80 hover:text-white transition-all duration-300 shadow-sm cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
            <span>Request</span>
          </button>

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
        <div className="fixed inset-0 top-[72px] h-[calc(100dvh-72px)] z-40 bg-background/95 backdrop-blur-2xl md:hidden overflow-y-auto animate-in fade-in duration-300">
          <div className="flex flex-col px-6 py-6 min-h-full">
            
            {/* Mobile Search */}
            <div className="w-full mb-4 relative z-50 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both" style={{ animationDelay: '50ms' }}>
               <SearchBar isMobile onSelect={() => setMobileMenuOpen(false)} />
            </div>

            {/* Mobile Surprise Me & Request Action Row */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <SurpriseMeButton
                variant="hero"
                className="w-full justify-center py-2 text-xs"
                onClickExtra={() => setMobileMenuOpen(false)}
              />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setRequestModalOpen(true);
                }}
                className="w-full py-2 px-3 rounded-full bg-surface-elevated/80 border border-white/10 hover:border-primary/40 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-primary" />
                <span>Request Title</span>
              </button>
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
                      "text-[22px] font-semibold tracking-tight py-3.5 border-b border-white/5 transition-apple flex items-center justify-between",
                      isActive ? "text-primary" : "text-foreground hover:text-primary",
                      "animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both"
                    )}
                    style={{ animationDelay: `${(i + 2) * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted")} strokeWidth={2.5} />
                      {item.name}
                    </div>
                    {item.href === "/watchlist" && watchlistLoaded && watchlistCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                        {watchlistCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Secondary Links - Immediately visible on all screen heights without scrolling */}
            <div className="mt-6 pt-5 border-t border-white/10 animate-in fade-in duration-500 fill-mode-both" style={{ animationDelay: '250ms' }}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                Company & Legal
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/about"
                  className="px-3.5 py-2.5 rounded-xl bg-surface/60 border border-white/5 hover:border-primary/30 text-xs font-semibold text-foreground hover:text-primary transition-apple flex items-center gap-2 shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="px-3.5 py-2.5 rounded-xl bg-surface/60 border border-white/5 hover:border-primary/30 text-xs font-semibold text-foreground hover:text-primary transition-apple flex items-center gap-2 shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Contact Us
                </Link>
                <Link
                  href="/privacy"
                  className="px-3.5 py-2.5 rounded-xl bg-surface/60 border border-white/5 hover:border-primary/30 text-xs font-semibold text-foreground hover:text-primary transition-apple flex items-center gap-2 shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="px-3.5 py-2.5 rounded-xl bg-surface/60 border border-white/5 hover:border-primary/30 text-xs font-semibold text-foreground hover:text-primary transition-apple flex items-center gap-2 shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Request Modal */}
      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </>
  );
}

