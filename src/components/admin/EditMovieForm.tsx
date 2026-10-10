"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateMovie } from "@/features/admin/admin.actions";
import { Save, Loader2, ArrowLeft, UploadCloud, Film, Settings } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";
import { AiStorylineEnhancer } from "@/components/admin/AiStorylineEnhancer";

export function EditMovieForm({ movie }: { movie: any }) {
  const [isPending, startTransition] = useTransition();
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const [title, setTitle] = useState(movie.title || "");
  const [shortTeaser, setShortTeaser] = useState(movie.shortTeaser || "");
  const [description, setDescription] = useState(movie.description || "");
  useEffect(() => {
    setPortalNode(document.getElementById("update-button-portal"));
  }, []);
  const router = useRouter();
  

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateMovie(movie.id, formData);
      if (result.success) {
        /* No redirect on update */
      } else {
        toast.error(result.error || "Failed to update movie.");
      }
    });
  };

  const inputClasses = "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground";
  const labelClasses = "text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <>
      {portalNode && createPortal(
        <Button type="submit" form="edit-movie-form" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto font-semibold transition-all">
          {isPending ? "Updating..." : "Update Movie"}
        </Button>,
        portalNode
      )}
    <form id="edit-movie-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
                  name="slug" defaultValue={movie.slug || ""}
                  required
                  className={inputClasses}
                  placeholder="e.g. inception"
                />
              </div>

              {/* AI Narrative & Teaser Hook Generator */}
              <AiStorylineEnhancer
                title={title}
                type="movie"
                genres={movie.genres?.join(", ")}
                cast={movie.cast?.join(", ")}
                releaseYear={movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null}
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
                  defaultValue={movie.publicationStatus || "draft"}
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
                  name="releaseDate" type="date" defaultValue={movie.releaseDate ? new Date(movie.releaseDate).toISOString().split("T")[0] : ""} style={{ colorScheme: 'dark' }}
                  className={inputClasses}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Runtime</label>
                  <div className="relative">
                    <input
                      name="runtime" defaultValue={movie.runtime || ""}
                      type="number"
                      className={`${inputClasses} pr-12`}
                      placeholder="148"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">min</span>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Rating</label>
                  <input name="rating" maxLength={32} defaultValue={movie.rating || ""} className={inputClasses} placeholder="PG-13" />
                </div>
                <div>
                  <label className={labelClasses}>Language</label>
                  <input name="language" defaultValue={movie.language || ""} className={inputClasses} placeholder="e.g. English, Spanish" />
                </div>
                <div>
                  <label className={labelClasses}>Kineos Score (0 - 100)</label>
                  <input
                    name="ratingScore"
                    type="number"
                    step="0.1"
                    defaultValue={movie.ratingScore || ""}
                    className={inputClasses}
                    placeholder="e.g. 84 for 8.4/10"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>YouTube Trailer URL</label>
                <input
                  name="trailerUrl"
                  defaultValue={movie.trailerUrl || ""}
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
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
              Artwork (File Upload)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Poster Image</label>
                <input type="file" name="posterFile" accept="image/*" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Backdrop Image</label>
                <input type="file" name="backdropFile" accept="image/*" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Genres (comma separated)</label>
                <input name="genres" defaultValue={movie.genres?.join(", ") || ""} className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Action, Sci-Fi, Thriller" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Top Cast (comma separated)</label>
                <input name="cast" defaultValue={movie.cast?.join(", ") || ""} className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Actor Name 1, Actor Name 2" />
              </div>
            </div></div>
        </div>
      </div>
      
    </form>
    </>
  );
}







