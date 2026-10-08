"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, Link as LinkIcon, Magnet } from "lucide-react";
import { addDownloadSource, generateR2UploadUrl } from "@/features/admin/sources.actions";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: "movie" | "series" | "episode";
  seriesId?: string;
}

export function AddSourceModal({ isOpen, onClose, contentId, contentType, seriesId }: AddSourceModalProps) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"CLOUDFLARE_R2" | "DIRECT_URL" | "TORRENT_MAGNET">("DIRECT_URL");
  const [isPending, startTransition] = useTransition();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<"IDLE" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED">("IDLE");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const simulateR2Upload = (file: File): Promise<{ storageKey: string, size: number }> => {
    return new Promise((resolve) => {
      setUploadState("UPLOADING");
      setUploadProgress(0);
      
      const totalSteps = 20;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const newProgress = Math.floor((currentStep / totalSteps) * 100);
        setUploadProgress(newProgress);
        
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          setUploadState("PROCESSING");
          setTimeout(() => {
            setUploadState("READY");
            resolve({
              storageKey: `media/${contentType}/${contentId}/${Date.now()}-${file.name}`,
              size: file.size
            });
          }, 800);
        }
      }, 150);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("contentId", contentId);
    formData.append("contentType", contentType);
    if (seriesId) formData.append("seriesId", seriesId);
    formData.append("sourceType", sourceType);

    const sizeMB = formData.get("fileSizeMB");
    if (sizeMB && !isNaN(parseFloat(sizeMB as string))) {
      formData.append("fileSize", Math.round(parseFloat(sizeMB as string) * 1024 * 1024).toString());
      formData.delete("fileSizeMB");
    }

    if (sourceType === "CLOUDFLARE_R2") {
      if (!fileToUpload) {
        toast.error("Please select a file to upload.");
        return;
      }
      
      try {
        const init = await generateR2UploadUrl(fileToUpload.name, fileToUpload.type);
        if (!init.success) throw new Error("Failed to initialize upload");

        const result = await simulateR2Upload(fileToUpload);
        formData.append("storageKey", result.storageKey);
        formData.append("fileSize", result.size.toString());
        formData.append("url", `https://cdn.kineos.mock/${result.storageKey}`);
      } catch (err) {
        setUploadState("FAILED");
        toast.error("Cloudflare R2 simulated upload failed");
        return;
      }
    } else {
      const rawUrl = (formData.get("url") as string) || "";
      const trimmedUrl = rawUrl.trim();

      if (!trimmedUrl) {
        toast.error("Please provide a valid URL.");
        return;
      }

      if (sourceType === "DIRECT_URL") {
        if (!/^https?:\/\//i.test(trimmedUrl)) {
          toast.error("Direct URL must start with http:// or https://");
          return;
        }
      } else if (sourceType === "TORRENT_MAGNET") {
        if (!trimmedUrl.toLowerCase().startsWith("magnet:?") && !/^https?:\/\//i.test(trimmedUrl)) {
          toast.error("Please enter a valid Magnet URI (magnet:?...) or .torrent URL.");
          return;
        }
      }

      formData.set("url", trimmedUrl);
    }

    startTransition(async () => {
      const res = await addDownloadSource(formData);
      if (res?.success) {
        toast.success("Download source added successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(res?.error || "Failed to save download source");
      }
      setUploadState("IDLE");
      setUploadProgress(0);
      setFileToUpload(null);
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Add Download Source</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-muted hover:text-foreground transition-apple rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Source Type Selector */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSourceType("DIRECT_URL")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-apple ${sourceType === "DIRECT_URL" ? "bg-download-direct/10 border-download-direct text-download-direct" : "bg-surface-elevated border-white/5 text-muted hover:text-foreground hover:bg-surface-hover"}`}
            >
              <LinkIcon className="w-6 h-6" />
              <span className="text-xs font-semibold">Direct URL</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType("TORRENT_MAGNET")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-apple ${sourceType === "TORRENT_MAGNET" ? "bg-download-magnet/10 border-download-magnet text-download-magnet" : "bg-surface-elevated border-white/5 text-muted hover:text-foreground hover:bg-surface-hover"}`}
            >
              <Magnet className="w-6 h-6" />
              <span className="text-xs font-semibold">Magnet</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType("CLOUDFLARE_R2")}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-apple ${sourceType === "CLOUDFLARE_R2" ? "bg-download-r2/10 border-download-r2 text-download-r2" : "bg-surface-elevated border-white/5 text-muted hover:text-foreground hover:bg-surface-hover"}`}
            >
              <UploadCloud className="w-6 h-6" />
              <span className="text-xs font-semibold">Cloudflare R2</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Label</label>
                <input name="label" placeholder="e.g. 1080p WebRip, Full Season Pack" required className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Quality</label>
                <input name="quality" placeholder="e.g. 1080p, 720p, 4K" className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Format</label>
                <input name="format" placeholder="e.g. MP4, MKV" className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Size (MB)</label>
                <input name="fileSizeMB" type="number" step="0.1" placeholder="e.g. 1400 (for 1.4GB)" className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Language</label>
                <input name="language" placeholder="e.g. English, Multi" className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
            </div>

            {sourceType === "DIRECT_URL" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Direct Download URL</label>
                <input name="url" type="url" placeholder="https://example.com/video.mp4" required className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple" />
              </div>
            )}

            {sourceType === "TORRENT_MAGNET" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Magnet URI or Torrent URL</label>
                <input
                  name="url"
                  type="text"
                  placeholder="magnet:?xt=urn:... or https://.../*.torrent"
                  required
                  className="w-full bg-surface-elevated border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-apple font-mono text-xs"
                />
                <p className="text-[11px] text-muted">Supports any magnet URI (BitTorrent v1/v2) or direct .torrent URL.</p>
              </div>
            )}

            {sourceType === "CLOUDFLARE_R2" && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-muted-foreground">Media File</label>
                <input type="file" onChange={handleFileChange} accept="video/*" className="w-full bg-surface-elevated border border-dashed border-white/10 rounded-lg px-4 py-6 text-sm focus:outline-none text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                
                {uploadState !== "IDLE" && (
                  <div className="mt-4 p-4 bg-background rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={uploadState === 'FAILED' ? 'text-destructive' : 'text-foreground'}>
                        {uploadState === 'UPLOADING' && 'Uploading...'}
                        {uploadState === 'PROCESSING' && 'Processing...'}
                        {uploadState === 'READY' && 'Ready'}
                        {uploadState === 'FAILED' && 'Upload Failed'}
                      </span>
                      <span className="text-muted">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-200 ${uploadState === 'FAILED' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${uploadProgress}%` }} />
                    </div>
                    {fileToUpload && (
                      <div className="text-[10px] text-muted-foreground flex justify-between">
                        <span>{(fileToUpload.size * (uploadProgress/100) / (1024*1024)).toFixed(1)} MB / {(fileToUpload.size / (1024*1024)).toFixed(1)} MB</span>
                        <span>{uploadProgress === 100 ? 'Complete' : 'Uploading direct to R2...'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={uploadState === 'UPLOADING'} className="rounded-full">Cancel</Button>
            <Button type="submit" disabled={isPending || uploadState === 'UPLOADING'} className="rounded-full bg-primary text-primary-foreground font-semibold px-6 shadow-md hover:scale-105 transition-apple">
              {isPending ? "Saving..." : "Save Source"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
