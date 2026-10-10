"use client";

import { useState } from "react";
import { MessageSquarePlus, Film, Tv, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
}

export function RequestModal({ isOpen, onClose, defaultTitle = "" }: RequestModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [contentType, setContentType] = useState<"movie" | "series">("movie");
  const [releaseYear, setReleaseYear] = useState("");
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter the title of the movie or series.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          contentType,
          releaseYear: releaseYear ? parseInt(releaseYear, 10) : undefined,
          notes: notes.trim() || undefined,
          requesterEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setTitle("");
        setReleaseYear("");
        setNotes("");
        setEmail("");
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface border border-white/10 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mb-4 animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Request Received!</h3>
            <p className="text-sm text-muted max-w-sm">
              Thank you! Our indexing team will review and prioritize uploading{" "}
              <span className="text-white font-semibold">"{title}"</span> as soon as possible.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <MessageSquarePlus className="w-4 h-4" /> Community Requests
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                Request a Title
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Can't find a movie or show you want to stream? Tell us and we will add it to the catalog.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                  Content Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setContentType("movie")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border",
                      contentType === "movie"
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-surface-elevated text-muted hover:text-white border-white/5"
                    )}
                  >
                    <Film className="w-4 h-4" /> Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType("series")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all border",
                      contentType === "series"
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-surface-elevated text-muted hover:text-white border-white/5"
                    )}
                  >
                    <Tv className="w-4 h-4" /> TV Series
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  Title Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inception, Breaking Bad..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder:text-muted/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Release Year */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  Release Year (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  min="1900"
                  max="2035"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder:text-muted/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Notes / Details */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  Extra Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4K UHD version, Season 3, or director name..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder:text-muted/50 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              {/* Email Notification */}
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                  Email (Optional - to notify you when added)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder:text-muted/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full rounded-full font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
