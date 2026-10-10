"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSeries } from "@/features/admin/admin.actions";
import { Save, Loader2, ArrowLeft, Tv, Settings, Sparkles, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";
import { TmdbAutofillBar } from "@/components/admin/TmdbAutofillBar";
import { AiStorylineEnhancer } from "@/components/admin/AiStorylineEnhancer";
import type { TmdbDetailedResult } from "@/lib/tmdb";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function SeriesForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Controlled states for instant 1-click TMDB autofill
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortTeaser, setShortTeaser] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [rating, setRating] = useState("");
  const [language, setLanguage] = useState("");
  const [ratingScore, setRatingScore] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [genres, setGenres] = useState("");
  const [cast, setCast] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const handleTmdbAutofill = (data: TmdbDetailedResult) => {
    if (data.title) setTitle(data.title);
    if (data.slug) setSlug(data.slug);
    if (data.shortTeaser) setShortTeaser(data.shortTeaser);
    if (data.description) setDescription(data.description);
    if (data.releaseDate) setReleaseDate(data.releaseDate);
    if (data.rating) setRating(data.rating);
    if (data.language) setLanguage(data.language);
    if (data.ratingScore !== null && data.ratingScore !== undefined) setRatingScore(String(data.ratingScore));
    if (data.trailerUrl) setTrailerUrl(data.trailerUrl);
    if (data.genres) setGenres(data.genres);
    if (data.cast) setCast(data.cast);
    if (data.posterUrl) setPosterUrl(data.posterUrl);
    if (data.backdropUrl) setBackdropUrl(data.backdropUrl);

    toast.success(`Loaded details for "${data.title}" from TMDB!`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Hidden inputs are in form so posterUrl and backdropUrl are automatically in formData
    startTransition(async () => {
      try {
        const result = await createSeries(formData);
        if (result.success) {
          toast.success("Created successfully!");
          router.push(`/admin/series/${result.id}`);
        } else {
          toast.error(result.error || "Failed to create series.");
        }
      } catch (error) {
        console.error("Failed to create series", error);
        toast.error(error instanceof Error ? error.message : "Failed to create series. Please try again.");
      }
    });
  };

  const inputClasses = "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground";
  const labelClasses = "text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hidden inputs to pass TMDB URLs if no local files uploaded */}
      <input type="hidden" name="posterUrl" value={posterUrl} />
      <input type="hidden" name="backdropUrl" value={backdropUrl} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/series">
            <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0 w-10 h-10 hover:bg-white/5">
              <ArrowLeft className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
            </Button>
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Add New Series
          </h2>
        </div>
        <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto w-full sm:w-auto">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending} className="flex-1 sm:flex-none hover:bg-white/5 rounded-full px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2 flex-1 sm:flex-none rounded-full shadow-lg shadow-primary/20 font-semibold px-6">
            {isPending ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <Save className="w-4 h-4 shrink-0" />} <span className="truncate">Save & Add Episodes</span>
          </Button>
        </div>
      </div>

      {/* TMDB Quick Autofill Bar */}
      <TmdbAutofillBar type="series" onAutofill={handleTmdbAutofill} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
            
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tv className="w-4 h-4 text-primary" />
              </div>
              Core Metadata
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Breaking Bad"
                />
              </div>
              
              <div>
                <label className={labelClasses}>Slug</label>
                <input
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. breaking-bad"
                />
              </div>

              {/* AI Narrative & Teaser Hook Generator */}
              <AiStorylineEnhancer
                title={title}
                type="series"
                genres={genres}
                cast={cast}
                releaseYear={releaseDate ? new Date(releaseDate).getFullYear() : null}
                currentTeaser={shortTeaser}
                currentDescription={description}
                onApply={({ teaser, description: newDescription }) => {
                  setShortTeaser(teaser);
                  setDescription(newDescription);
                }}
              />

              <div className="space-y-2">
                <label htmlFor="shortTeaser" className={labelClasses}>Short Teaser (Cards & Banners)</label>
                <textarea 
                  id="shortTeaser" 
                  name="shortTeaser" 
                  rows={2} 
                  value={shortTeaser}
                  onChange={(e) => setShortTeaser(e.target.value)}
                  className={inputClasses}
                  placeholder="A brief 1-2 sentence hook..."
                />
              </div>

              <div>
                <label className={labelClasses}>Full Synopsis (Detail Page)</label>
                <textarea
                  name="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClasses} resize-none`}
                  placeholder="A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine..."
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6 lg:space-y-8">
          <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              Publishing & Stats
            </h3>
            
            <div className="space-y-5 z-50">
              <div>
                <label className={labelClasses}>Status</label>
                <CustomSelect 
                  name="status"
                  defaultValue="draft"
                  options={[
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                    { label: "Archived", value: "archived" }
                  ]}
                />
              </div>

              <div>
                <label className={labelClasses}>Release Date</label>
                <input
                  name="releaseDate"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Rating</label>
                  <input
                    name="rating"
                    maxLength={32}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className={inputClasses}
                    placeholder="TV-MA"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Language</label>
                  <input 
                    name="language" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={inputClasses} 
                    placeholder="e.g. English, Spanish" 
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClasses}>Kineos Score (0 - 100)</label>
                  <input
                    name="ratingScore"
                    type="number"
                    step="0.1"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(e.target.value)}
                    className={inputClasses}
                    placeholder="e.g. 84 for 8.4/10"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>YouTube Trailer URL</label>
                <input
                  name="trailerUrl"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className={inputClasses}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                />
                <span className="text-[11px] text-muted block mt-1">
                  Users can play this trailer directly on your site. Leave blank to auto-fetch from TMDB.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              Artwork & Credits
            </h3>
            <div className="space-y-4">
              {/* Poster Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Poster Image</label>
                {posterUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/20 p-2.5 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" /> TMDB Poster Attached
                        </div>
                        <p className="text-[11px] text-muted truncate mt-0.5">{posterUrl}</p>
                        <p className="text-[10px] text-muted/70 mt-0.5">Will be saved automatically.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPosterUrl("")}
                        className="text-muted hover:text-red-400 h-8 w-8 shrink-0 hover:bg-white/5"
                        title="Remove TMDB poster"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
                <input 
                  type="file" 
                  name="posterFile" 
                  accept="image/*" 
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                />
                <span className="text-[11px] text-muted block ml-1">
                  {posterUrl ? "Upload a file to override TMDB poster, or leave blank to keep TMDB poster." : "Upload a file or use TMDB autofill."}
                </span>
              </div>

              {/* Backdrop Section */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Backdrop Image</label>
                {backdropUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/20 p-2.5 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" /> TMDB Backdrop Attached
                        </div>
                        <p className="text-[11px] text-muted truncate mt-0.5">{backdropUrl}</p>
                        <p className="text-[10px] text-muted/70 mt-0.5">Will be saved automatically.</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setBackdropUrl("")}
                        className="text-muted hover:text-red-400 h-8 w-8 shrink-0 hover:bg-white/5"
                        title="Remove TMDB backdrop"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
                <input 
                  type="file" 
                  name="backdropFile" 
                  accept="image/*" 
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                />
                <span className="text-[11px] text-muted block ml-1">
                  {backdropUrl ? "Upload a file to override TMDB backdrop, or leave blank to keep TMDB backdrop." : "Upload a file or use TMDB autofill."}
                </span>
              </div>

              {/* Genres & Cast */}
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Genres (comma separated)</label>
                <input 
                  name="genres" 
                  value={genres}
                  onChange={(e) => setGenres(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" 
                  placeholder="Action, Sci-Fi, Thriller" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Top Cast (comma separated)</label>
                <input 
                  name="cast" 
                  value={cast}
                  onChange={(e) => setCast(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" 
                  placeholder="Actor Name 1, Actor Name 2" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
