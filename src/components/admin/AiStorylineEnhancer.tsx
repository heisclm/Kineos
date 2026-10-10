"use client";

import { useState, useEffect, useTransition } from "react";
import { Sparkles, Key, RotateCcw, Loader2, Check, Film, Flame, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateAiNarrativeAction } from "@/features/admin/admin.actions";
import type { NarrativeTone } from "@/lib/gemini";

interface AiStorylineEnhancerProps {
  title: string;
  type?: "movie" | "series";
  genres?: string;
  cast?: string;
  releaseYear?: string | number | null;
  currentTeaser: string;
  currentDescription: string;
  onApply: (generated: { teaser: string; description: string }) => void;
}

export function AiStorylineEnhancer({
  title,
  type = "movie",
  genres,
  cast,
  releaseYear,
  currentTeaser,
  currentDescription,
  onApply,
}: AiStorylineEnhancerProps) {
  const [selectedTone, setSelectedTone] = useState<NarrativeTone>("cinematic");
  const [isPending, startTransition] = useTransition();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [hasSavedKey, setHasSavedKey] = useState(false);
  
  // Previous history for 1-click Undo
  const [previousDraft, setPreviousDraft] = useState<{ teaser: string; description: string } | null>(null);

  // Load custom Gemini API key from localStorage if saved
  useEffect(() => {
    const saved = localStorage.getItem("kineos_gemini_api_key");
    if (saved) {
      setCustomKey(saved);
      setHasSavedKey(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = customKey.trim();
    if (!trimmed) {
      localStorage.removeItem("kineos_gemini_api_key");
      setHasSavedKey(false);
      toast.success("Removed custom Gemini API key (using server environment key).");
    } else {
      localStorage.setItem("kineos_gemini_api_key", trimmed);
      setHasSavedKey(true);
      toast.success("Saved custom Gemini API key to browser!");
    }
    setApiKeyModalOpen(false);
  };

  const handleGenerate = () => {
    const cleanTitle = title?.trim();
    if (!cleanTitle) {
      toast.error("Please enter a Title or autofill from TMDB first!");
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateAiNarrativeAction({
          title: cleanTitle,
          type,
          genres,
          cast,
          releaseYear,
          currentTeaser,
          currentDescription,
          tone: selectedTone,
          customApiKey: customKey || undefined,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to generate narrative.");
        }

        // Cache previous version for Undo
        setPreviousDraft({
          teaser: currentTeaser,
          description: currentDescription,
        });

        onApply({
          teaser: result.data.teaser,
          description: result.data.storyline,
        });

        const toneNames: Record<NarrativeTone, string> = {
          cinematic: "Cinematic",
          hook: "Hook-Heavy",
          casual: "Casual",
        };
        toast.success(`Generated ${toneNames[selectedTone]} Teaser & Storyline!`);
      } catch (err) {
        console.error("Narrative generation error:", err);
        const msg = err instanceof Error ? err.message : "Failed to generate narrative.";
        toast.error(msg);
        if (msg.toLowerCase().includes("api key")) {
          setApiKeyModalOpen(true);
        }
      }
    });
  };

  const handleUndo = () => {
    if (previousDraft) {
      onApply(previousDraft);
      setPreviousDraft(null);
      toast.info("Reverted to previous teaser & storyline.");
    }
  };

  const tones: Array<{ id: NarrativeTone; label: string; icon: typeof Film; desc: string }> = [
    { id: "cinematic", label: "Cinematic", icon: Film, desc: "Atmospheric & High Stakes" },
    { id: "hook", label: "Hook-Heavy", icon: Flame, desc: "Suspenseful & Urgent" },
    { id: "casual", label: "Casual", icon: MessageSquare, desc: "Witty & Relatable" },
  ];

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] via-surface-elevated/40 to-transparent p-4 sm:p-5 mb-5 shadow-xl backdrop-blur-md overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-foreground">
                AI Narrative & Hook Generator
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block">
              Generates an irresistible short teaser & humanized storyline tailored to your title.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {previousDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={isPending}
              className="h-7 text-xs px-2.5 gap-1.5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground rounded-full"
              title="Undo recent AI rewrite"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setApiKeyModalOpen(true)}
            className={`h-7 px-2 text-xs rounded-full gap-1 ${
              hasSavedKey ? "text-emerald-400 hover:text-emerald-300" : "text-muted hover:text-foreground"
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden md:inline">
              {hasSavedKey ? "Custom Key" : "API Key"}
            </span>
          </Button>
        </div>
      </div>

      {/* Tone Selection & Trigger Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider mr-1">
            Tone:
          </span>
          {tones.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTone(t.id)}
                className={`group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 border border-primary/50"
                    : "bg-black/30 hover:bg-white/5 text-muted-foreground hover:text-foreground border border-white/5"
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? "text-primary-foreground" : "text-primary/70"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          size="sm"
          className="gap-2 rounded-full font-semibold shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-8 self-end sm:self-auto w-full sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Polishing Narrative...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Storyline & Teaser</span>
            </>
          )}
        </Button>
      </div>

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-elevated border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setApiKeyModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Google Gemini API Key</h4>
                <p className="text-xs text-muted">Free AI generation for teasers & storylines</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              By default, Kineos uses the server&apos;s <code className="text-primary font-mono">GEMINI_API_KEY</code>. You can also paste your personal free key here, which will be safely saved in this browser.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Your Gemini API Key
              </label>
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black/50 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-3.5 py-2.5 text-sm text-foreground font-mono placeholder:text-muted/40"
              />
              <span className="text-[11px] text-muted block">
                Get a 100% free API key in 10 seconds at{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-primary/80 font-medium"
                >
                  Google AI Studio ↗
                </a>
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setApiKeyModalOpen(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveApiKey}
                className="rounded-full text-xs gap-1.5 px-4 font-semibold"
              >
                <Check className="w-3.5 h-3.5" /> Save Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
