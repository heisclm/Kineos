"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Film,
  Home,
  Bookmark,
  Download,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const mainNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Watchlist", href: "/watchlist", icon: Bookmark },
  { name: "History", href: "/history", icon: Download },
];

const bottomNavItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "Log out", href: "/logout", icon: LogOut },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
    <aside className="w-[260px] h-screen bg-surface fixed left-0 top-0 flex flex-col py-8 px-6 overflow-y-auto border-r border-border/50 hidden md:flex z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-3 px-2 mb-10">
        <Film className="w-7 h-7 text-primary" strokeWidth={2} />
        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase tracking-widest">Kineos</h1>
      </div>

      <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2 mb-4">Menu</div>
      <nav className="flex-1 space-y-1">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-2.5 rounded-md transition-apple font-medium text-sm relative group",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <Icon 
                className={cn("w-5 h-5 transition-apple", isActive ? "text-primary" : "text-muted group-hover:text-foreground")} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2 mb-4">General</div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 px-3 py-2.5 rounded-md transition-apple font-medium text-sm text-muted hover:text-foreground hover:bg-surface-hover group"
            >
              <Icon className="w-5 h-5 text-muted group-hover:text-foreground transition-apple" strokeWidth={2} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>

    {/* Mobile Bottom Navigation */}
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-[72px] bg-background/90 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-2 pb-safe">
      {mainNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-full transition-apple relative",
              isActive ? "text-primary" : "text-muted hover:text-foreground"
            )}
          >
            {isActive && (
              <span className="absolute top-0 w-8 h-[2px] rounded-b-full bg-primary" />
            )}
            <Icon 
              className={cn("w-5 h-5 transition-apple", isActive && "translate-y-[-2px]")} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span className={cn("text-[10px] font-medium transition-apple", isActive && "translate-y-[-2px]")}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
