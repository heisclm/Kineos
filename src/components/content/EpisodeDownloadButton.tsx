"use client";

import { useState } from "react";
import { Download, Magnet, Zap } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { TorrentGuideModal } from "./TorrentGuideModal";
import { DirectBrowserDownloadModal } from "./DirectBrowserDownloadModal";

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

export function EpisodeDownloadButton({
  source,
  episodeTitle,
}: {
  source: EpisodeDownloadSource;
  episodeTitle?: string;
}) {
  const [browserModalOpen, setBrowserModalOpen] = useState(false);
  const isMagnet = source.sourceType === "TORRENT_MAGNET" || source.url?.startsWith("magnet:");
  const isR2 = source.sourceType === "CLOUDFLARE_R2";
  const isDirect = source.sourceType === "DIRECT_URL" || (!isMagnet && !isR2);

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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    triggerMonetagAd();

    if (isMagnet) {
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
      title={isMagnet ? "Open episode in uTorrent / BitTorrent app" : "Download episode"}
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
      <>
        <div className="inline-flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              triggerMonetagAd();
              setBrowserModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Convert to direct download in browser"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
            <span>Direct</span>
          </button>
          {buttonElement}
          <TorrentGuideModal variant="icon" />
        </div>

        <DirectBrowserDownloadModal
          isOpen={browserModalOpen}
          onClose={() => setBrowserModalOpen(false)}
          magnetUrl={source.url}
          title={episodeTitle || "Episode"}
          quality={source.quality || "HD"}
          fileSize={source.fileSize || undefined}
        />
      </>
    );
  }

  return buttonElement;
}
