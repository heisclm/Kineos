"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, Magnet, Copy, Check } from "lucide-react";
import { formatBytes, copyToClipboard, isIOSDevice } from "@/lib/utils";
import { TorrentGuideModal } from "./TorrentGuideModal";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);
  const isR2 = source.sourceType === "CLOUDFLARE_R2";
  const isDirect = source.sourceType === "DIRECT_URL";
  const isMagnet = source.sourceType === "TORRENT_MAGNET" || source.url?.startsWith("magnet:");

  // Base semantic styles based on the rule: 
  // R2 = Cloudflare accent, Direct = Kineos accent, Magnet = Magnet semantic accent
  const baseClasses = "w-full justify-between h-14 rounded-xl font-semibold transition-apple group px-4 sm:px-5 flex items-center select-none cursor-pointer text-left";
  
  let colorClasses = "";
  let Icon = Download;
  let labelText = "Download";

  if (isR2) {
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-r2 border border-white/5 hover:border-download-r2/30 shadow-sm";
  } else if (isDirect) {
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-direct border border-white/5 hover:border-download-direct/30 shadow-sm";
  } else if (isMagnet) {
    Icon = Magnet;
    labelText = "Fast Mirror";
    colorClasses = "bg-surface hover:bg-surface-elevated text-download-magnet border border-white/5 hover:border-download-magnet/30 shadow-sm";
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await copyToClipboard(source.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Torrent magnet copied!", {
        description: "Paste into Seedr.cc, PikPak, or your cloud torrent downloader to download on iOS.",
        action: {
          label: "Open Seedr",
          onClick: () => window.open("https://www.seedr.cc", "_blank"),
        },
        duration: 5000,
      });
    } else {
      toast.error("Failed to copy link. Please try selecting the URL manually.");
    }
  };

  const handleDownload = () => {
    // If a Monetag Direct Link is configured, open the sponsored offer tab with frequency capping
    const directLink = process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK;
    if (directLink) {
      try {
        const lastTriggered = localStorage.getItem("kineos_directlink_last");
        const now = Date.now();
        // 4-hour cooldown so users aren't bombarded with tabs on multiple downloads
        if (!lastTriggered || now - Number(lastTriggered) >= 4 * 60 * 60 * 1000) {
          localStorage.setItem("kineos_directlink_last", now.toString());
          window.open(directLink, "_blank", "noopener,noreferrer");
        }
      } catch (err) {
        console.warn("Direct link trigger:", err);
      }
    }

    if (isMagnet) {
      if (isIOSDevice()) {
        copyToClipboard(source.url);
        toast.info("Torrent link copied for iOS!", {
          description: "iOS doesn't open torrent links directly. Paste this into Seedr.cc or PikPak to download.",
          action: {
            label: "Open Seedr",
            onClick: () => window.open("https://www.seedr.cc", "_blank"),
          },
          duration: 6000,
        });
      }
      window.location.href = source.url;
    } else {
      window.open(source.url, "_blank");
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleDownload}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleDownload();
        }
      }}
      className={`${baseClasses} ${colorClasses}`}
    >
      <div className="flex flex-col items-start gap-0.5 min-w-0 pr-2">
        <span className="text-sm font-bold text-foreground truncate max-w-full">
          {source.label || source.quality || "HD"} {source.format && !source.label && <span className="text-muted font-medium ml-1 text-xs">{source.format}</span>}
        </span>
        <span className="text-[11px] font-medium opacity-70 flex items-center flex-wrap gap-1.5">
          {source.language && (
            <>
              <span className="uppercase">{source.language}</span>
              <span className="text-muted-foreground/40">&bull;</span>
            </>
          )}
          <span>
            {source.label
              ? source.quality
                ? `${source.quality} ${source.format || ""}`
                : source.sourceType === "TORRENT_MAGNET"
                ? "Fast Mirror"
                : source.sourceType.replace("_", " ")
              : source.sourceType === "TORRENT_MAGNET"
              ? "Fast Mirror"
              : source.sourceType.replace("_", " ")}
          </span>
          {source.fileSize ? (
            <>
              <span className="text-muted-foreground/40">&bull;</span>
              <span>{formatBytes(Number(source.fileSize) / (1024 * 1024))}</span>
            </>
          ) : null}
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {isMagnet && (
          <>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy torrent magnet URL (for iOS & Cloud Downloaders like Seedr, PikPak)"
              aria-label="Copy torrent magnet URL"
              className={`relative z-10 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
                copied
                  ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300"
                  : "bg-white/5 hover:bg-white/10 active:bg-white/20 border-white/10 text-muted-foreground hover:text-white"
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="text-[11px] font-medium hidden xs:inline sm:inline">
                {copied ? "Copied" : "Copy Link"}
              </span>
            </button>
            <TorrentGuideModal variant="icon" />
          </>
        )}
        <span className="text-sm tracking-wide hidden sm:inline-block opacity-90">{labelText}</span>
        <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform shrink-0" />
      </div>
    </div>
  );
}
