"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Zap,
  Download,
  Play,
  Pause,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  FileVideo,
  Radio,
  Clock,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatRawBytes, formatEta } from "@/lib/utils";
import { TorrentGuideModal } from "./TorrentGuideModal";

const WEBTORRENT_TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.webtorrent.dev",
  "wss://tracker.fastcast.nz",
  "wss://tracker.files.fm:7073/announce",
];

function enrichMagnetUri(magnet: string): string {
  if (!magnet.startsWith("magnet:")) return magnet;
  let enriched = magnet;
  for (const tr of WEBTORRENT_TRACKERS) {
    const encoded = encodeURIComponent(tr);
    if (!enriched.includes(encoded) && !enriched.includes(tr)) {
      enriched += `&tr=${encoded}`;
    }
  }
  return enriched;
}

interface TorrentFileInfo {
  name: string;
  length: number;
  progress: number;
  isVideo: boolean;
}

interface DirectBrowserDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  magnetUrl: string;
  title?: string;
  quality?: string;
  fileSize?: number;
}

export function DirectBrowserDownloadModal({
  isOpen,
  onClose,
  magnetUrl,
  title = "Direct Download",
  quality,
  fileSize,
}: DirectBrowserDownloadModalProps) {
  const [status, setStatus] = useState<
    "idle" | "loading_script" | "connecting" | "metadata" | "downloading" | "completed" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [numPeers, setNumPeers] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(fileSize || 0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [files, setFiles] = useState<TorrentFileInfo[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreparingBlob, setIsPreparingBlob] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [swarmSlowWarning, setSwarmSlowWarning] = useState(false);

  const clientRef = useRef<any>(null);
  const torrentRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeFileRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const swarmCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop & destroy torrent client
  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (swarmCheckTimerRef.current) clearTimeout(swarmCheckTimerRef.current);

    if (torrentRef.current) {
      try {
        torrentRef.current.destroy({ destroyStore: true });
      } catch (e) {
        console.warn("Torrent cleanup error:", e);
      }
      torrentRef.current = null;
    }

    if (clientRef.current) {
      try {
        clientRef.current.destroy();
      } catch (e) {
        console.warn("Client cleanup error:", e);
      }
      clientRef.current = null;
    }

    activeFileRef.current = null;
  }, []);

  // Close modal and cleanup
  const handleClose = () => {
    cleanup();
    setStatus("idle");
    setProgress(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setNumPeers(0);
    setShowVideoPreview(false);
    setSwarmSlowWarning(false);
    onClose();
  };

  // Start WebTorrent download in browser
  const startTorrent = useCallback(async () => {
    if (!magnetUrl) return;
    cleanup();

    setStatus("loading_script");
    setErrorMessage("");
    setSwarmSlowWarning(false);

    try {
      // 1. Ensure WebTorrent script is loaded
      const WebTorrent = await (async () => {
        if ((window as any).WebTorrent) return (window as any).WebTorrent;
        return new Promise<any>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "/vendor/webtorrent.min.js";
          script.async = true;
          script.onload = () => {
            if ((window as any).WebTorrent) {
              resolve((window as any).WebTorrent);
            } else {
              reject(new Error("WebTorrent failed to mount globally"));
            }
          };
          script.onerror = () => {
            // CDN Fallback
            const fallback = document.createElement("script");
            fallback.src = "https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js";
            fallback.async = true;
            fallback.onload = () => resolve((window as any).WebTorrent);
            fallback.onerror = () => reject(new Error("Could not load WebTorrent library"));
            document.head.appendChild(fallback);
          };
          document.head.appendChild(script);
        });
      })();

      // 2. Initialize WebTorrent client
      const client = new WebTorrent({
        tracker: {
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        },
      });
      clientRef.current = client;

      setStatus("connecting");

      // Set timeout for swarm notice if 0 peers after 15 seconds
      swarmCheckTimerRef.current = setTimeout(() => {
        setSwarmSlowWarning(true);
      }, 15000);

      // 3. Enrich magnet link with WebRTC WebSocket trackers
      const enrichedMagnet = enrichMagnetUri(magnetUrl);

      // 4. Add torrent to client
      client.add(
        enrichedMagnet,
        {
          announce: WEBTORRENT_TRACKERS,
        },
        (torrent: any) => {
          torrentRef.current = torrent;
          setStatus("metadata");

          // When torrent metadata arrives
          torrent.on("ready", () => {
            setStatus("downloading");
            setTotalBytes(torrent.length);

            // Map files and locate primary video
            const mappedFiles = (torrent.files || []).map((f: any) => ({
              name: f.name,
              length: f.length,
              progress: 0,
              isVideo: /\.(mp4|mkv|webm|avi|mov)$/i.test(f.name),
            }));
            setFiles(mappedFiles);

            // Find largest file (usually main feature film / episode)
            let primaryIndex = 0;
            let maxLength = 0;
            mappedFiles.forEach((f: any, idx: number) => {
              if (f.length > maxLength) {
                maxLength = f.length;
                primaryIndex = idx;
              }
            });
            setSelectedFileIndex(primaryIndex);

            const primaryFile = torrent.files[primaryIndex];
            activeFileRef.current = primaryFile;

            // Try to stream into video element if video format
            if (primaryFile && /\.(mp4|webm)$/i.test(primaryFile.name) && videoRef.current) {
              try {
                primaryFile.renderTo(videoRef.current, { autoplay: false });
                setShowVideoPreview(true);
              } catch (e) {
                console.warn("Video render error:", e);
              }
            }
          });

          // Metrics update interval
          timerRef.current = setInterval(() => {
            if (!torrent) return;

            setDownloadSpeed(torrent.downloadSpeed);
            setUploadSpeed(torrent.uploadSpeed);
            setNumPeers(torrent.numPeers);
            setDownloadedBytes(torrent.downloaded);
            setProgress(Math.round(torrent.progress * 100));
            setTimeRemaining(torrent.timeRemaining);

            if (torrent.numPeers > 0) {
              setSwarmSlowWarning(false);
            }

            if (torrent.done) {
              setStatus("completed");
              setProgress(100);
            }
          }, 600);

          torrent.on("done", () => {
            setStatus("completed");
            setProgress(100);
            toast.success("✨ Download finished in browser memory! Click 'Save to Device' below.");
          });

          torrent.on("error", (err: any) => {
            console.error("Torrent runtime error:", err);
            setErrorMessage(err.message || "Torrent connection interrupted");
            setStatus("error");
          });
        }
      );

      client.on("error", (err: any) => {
        console.error("Client runtime error:", err);
        setErrorMessage(err.message || "Failed to establish WebRTC swarm connection");
        setStatus("error");
      });
    } catch (err: any) {
      console.error("Failed to start WebTorrent:", err);
      setErrorMessage(err.message || "Could not initialize in-browser downloader");
      setStatus("error");
    }
  }, [magnetUrl, cleanup]);

  // Launch torrent when modal opens
  useEffect(() => {
    if (isOpen && magnetUrl) {
      startTorrent();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen, magnetUrl, startTorrent, cleanup]);

  // Save downloaded file to user's device
  const handleSaveToDevice = () => {
    const file = activeFileRef.current;
    if (!file) {
      toast.error("File is not ready yet. Please wait a moment.");
      return;
    }

    setIsPreparingBlob(true);
    toast.info("Generating direct file download from browser storage...");

    try {
      file.getBlobURL((err: any, url: string) => {
        setIsPreparingBlob(false);
        if (err || !url) {
          toast.error("Failed to extract file: " + (err?.message || "Unknown error"));
          return;
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Saved "${file.name}" to your Downloads folder!`);
      });
    } catch (err: any) {
      setIsPreparingBlob(false);
      toast.error(err.message || "Download trigger failed");
    }
  };

  const handleCopyMagnet = () => {
    if (!magnetUrl) return;
    navigator.clipboard.writeText(magnetUrl);
    setIsCopied(true);
    toast.success("Magnet link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenExternalApp = () => {
    window.location.href = magnetUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#121217] border border-white/15 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 border border-primary/30">
              <Zap className="w-5 h-5 fill-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                  Direct In-Browser Downloader
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Zero App Required
                </span>
              </div>
              <p className="text-xs text-muted truncate max-w-md mt-0.5">
                {title} {quality && <span className="text-foreground font-medium">({quality})</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Header Card */}
        <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-white/10 space-y-3">
          {/* Status Message */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {status === "completed" ? (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              ) : status === "error" ? (
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shrink-0" />
              )}
              <span className="font-semibold text-foreground">
                {status === "loading_script" && "Initializing WebTorrent Engine..."}
                {status === "connecting" && "Connecting to WebRTC peer swarms..."}
                {status === "metadata" && "Fetching torrent metadata & files..."}
                {status === "downloading" && `Downloading directly in browser (${progress}%)`}
                {status === "completed" && "Download Complete! Ready to Save."}
                {status === "error" && "Connection issue encountered"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted text-[11px]">
              <Radio className={`w-3.5 h-3.5 ${numPeers > 0 ? "text-emerald-400 animate-pulse" : "text-muted"}`} />
              <span>
                {numPeers} {numPeers === 1 ? "Peer" : "Peers"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 relative p-0.5">
              <div
                className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${Math.max(progress, status === "downloading" ? 3 : 0)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted font-medium px-0.5">
              <span>
                {formatRawBytes(downloadedBytes)} / {totalBytes ? formatRawBytes(totalBytes) : "Unknown size"}
              </span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Live Speed & ETA Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-muted block uppercase tracking-wider">Download Speed</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block truncate">
                {downloadSpeed > 0 ? `${formatRawBytes(downloadSpeed)}/s` : "0 B/s"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-muted block uppercase tracking-wider">Upload Speed</span>
              <span className="font-bold text-sky-400 text-sm mt-0.5 block truncate">
                {uploadSpeed > 0 ? `${formatRawBytes(uploadSpeed)}/s` : "0 B/s"}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-muted block uppercase tracking-wider">Est. Time Remaining</span>
              <span className="font-bold text-foreground text-sm mt-0.5 block truncate flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-muted inline shrink-0" />
                {status === "completed" ? "Done" : formatEta(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Video Preview Player (Streams live as pieces arrive) */}
        <div className={`space-y-2 ${showVideoPreview ? "block" : "hidden"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileVideo className="w-3.5 h-3.5 text-primary" />
              Live Streaming Preview
            </span>
            <span className="text-[10px] text-muted">Plays instantly while downloading</span>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Swarm Health / Slow WebRTC Fallback Banner */}
        {swarmSlowWarning && status !== "completed" && (
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-200">
                  Looking for WebRTC seeders in the browser swarm...
                </p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Web browsers can only connect to WebRTC/WebSocket seeders. If this torrent is older and has only traditional BitTorrent seeders, download speed may be slower. You can also open it in any torrent app for instant full swarm speed:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOpenExternalApp}
                className="h-7 text-xs border-amber-500/40 text-amber-200 hover:bg-amber-500/10 gap-1 rounded-lg"
              >
                <ExternalLink className="w-3 h-3" /> Open in uTorrent / App
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCopyMagnet}
                className="h-7 text-xs text-amber-300 hover:bg-amber-500/10 gap-1 rounded-lg"
              >
                <Copy className="w-3 h-3" /> Copy Magnet
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyMagnet}
              className="gap-1.5 text-xs rounded-xl flex-1 sm:flex-none border-white/15 hover:bg-white/5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copied" : "Copy Magnet"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenExternalApp}
              className="gap-1.5 text-xs rounded-xl flex-1 sm:flex-none border-white/15 hover:bg-white/5"
              title="Open via your device's torrent app"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in App</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              onClick={handleSaveToDevice}
              disabled={status === "loading_script" || status === "connecting" || isPreparingBlob}
              className={`gap-2 text-xs font-semibold rounded-xl w-full sm:w-auto px-6 h-10 shadow-lg transition-all ${
                status === "completed"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              }`}
            >
              {isPreparingBlob ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {status === "completed"
                  ? "Save File to Device (.mp4)"
                  : progress > 10
                  ? `Save Current Progress (${progress}%)`
                  : "Save File to Device"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
