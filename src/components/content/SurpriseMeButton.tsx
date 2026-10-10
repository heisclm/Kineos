"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dices, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurpriseMeButtonProps {
  variant?: "navbar" | "hero" | "compact";
  className?: string;
  onClickExtra?: () => void;
}

export function SurpriseMeButton({
  variant = "navbar",
  className,
  onClickExtra,
}: SurpriseMeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSurprise = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      if (onClickExtra) onClickExtra();

      const res = await fetch("/api/content/random");
      const data = await res.json();

      if (data.success && data.url) {
        router.push(data.url);
      } else {
        // Fallback
        router.push("/top-10");
      }
    } catch (err) {
      console.error("Failed to load random title:", err);
      router.push("/top-10");
    } finally {
      // Keep loading briefly during navigation
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleSurprise}
        disabled={loading}
        title="Surprise Me (Play Something)"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center border border-white/10 hover:border-primary/40 bg-surface/80 hover:bg-surface text-muted hover:text-primary transition-all duration-300 shadow-sm disabled:opacity-50",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Dices className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <button
        onClick={handleSurprise}
        disabled={loading}
        className={cn(
          "px-5 py-2.5 rounded-full bg-surface-elevated/80 hover:bg-surface-elevated border border-white/10 hover:border-primary/50 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/20",
          className
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Dices className="w-4 h-4 text-primary animate-pulse" />
        )}
        <span>Surprise Me</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSurprise}
      disabled={loading}
      title="Surprise Me - Can't decide? Let us pick a title for you!"
      className={cn(
        "group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/40 text-white/80 hover:text-white transition-all duration-300 shadow-sm",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
      ) : (
        <Dices className="w-3.5 h-3.5 text-primary group-hover:rotate-180 transition-transform duration-500 ease-out" />
      )}
      <span className="hidden sm:inline">Surprise Me</span>
    </button>
  );
}
