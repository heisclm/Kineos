"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Dices, Sparkles, Loader2, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurpriseMeButtonProps {
  variant?: "navbar" | "hero" | "compact";
  className?: string;
  onClickExtra?: () => void;
}

const CINEMATIC_PHRASES = [
  "Searching the cinematic archives...",
  "Spinning the golden reels...",
  "Discovering a top-rated blockbuster...",
  "Preparing your cinema experience...",
];

export function SurpriseMeButton({
  variant = "navbar",
  className,
  onClickExtra,
}: SurpriseMeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate status phrase and progress bar during loading
  useEffect(() => {
    if (!loading) {
      setPhraseIndex(0);
      setProgress(15);
      return;
    }

    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % CINEMATIC_PHRASES.length);
    }, 380);

    const t1 = setTimeout(() => setProgress(45), 250);
    const t2 = setTimeout(() => setProgress(78), 700);
    const t3 = setTimeout(() => setProgress(96), 1150);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading]);

  const handleSurprise = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const startTime = Date.now();
      const res = await fetch("/api/content/random");
      const data = await res.json();

      // Ensure minimum 1400ms display so users experience the cinematic reveal
      const elapsed = Date.now() - startTime;
      const minDuration = 1400;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }

      // Defer closing mobile menu/drawer until navigation is ready so the component doesn't unmount prematurely
      if (onClickExtra) onClickExtra();

      if (data.success && data.url) {
        router.push(data.url);
      } else {
        router.push("/top-10");
      }
    } catch (err) {
      console.error("Failed to load random title:", err);
      if (onClickExtra) onClickExtra();
      router.push("/top-10");
    } finally {
      // Keep loading overlay smoothly active during route transition
      setTimeout(() => setLoading(false), 900);
    }
  };

  // Premium Cinematic Loading Overlay (rendered via Portal)
  const loadingOverlay =
    loading && mounted
      ? createPortal(
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 w-full h-[100dvh] z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden touch-none animate-in fade-in duration-300"
          >
            {/* Ambient Background Glow */}
            <div className="absolute w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full bg-gradient-to-tr from-primary/30 via-amber-500/20 to-emerald-500/15 blur-3xl opacity-80 pointer-events-none animate-pulse" />

            {/* Orbiting Reels Centerpiece */}
            <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
              {/* Outer Slow Orbit */}
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-primary/40 animate-spin [animation-duration:10s]" />
              
              {/* Particle Nodes on Orbit */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_14px_rgba(255,215,0,0.95)] animate-pulse" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.95)]" />

              {/* Inner Counter-Rotating Orbit */}
              <div className="absolute inset-2 sm:inset-3 rounded-full border border-primary/40 animate-spin [animation-duration:5s] [animation-direction:reverse]" />

              {/* Central Glowing Icon Card */}
              <div className="absolute w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-surface-elevated via-black to-surface-elevated border border-primary/50 flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.35)] text-primary">
                <Dices className="w-7 h-7 sm:w-10 sm:h-10 text-primary animate-bounce [animation-duration:1.2s]" />
              </div>

              {/* Sparkle Accent */}
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-spin [animation-duration:4s]" />
            </div>

            {/* Cinematic Typography & State */}
            <div className="space-y-3 max-w-sm relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold tracking-widest uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kineos Discovery</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Selecting Your Surprise
              </h2>

              <p className="text-xs sm:text-sm text-white/80 h-5 transition-all duration-300 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                <span>{CINEMATIC_PHRASES[phraseIndex]}</span>
              </p>

              {/* Animated Luxury Progress Bar */}
              <div className="w-56 sm:w-72 h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner mx-auto mt-4">
                <div
                  className="h-full bg-gradient-to-r from-primary via-amber-400 to-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(255,215,0,0.7)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-[11px] text-muted-foreground/60 tracking-wider pt-2">
                Curating from thousands of movies & series
              </p>
            </div>
          </div>,
          document.body
        )
      : null;

  if (variant === "compact") {
    return (
      <>
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
        {loadingOverlay}
      </>
    );
  }

  if (variant === "hero") {
    return (
      <>
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
        {loadingOverlay}
      </>
    );
  }

  return (
    <>
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
      {loadingOverlay}
    </>
  );
}
