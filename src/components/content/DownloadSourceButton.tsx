"use client";

import { Download, Link as LinkIcon, Magnet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";

export interface DownloadSource {
  id: string;
  sourceType: "CLOUDFLARE_R2" | "DIRECT_URL" | "TORRENT_MAGNET";
  label?: string;
  quality?: string;
  format?: string;
  fileSize?: number; // in bytes
  language?: string;
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
    // If a Monetag Direct Link is configured, open the sponsored offer tab
    const directLink = process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK;
    if (directLink) {
      try {
        window.open(directLink, "_blank", "noopener,noreferrer");
      } catch (err) {
        console.warn("Direct link trigger:", err);
      }
    }

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
          {source.label || source.quality || "HD"} {source.format && !source.label && <span className="text-muted font-medium ml-1 text-xs">{source.format}</span>}
        </span>
        <span className="text-[11px] font-medium opacity-70 flex items-center flex-wrap gap-1.5">
          {source.language && (
            <>
              <span className="uppercase">{source.language}</span>
              <span className="text-muted-foreground/40">&bull;</span>
            </>
          )}
          <span>{source.label ? (source.quality ? `${source.quality} ${source.format || ''}` : source.sourceType.replace('_', ' ')) : source.sourceType.replace('_', ' ')}</span>
          {source.fileSize ? (
            <>
              <span className="text-muted-foreground/40">â€¢</span>
              <span>{formatBytes(Number(source.fileSize) / (1024 * 1024))}</span>
            </>
          ) : null}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm tracking-wide hidden sm:inline-block opacity-90">{labelText}</span>
        <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
      </div>
    </Button>
  );
}

