"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Power, Download, Link as LinkIcon, Magnet } from "lucide-react";
import { AddSourceModal } from "./AddSourceModal";
import { toggleDownloadSource, deleteDownloadSource } from "@/features/admin/sources.actions";

export function SourceManager({ contentId, contentType, sources }: { contentId: string, contentType: "movie" | "series" | "episode", sources: any[] }) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleDownloadSource(id, !currentStatus, contentId, contentType);
    if (res?.success) {
      toast.success(currentStatus ? "Source disabled" : "Source enabled");
      router.refresh();
    } else {
      toast.error(res?.error || "Failed to update source status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this source?")) {
      const res = await deleteDownloadSource(id, contentId, contentType);
      if (res?.success) {
        toast.success("Source deleted successfully");
        router.refresh();
      } else {
        toast.error(res?.error || "Failed to delete source");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">DOWNLOAD SOURCES</h3>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 rounded-full font-semibold bg-white/5 hover:bg-white/10 text-foreground border border-white/10 shadow-sm transition-apple backdrop-blur-md">
          <Plus className="w-4 h-4" /> Add Download Source
        </Button>
      </div>

      <div className="space-y-3">
        {sources.length === 0 ? (
          <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground font-medium mb-1">No sources added yet</p>
            <p className="text-sm text-muted">Add a Cloudflare R2, Direct URL, or Magnet source.</p>
          </div>
        ) : (
          sources.map((source) => (
            <div key={source.id} className="flex items-center justify-between p-4 bg-surface-elevated border border-white/5 rounded-xl hover:bg-surface-hover transition-apple group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center border border-white/5">
                  {source.sourceType === 'CLOUDFLARE_R2' && <Download className="w-5 h-5 text-download-r2" />}
                  {source.sourceType === 'DIRECT_URL' && <LinkIcon className="w-5 h-5 text-download-direct" />}
                  {source.sourceType === 'TORRENT_MAGNET' && <Magnet className="w-5 h-5 text-download-magnet" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{source.label || source.sourceType.replace('_', ' ')}</span>
                    {!source.isActive && <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold uppercase">Disabled</span>}
                  </div>
                  <div className="text-sm text-muted font-medium flex items-center gap-2">
                    {source.quality && <span>{source.quality}</span>}
                    {source.quality && <span>•</span>}
                    {source.format && <span>{source.format}</span>}
                    {source.fileSize && <span>•</span>}
                    {source.fileSize && <span>{(source.fileSize / (1024 * 1024)).toFixed(1)} MB</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-apple">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full h-8 px-3 gap-1.5 text-muted hover:text-foreground hover:bg-white/5"
                  onClick={() => handleToggle(source.id, source.isActive)}
                >
                  <Power className="w-3.5 h-3.5" />
                  {source.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full w-8 h-8 text-muted hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(source.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <AddSourceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        contentId={contentId} 
        contentType={contentType} 
      />
    </div>
  );
}
