"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateMovie } from "@/features/admin/admin.actions";
import { Save, Loader2, ArrowLeft, Film, Settings, Sparkles, X, Image as ImageIcon, Check } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";
import { AiStorylineEnhancer } from "@/components/admin/AiStorylineEnhancer";
import { TmdbAutofillBar } from "@/components/admin/TmdbAutofillBar";
import type { TmdbDetailedResult } from "@/lib/tmdb";

export function EditMovieForm({ movie }: { movie: any }) {
  const [isPending, startTransition] = useTransition();
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  // Controlled form state
  const [title, setTitle] = useState(movie.title || "");
  const [slug, setSlug] = useState(movie.slug || "");
  const [shortTeaser, setShortTeaser] = useState(movie.shortTeaser || "");
  const [description, setDescription] = useState(movie.description || "");
  const [status, setStatus] = useState<string>(movie.publicationStatus || "draft");
  const [releaseDate, setReleaseDate] = useState(
    movie.releaseDate ? new Date(movie.releaseDate).toISOString().split("T")[0] : ""
  );
  const [runtime, setRuntime] = useState(movie.runtime ? String(movie.runtime) : "");
  const [rating, setRating] = useState(movie.rating || "");
  const [language, setLanguage] = useState(movie.language || "");
  const [ratingScore, setRatingScore] = useState(
    movie.ratingScore !== null && movie.ratingScore !== undefined
      ? movie.ratingScore > 10
        ? String(movie.ratingScore / 10)
        : String(movie.ratingScore)
      : ""
  );
  const [trailerUrl, setTrailerUrl] = useState(movie.trailerUrl || "");
  const [genres, setGenres] = useState(movie.genres?.join(", ") || "");
  const [cast, setCast] = useState(movie.cast?.join(", ") || "");
  const [posterUrl, setPosterUrl] = useState(movie.imageUrl || "");
  const [backdropUrl, setBackdropUrl] = useState(movie.backdropUrl || "");

  // TMDB Apply Modal State
  const [pendingTmdbData, setPendingTmdbData] = useState<TmdbDetailedResult | null>(null);
  const [applyOptions, setApplyOptions] = useState({
    stats: true,
    artwork: true,
    credits: true,
    core: false,
  });

  useEffect(() => {
    setPortalNode(document.getElementById("update-button-portal"));
  }, []);

  const handleTmdbSelect = (data: TmdbDetailedResult) => {
    // Open apply modal so admin can pick whether to update Stats, Artwork, or Full
    setPendingTmdbData(data);
    setApplyOptions({
      stats: true,
      artwork: true,
      credits: true,
      core: !description.trim(), // auto-check core if current synopsis is empty
    });
  };

  const applyTmdbData = (data: TmdbDetailedResult, opts: typeof applyOptions) => {
    let appliedCount = 0;

    // 1. Publishing & Stats
    if (opts.stats) {
      if (data.releaseDate) setReleaseDate(data.releaseDate);
      if (data.runtime !== null && data.runtime !== undefined) setRuntime(String(data.runtime));
      if (data.rating) setRating(data.rating);
      if (data.language) setLanguage(data.language);
      if (data.ratingScore !== null && data.ratingScore !== undefined) {
        setRatingScore(String(data.ratingScore));
      }
      if (data.trailerUrl) setTrailerUrl(data.trailerUrl);
      appliedCount++;
    }

    // 2. Artwork (Backdrop & Poster)
    if (opts.artwork) {
      if (data.backdropUrl) setBackdropUrl(data.backdropUrl);
      if (data.posterUrl && !posterUrl) setPosterUrl(data.posterUrl);
      appliedCount++;
    }

    // 3. Genres & Cast
    if (opts.credits) {
      if (data.genres) setGenres(data.genres);
      if (data.cast) setCast(data.cast);
      appliedCount++;
    }

    // 4. Core Details
    if (opts.core) {
      if (data.title) setTitle(data.title);
      if (data.slug) setSlug(data.slug);
      if (data.shortTeaser) setShortTeaser(data.shortTeaser);
      if (data.description) setDescription(data.description);
      appliedCount++;
    }

    setPendingTmdbData(null);
    toast.success(
      `✨ Applied TMDB data for "${data.title}"! Review the changes below and click "Update Movie" to save.`
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateMovie(movie.id, formData);
      if (result.success) {
        toast.success("Movie updated successfully!");
      } else {
        toast.error(result.error || "Failed to update movie.");
      }
    });
  };

  const inputClasses =
    "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground";
  const labelClasses = "text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <>
      {portalNode &&
        createPortal(
          <Button
            type="submit"
            form="edit-movie-form"
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto font-semibold transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPending ? "Updating..." : "Update Movie"}
          </Button>,
          portalNode
        )}

      {/* TMDB Quick Autofill Bar */}
      <div className="space-y-2">
        <TmdbAutofillBar type="movie" onAutofill={handleTmdbSelect} initialQuery={title} />
      </div>

      <form
        id="edit-movie-form"
        onSubmit={handleSubmit}
        className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Hidden inputs for TMDB or existing artwork URLs */}
        <input type="hidden" name="posterUrl" value={posterUrl} />
        <input type="hidden" name="backdropUrl" value={backdropUrl} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />

              <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Film className="w-4 h-4 text-primary" />
                </div>
                Core Metadata
              </h3>

              <div className="space-y-5">
                <div>
                  <label className={labelClasses}>Title</label>
                  <input
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="e.g. Inception"
                  />
                </div>

                <div>
                  <label className={labelClasses}>Slug</label>
                  <input
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className={inputClasses}
                    placeholder="e.g. inception"
                  />
                </div>

                {/* AI Narrative & Teaser Hook Generator */}
                <AiStorylineEnhancer
                  title={title}
                  type="movie"
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
                  <label htmlFor="shortTeaser" className={labelClasses}>
                    Short Teaser (Cards & Banners)
                  </label>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className={`${inputClasses} resize-none`}
                    placeholder="A thief who steals corporate secrets through the use of dream-sharing technology..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-primary" />
                  </div>
                  Publishing & Stats
                </h3>
              </div>

              <div className="space-y-5 z-50">
                <div>
                  <label className={labelClasses}>Status</label>
                  <CustomSelect
                    name="status"
                    value={status}
                    onChange={setStatus}
                    defaultValue={movie.publicationStatus || "draft"}
                    options={[
                      { label: "Draft", value: "draft" },
                      { label: "Published", value: "published" },
                      { label: "Archived", value: "archived" },
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
                    style={{ colorScheme: "dark" }}
                    className={inputClasses}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Runtime</label>
                    <div className="relative">
                      <input
                        name="runtime"
                        value={runtime}
                        onChange={(e) => setRuntime(e.target.value)}
                        type="number"
                        className={`${inputClasses} pr-12`}
                        placeholder="148"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
                        min
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClasses}>Rating</label>
                    <input
                      name="rating"
                      maxLength={32}
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className={inputClasses}
                      placeholder="PG-13"
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
                  <div>
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
                    Users can play this trailer directly on your site.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Artwork & Credits Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-primary" />
                </div>
                Artwork & Credits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Poster Section */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Poster Image
                  </label>

                  {posterUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            {posterUrl.includes("tmdb.org") ? "TMDB Poster Attached" : "Attached Poster"}
                          </div>
                          <p className="text-[11px] text-muted truncate mt-0.5">{posterUrl}</p>
                          <p className="text-[10px] text-muted/70 mt-0.5">Click Update to save changes.</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPosterUrl("")}
                          className="text-muted hover:text-red-400 h-8 w-8 shrink-0 hover:bg-white/5"
                          title="Remove poster"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-muted">
                      No poster attached. Use TMDB Autofill above or upload below.
                    </div>
                  )}

                  <input
                    type="file"
                    name="posterFile"
                    accept="image/*"
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <span className="text-[11px] text-muted block ml-1">
                    Upload a file to override, or leave blank to keep attached poster.
                  </span>
                </div>

                {/* Backdrop Section */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Backdrop Image
                  </label>

                  {backdropUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/20 p-2.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            {backdropUrl.includes("tmdb.org") ? "TMDB Backdrop Attached" : "Attached Backdrop"}
                          </div>
                          <p className="text-[11px] text-muted truncate mt-0.5">{backdropUrl}</p>
                          <p className="text-[10px] text-muted/70 mt-0.5">Click Update to save changes.</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setBackdropUrl("")}
                          className="text-muted hover:text-red-400 h-8 w-8 shrink-0 hover:bg-white/5"
                          title="Remove backdrop"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-muted">
                      No backdrop attached yet. Use TMDB Autofill above to attach high-res artwork.
                    </div>
                  )}

                  <input
                    type="file"
                    name="backdropFile"
                    accept="image/*"
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <span className="text-[11px] text-muted block ml-1">
                    Upload a file to override, or leave blank to keep attached backdrop.
                  </span>
                </div>

                {/* Genres & Cast */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Genres (comma separated)
                  </label>
                  <input
                    name="genres"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground"
                    placeholder="Action, Sci-Fi, Thriller"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Top Cast (comma separated)
                  </label>
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

      {/* Apply TMDB Data Modal */}
      {pendingTmdbData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141419] border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {pendingTmdbData.posterUrl ? (
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingTmdbData.posterUrl}
                      alt={pendingTmdbData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    Apply TMDB Data
                    {pendingTmdbData.releaseDate && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {pendingTmdbData.releaseDate.slice(0, 4)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {pendingTmdbData.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingTmdbData(null)}
                className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Select which information you want to update from TMDB:
            </p>

            <div className="space-y-2.5">
              {/* Option 1: Publishing & Stats */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyOptions.stats}
                  onChange={(e) =>
                    setApplyOptions((prev) => ({ ...prev, stats: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <div className="text-xs space-y-0.5 flex-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Publishing & Stats
                  </span>
                  <span className="text-muted block text-[11px]">
                    Release Date ({pendingTmdbData.releaseDate || "N/A"}), Rating (
                    {pendingTmdbData.rating || "N/A"}), Runtime (
                    {pendingTmdbData.runtime ? `${pendingTmdbData.runtime}m` : "N/A"}), Score (
                    {pendingTmdbData.ratingScore ? `${(pendingTmdbData.ratingScore / 10).toFixed(1)}/10` : "N/A"}),
                    Trailer ({pendingTmdbData.trailerUrl ? "YouTube link found" : "None"})
                  </span>
                </div>
              </label>

              {/* Option 2: Artwork */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyOptions.artwork}
                  onChange={(e) =>
                    setApplyOptions((prev) => ({ ...prev, artwork: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <div className="text-xs space-y-0.5 flex-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Artwork (Backdrop & Poster)
                  </span>
                  <span className="text-muted block text-[11px]">
                    {pendingTmdbData.backdropUrl ? "High-res backdrop image" : "No backdrop found"}{" "}
                    &amp;{" "}
                    {pendingTmdbData.posterUrl ? "TMDB poster image" : "no poster found"}
                  </span>
                </div>
              </label>

              {/* Option 3: Genres & Cast */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyOptions.credits}
                  onChange={(e) =>
                    setApplyOptions((prev) => ({ ...prev, credits: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <div className="text-xs space-y-0.5 flex-1">
                  <span className="font-semibold text-foreground block">Genres &amp; Top Cast</span>
                  <span className="text-muted block text-[11px] truncate">
                    {pendingTmdbData.genres || "Genres"} • {pendingTmdbData.cast || "Cast"}
                  </span>
                </div>
              </label>

              {/* Option 4: Core Metadata */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-primary/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={applyOptions.core}
                  onChange={(e) =>
                    setApplyOptions((prev) => ({ ...prev, core: e.target.checked }))
                  }
                  className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4"
                />
                <div className="text-xs space-y-0.5 flex-1">
                  <span className="font-semibold text-foreground block">
                    Core Details (Title, Slug &amp; Full Synopsis)
                  </span>
                  <span className="text-muted block text-[11px]">
                    Updates title, slug, and synopsis. Uncheck if you already have custom text.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPendingTmdbData(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    applyTmdbData(pendingTmdbData, {
                      stats: true,
                      artwork: true,
                      credits: false,
                      core: false,
                    })
                  }
                  className="text-xs border-primary/30 text-primary hover:bg-primary/10 gap-1 w-full sm:w-auto font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Stats &amp; Backdrop Only
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => applyTmdbData(pendingTmdbData, applyOptions)}
                  className="bg-primary text-primary-foreground font-semibold text-xs gap-1 w-full sm:w-auto shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
