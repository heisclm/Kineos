"use client";

import { useState, useEffect } from "react";
import { Film, LayoutDashboard, Film as FilmIcon, Tv, Menu, Home, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KineosLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Movies", href: "/admin/movies", icon: FilmIcon },
  { name: "TV Shows", href: "/admin/series", icon: Tv },
];

export function AdminNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ---------------- MOBILE HEADER ---------------- */}
      <header className="lg:hidden h-[72px] px-6 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <KineosLogo className="h-5" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm uppercase">Admin</span>
        </Link>
        <button 
          type="button"
          className="p-2 -mr-2 text-muted hover:text-foreground transition-apple relative z-[60]"
          onClick={(e) => {
            e.preventDefault();
            setMobileMenuOpen((prev) => !prev);
          }}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ---------------- MOBILE MENU (Matches Main Site) ---------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[72px] h-[calc(100vh-72px)] z-40 bg-background/95 backdrop-blur-2xl lg:hidden overflow-y-auto animate-in fade-in duration-300">
          <div className="flex flex-col px-6 py-8 h-full">
            <nav className="flex flex-col">
              {adminNav.map((item, i) => {
                const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");
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
                    style={{ animationDelay: `${(i + 1) * 50}ms` }}
                  >
                    <Icon className={cn("w-7 h-7", isActive ? "text-primary" : "text-muted")} strokeWidth={2.5} />
                    {item.name}
                  </Link>
                );
              })}
              
              <Link
                href="/"
                className={cn(
                  "text-[28px] font-semibold tracking-tight py-4 transition-apple flex items-center gap-4 text-muted hover:text-foreground mt-4 animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both"
                )}
                style={{ animationDelay: `${(adminNav.length + 1) * 50}ms` }}
              >
                <Home className="w-7 h-7" strokeWidth={2.5} />
                Back to Website
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="hidden lg:flex w-[280px] bg-surface-elevated/30 backdrop-blur-xl flex-col py-8 px-5 border-r border-white/5 h-full z-10 shadow-2xl relative">
        <Link href="/admin" className="mb-10 px-2 flex items-center justify-start opacity-90 hover:opacity-100 transition-opacity">
          <KineosLogo className="h-6" />
          <span className="ml-3 text-[11px] font-bold tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-sm uppercase">Admin</span>
        </Link>
        
        <nav className="flex-1 space-y-2">
          {adminNav.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden group",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted hover:text-foreground hover:bg-white/5"
                )}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full" />
                )}
                
                <Icon className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted hover:text-foreground hover:bg-white/5 transition-apple">
            <Home className="w-4 h-4" strokeWidth={2.5} />
            Back to Website
          </Link>
        </div>
      </aside>
    </>
  );
}
