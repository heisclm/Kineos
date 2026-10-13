"use client";

import { useState } from "react";
import { Download, Link as LinkIcon, Magnet, Zap } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { TorrentGuideModal } from "./TorrentGuideModal";
import { DirectBrowserDownloadModal } from "./DirectBrowserDownloadModal";

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

export function DownloadSourceButton({
  source,
  contentTitle,
}: {
  source: DownloadSource;
  contentTitle?: string;
}) {
  const [browserModalOpen, setBrowserModalOpen] = useState(false);
  const isR2 = source.sourceType === "CLOUDFLARE_R2";
  const isDirect = source.sourceType === "DIRECT_URL";
  const isMagnet = source.sourceType === "TORRENT_MAGNET" || source.url?.startsWith("magnet:");

  const baseClasses =
    "w-full justify-between min-h-14 py-2.5 rounded-xl font-semibold transition-apple group px-4 sm:px-5 flex items-center select-none cursor-pointer text-left";

  let colorClasses = "";
  let Icon = Download;
  let labelText = "Download";

  if (isR2) {
    colorClasses =
      "bg-surface hover:bg-surface-elevated text-download-r2 border border-white/5 hover:border-download-r2/30 shadow-sm";
  } else if (isDirect) {
    colorClasses =
      "bg-surface hover:bg-surface-elevated text-download-direct border border-white/5 hover:border-download-direct/30 shadow-sm";
  } else if (isMagnet) {
    Icon = Magnet;
    labelText = "Fast Mirror";
    colorClasses =
      "bg-surface hover:bg-surface-elevated text-download-magnet border border-white/5 hover:border-download-magnet/30 shadow-sm";
  }

  const triggerMonetagAd = () => {
    const directLink = process.env.NEXT_PUBLIC_MONETAG_DIRECT_LINK;
    if (directLink) {
      try {
        const lastTriggered = localStorage.getItem("kineos_directlink_last");
        const now = Date.now();
        if (!lastTriggered || now - Number(lastTriggered) >= 4 * 60 * 60 * 1000) {
          localStorage.setItem("kineos_directlink_last", now.toString());
          window.open(directLink, "_blank", "noopener,noreferrer");
        }
      } catch (err) {
        console.warn("Direct link trigger:", err);
      }
    }
  };

  const handleDownload = () => {
    triggerMonetagAd();

    if (isMagnet) {
      window.location.href = source.url;
    } else {
      window.open(source.url, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 1. Standard / Fast Mirror Download Button (Restored to Normal) */}
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
          <span className="text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-none">
            {source.label || source.quality || "HD"}{" "}
            {source.format && !source.label && (
              <span className="text-muted font-medium ml-1 text-xs">{source.format}</span>
            )}
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

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isMagnet && <TorrentGuideModal variant="icon" />}
          <span className="text-sm tracking-wide hidden sm:inline-block opacity-90">{labelText}</span>
          <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* 2. Separate Responsive Direct Download Button (For Users Without Torrent App) */}
      {isMagnet && (
        <button
          type="button"
          onClick={() => {
            triggerMonetagAd();
            setBrowserModalOpen(true);
          }}
          className="w-full flex items-center justify-between min-h-12 py-2.5 px-4 sm:px-5 rounded-xl font-semibold bg-emerald-500/10 hover:bg-emerald-500/15 active:bg-emerald-500/25 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 transition-apple group cursor-pointer text-left shadow-sm select-none"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-foreground group-hover:text-emerald-300 truncate">
                  Direct Download & Stream
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  No App Needed
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                Instant stream or direct browser download • 100% Free
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 shrink-0 flex items-center gap-1 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Direct</span>
          </span>
        </button>
      )}

      {/* In-Browser WebTorrent Direct Downloader Modal */}
      {isMagnet && (
        <DirectBrowserDownloadModal
          isOpen={browserModalOpen}
          onClose={() => setBrowserModalOpen(false)}
          magnetUrl={source.url}
          title={contentTitle || source.label || "Movie"}
          quality={source.quality || "HD"}
          fileSize={source.fileSize}
        />
      )}
    </div>
  );
}
