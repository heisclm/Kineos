"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createMovie } from "@/features/admin/admin.actions";
import { Save, Loader2, ArrowLeft, UploadCloud, Film, Settings } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";

export function MovieForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createMovie(formData);
      if (result.success) {
        toast.success("Created successfully!");
        router.push(`/admin/movies/${result.id}`);
      } else {
        toast.error(result.error || "Failed to create movie.");
      }
    });
  };

  const inputClasses = "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground";
  const labelClasses = "text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/movies">
            <Button type="button" variant="ghost" size="icon" className="rounded-full shrink-0 w-10 h-10 hover:bg-white/5">
              <ArrowLeft className="w-5 h-5 text-muted hover:text-foreground transition-colors" />
            </Button>
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Add New Movie
          </h2>
        </div>
        <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto w-full sm:w-auto">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending} className="flex-1 sm:flex-none hover:bg-white/5 rounded-full px-6">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2 flex-1 sm:flex-none rounded-full shadow-lg shadow-primary/20 font-semibold px-6">
            {isPending ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" /> : <Save className="w-4 h-4 shrink-0" />} <span className="truncate">Save & Add Links</span>
          </Button>
        </div>
      </div>

      

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
                  required
                  className={inputClasses}
                  placeholder="e.g. Inception"
                />
              </div>
              
              <div>
                <label className={labelClasses}>Slug</label>
                <input
                  name="slug"
                  required
                  className={inputClasses}
                  placeholder="e.g. inception"
                />
              </div>

              
              <div className="space-y-2">
                <label htmlFor="shortTeaser" className={labelClasses}>Short Teaser (Cards & Banners)</label>
                <textarea 
                  id="shortTeaser" 
                  name="shortTeaser" 
                  rows={2} 
                  defaultValue={""}
                  className={inputClasses}
                  placeholder="A brief 1-2 sentence hook..."
                />
              </div>

              <div>
                <label className={labelClasses}>Full Synopsis (Detail Page)</label>
                <textarea
                  name="description"
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
                  style={{ colorScheme: 'dark' }}
                  className={inputClasses}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Runtime</label>
                  <div className="relative">
                    <input
                      name="runtime"
                      type="number"
                      className={`${inputClasses} pr-12`}
                      placeholder="148"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">min</span>
                  </div>
                </div>
                <div>
                  <label className={labelClasses}>Rating</label>
                  <input
                    name="rating"
                    className={inputClasses}
                    placeholder="PG-13"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated/40 backdrop-blur-xl border border-white/10 space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 pb-2 border-b border-white/5">
              Artwork (File Upload)
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Poster Image</label>
                <input type="file" name="posterFile" accept="image/*" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Backdrop Image</label>
                <input type="file" name="backdropFile" accept="image/*" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              </div>
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Genres (comma separated)</label>
                <input name="genres" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Action, Sci-Fi, Thriller" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Top Cast (comma separated)</label>
                <input name="cast" className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Actor Name 1, Actor Name 2" />
              </div>
            </div></div>
        </div>
      </div>
    </form>
  );
}






