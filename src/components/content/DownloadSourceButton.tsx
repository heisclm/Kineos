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
      // By default for magnet, open the in-browser direct downloader
      setBrowserModalOpen(true);
    } else {
      window.open(source.url, "_blank");
    }
  };

  const handleOpenTorrentApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerMonetagAd();
    window.location.href = source.url;
  };

  return (
    <>
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
                  : isMagnet
                  ? "Direct Browser & Torrent"
                  : source.sourceType.replace("_", " ")
                : isMagnet
                ? "Direct Browser & Torrent"
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
        <div className="flex items-center gap-2 shrink-0">
          {isMagnet ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerMonetagAd();
                  setBrowserModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="Convert magnet to direct download inside browser"
              >
                <Zap className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Direct Download</span>
                <span className="sm:hidden">Direct</span>
              </button>

              <button
                type="button"
                onClick={handleOpenTorrentApp}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-emerald-400 transition-colors"
                title="Open in uTorrent / BitTorrent app"
              >
                <Magnet className="w-4 h-4 shrink-0" />
              </button>

              <TorrentGuideModal variant="icon" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-wide hidden sm:inline-block opacity-90">{labelText}</span>
              <Icon className="w-5 h-5 opacity-90 group-hover:scale-110 transition-transform" />
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
