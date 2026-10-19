"use client";

import { useState } from "react";
import { Download, Magnet, Copy, Check } from "lucide-react";
import { formatBytes, copyToClipboard, isIOSDevice } from "@/lib/utils";
import { TorrentGuideModal } from "./TorrentGuideModal";
import { toast } from "sonner";

export interface EpisodeDownloadSource {
  id: string;
  sourceType?: "CLOUDFLARE_R2" | "DIRECT_URL" | "TORRENT_MAGNET" | string;
  quality?: string | null;
  format?: string | null;
  fileSize?: number | null;
  language?: string | null;
  label?: string | null;
  url: string;
}

export function EpisodeDownloadButton({ source }: { source: EpisodeDownloadSource }) {
  const [copied, setCopied] = useState(false);
  const isMagnet = source.sourceType === "TORRENT_MAGNET" || source.url?.startsWith("magnet:");
  const isR2 = source.sourceType === "CLOUDFLARE_R2";
  const isDirect = source.sourceType === "DIRECT_URL" || (!isMagnet && !isR2);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const success = await copyToClipboard(source.url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast.success("Episode torrent magnet copied!", {
        description: "Paste into Seedr.cc or your cloud torrent downloader to download on iOS.",
        action: {
          label: "Open Seedr",
          onClick: () => window.open("https://www.seedr.cc", "_blank"),
        },
        duration: 5000,
      });
    } else {
      toast.error("Failed to copy link.");
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If a Monetag Direct Link is configured, open the sponsored offer with frequency capping
    const directLink = process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK;
    if (directLink) {
      try {
        const lastTriggered = localStorage.getItem("kineos_directlink_last");
        const now = Date.now();
        // 4-hour cooldown so users aren't bombarded with tabs on multiple episode downloads
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
        toast.info("Episode torrent link copied!", {
          description: "Paste into Seedr.cc or PikPak to download on iOS.",
          action: {
            label: "Open Seedr",
            onClick: () => window.open("https://www.seedr.cc", "_blank"),
          },
          duration: 6000,
        });
      }
      // Prevent opening an orphaned empty tab; directly invoke torrent protocol
      e.preventDefault();
      window.location.href = source.url || `/api/downloads/${source.id}`;
    }
  };

  const Icon = isMagnet ? Magnet : Download;

  let colorClasses = "bg-primary/10 hover:bg-primary/20 border-primary/30 text-primary";
  if (isMagnet) {
    colorClasses = "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400";
  } else if (isR2) {
    colorClasses = "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-400";
  } else if (isDirect) {
    colorClasses = "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-400";
  }

  // Calculate formatted size
  const formattedSize = source.fileSize
    ? formatBytes(Math.round(Number(source.fileSize) / (1024 * 1024)))
    : null;

  const displayLabel = isMagnet ? "Fast Mirror" : (source.quality || "HD");

  const buttonElement = (
    <a
      href={source.url || `/api/downloads/${source.id}`}
      target={isMagnet ? undefined : "_blank"}
      rel={isMagnet ? undefined : "noopener noreferrer"}
      onClick={handleClick}
      title={isMagnet ? "Download episode via Fast Mirror" : "Download episode"}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-apple hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${colorClasses}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{displayLabel}</span>
      {isMagnet && source.quality && (
        <span className="font-normal opacity-90">{source.quality}</span>
      )}
      {source.format && (
        <span className="opacity-60 text-[10px] uppercase font-normal">
          ({source.format})
        </span>
      )}
      {formattedSize && (
        <span className="opacity-60 text-[10px] font-normal">
          &bull; {formattedSize}
        </span>
      )}
    </a>
  );

  if (isMagnet) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {buttonElement}
        <button
          type="button"
          onClick={handleCopy}
          title="Copy episode torrent link (for iOS & Cloud Downloaders)"
          aria-label="Copy episode torrent link"
          className={`h-7 px-2 rounded-full border text-[11px] font-medium inline-flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${
            copied
              ? "bg-emerald-500/25 border-emerald-500/50 text-emerald-300"
              : "bg-white/5 hover:bg-white/10 active:bg-white/20 border-white/10 text-muted-foreground hover:text-white"
          }`}
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
          <span className="text-[10px] hidden xs:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
        <TorrentGuideModal variant="icon" />
      </div>
    );
  }

  return buttonElement;
}
