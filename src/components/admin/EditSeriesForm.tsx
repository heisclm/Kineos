"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateSeries } from "@/features/admin/admin.actions";
import { Save, Loader2, ArrowLeft, UploadCloud, Tv, Settings } from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";

export function EditSeriesForm({ series }: { series: any }) {
  const [isPending, startTransition] = useTransition();
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalNode(document.getElementById("update-button-portal"));
  }, []);
  const router = useRouter();
  

  const handleSubmit = (e: any) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateSeries(series.id, formData);
      if (result.success) {
        /* No redirect on update */
      } else {
        toast.error(result.error || "Failed to update series.");
      }
    });
  };

  const inputClasses = "w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground";
  const labelClasses = "text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block";

  return (
    <>
      {portalNode && createPortal(
        <Button type="submit" form="edit-series-form" disabled={isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto font-semibold transition-all">
          {isPending ? "Updating..." : "Update Series"}
        </Button>,
        portalNode
      )}
    <form id="edit-series-form" onSubmit={handleSubmit} className="space-y-6 md:space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
                  name="title" defaultValue={series.title || ""}
                  required
                  className={inputClasses}
                  placeholder="e.g. Breaking Bad"
                />
              </div>
              
              <div>
                <label className={labelClasses}>Slug</label>
                <input
                  name="slug" defaultValue={series.slug || ""}
                  required
                  className={inputClasses}
                  placeholder="e.g. breaking-bad"
                />
              </div>

              
              <div className="space-y-2">
                <label htmlFor="shortTeaser" className={labelClasses}>Short Teaser (Cards & Banners)</label>
                <textarea 
                  id="shortTeaser" 
                  name="shortTeaser" 
                  rows={2} 
                  defaultValue={series?.shortTeaser || ""}
                  className={inputClasses}
                  placeholder="A brief 1-2 sentence hook..."
                />
              </div>

              <div>
                <label className={labelClasses}>Full Synopsis (Detail Page)</label>
                <textarea
                  name="description" defaultValue={series.description || ""}
                  rows={5}
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
                  defaultValue={series.publicationStatus || "draft"}
                  options={[
                    { label: "Draft", value: "draft" },
                    { label: "Published", value: "published" },
                    { label: "Archived", value: "archived" }
                  ]}
                />
              </div>

              <div><label className={labelClasses}>Release Date</label><input name="releaseDate" type="date" defaultValue={series.releaseDate ? new Date(series.releaseDate).toISOString().split("T")[0] : ""} style={{ colorScheme: "dark" }} className={inputClasses} /></div><div><label className={labelClasses}>Language</label><input name="language" defaultValue={(series as any).language || ""} className={inputClasses} placeholder="e.g. English, Spanish" /></div></div></div></div>
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
                <input name="genres" defaultValue={series.genres?.join(", ") || ""} className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Action, Sci-Fi, Thriller" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Top Cast (comma separated)</label>
                <input name="cast" defaultValue={series.cast?.join(", ") || ""} className="w-full bg-black/40 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted/50 text-foreground" placeholder="Actor Name 1, Actor Name 2" />
              </div>
            </div></div>
        </div>
      </div>
      
    </form>
    </>
  );
}





