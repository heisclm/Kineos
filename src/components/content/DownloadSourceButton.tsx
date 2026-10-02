"use client";

import { Download, Link as LinkIcon, Magnet } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DownloadSource {
  id: string;
  sourceType: "CLOUDFLARE_R2" | "DIRECT_URL" | "TORRENT_MAGNET";
  label?: string;
  quality?: string;
  format?: string;
  fileSize?: number; // in bytes
  url: string;
}

export function DownloadSourceButton({ source }: { source: DownloadSource }) {
  const isR2 = source.sourceType === "CLOUDFLARE_R2";
  const isDirect = source.sourceType === "DIRECT_URL";
  const isMagnet = source.sourceType === "TORRENT_MAGNET";

  // Base semantic styles based on the rule: 
  // R2 = Cloudflare accent, Direct = Kineos accent, Magnet = Magnet semantic accent
  const baseClasses = "w-full justify-between h-14 rounded-xl font-semibold transition-apple group px-5";
  
  let colorClasses = "";
  let Icon = Download;
  let labelText = "Download";

  if (isR2) {
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-r2 border border-white/5 hover:border-download-r2/30 shadow-sm";
  } else if (isDirect) {
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-direct border border-white/5 hover:border-download-direct/30 shadow-sm";
  } else if (isMagnet) {
    Icon = Magnet;
    labelText = "Magnet";
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-magnet border border-white/5 hover:border-download-magnet/30 shadow-sm";
  }

  const handleDownload = () => {
    // In a real app, R2 links might require a signed URL generation here.
    // For MVP, we use the URL directly (which is stored in the DB).
    if (isMagnet) {
      window.location.href = source.url;
    } else {
      window.open(source.url, "_blank");
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDownload} 
      className={`${baseClasses} ${colorClasses}`}
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-sm font-bold text-foreground">
          {source.quality || "HD"} {source.format && <span className="text-muted font-medium ml-1 text-xs">{source.format}</span>}
        </span>
        <span className="text-[11px] font-medium opacity-70">
          {source.label || source.sourceType.replace('_', ' ')} 
          {source.fileSize ? ` • ${(source.fileSize / (1024 * 1024)).toFixed(1)} MB` : ""}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm tracking-wide hidden sm:inline-block opacity-90">{labelText}</span>
        <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
      </div>
    </Button>
  );
}
