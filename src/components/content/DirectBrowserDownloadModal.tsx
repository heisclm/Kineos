"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Zap,
  Download,
  Play,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  FileVideo,
  Radio,
  Clock,
  ShieldCheck,
  Cloud,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatRawBytes, formatEta } from "@/lib/utils";

const WEBTORRENT_TRACKERS = [
  "wss://tracker.openwebtorrent.com",
  "wss://tracker.webtorrent.dev",
  "wss://tracker.files.fm:7073/announce",
  "wss://tracker.btorrent.xyz",
  "wss://tracker.fastcast.nz",
  "wss://tracker.sloppyta.co:443/announce",
  "wss://spacetradersapi-chatbox.herokuapp.com:443/announce",
  "wss://tracker.novage.com.ua:443/announce",
];

function extractInfoHash(magnet: string): string {
  if (!magnet) return "";
  const match = magnet.match(/xt=urn:btih:([a-zA-Z0-9]+)/i);
  return match ? match[1].toLowerCase() : "";
}

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
  // Mode: "cloud" (Webtor - connects to 100% of seeders worldwide) or "p2p" (in-browser WebTorrent)
  const [activeTab, setActiveTab] = useState<"cloud" | "p2p">("cloud");

  // WebTorrent Engine State
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

  // Cloud Webtor State
  const [isWebtorLoaded, setIsWebtorLoaded] = useState(false);

  const clientRef = useRef<any>(null);
  const torrentRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeFileRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const swarmCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  const infoHash = extractInfoHash(magnetUrl);
  const webtorDirectUrl = infoHash
    ? `https://webtor.io/${infoHash}`
    : `https://webtor.io/${encodeURIComponent(magnetUrl)}`;

  // Stop & destroy WebTorrent client
  const cleanupP2P = useCallback(() => {
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

  // Close modal and cleanup everything
  const handleClose = () => {
    cleanupP2P();
    setStatus("idle");
    setProgress(0);
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setNumPeers(0);
    setShowVideoPreview(false);
    setSwarmSlowWarning(false);
    onClose();
  };

  // Dynamically load Webtor SDK for Cloud Stream Mode
  useEffect(() => {
    if (isOpen && activeTab === "cloud") {
      const existingScript = document.querySelector('script[src*="@webtor/embed-sdk-js"]');
      if (existingScript) {
        setIsWebtorLoaded(true);
      } else {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = () => setIsWebtorLoaded(true);
        script.onerror = () => setIsWebtorLoaded(false);
        document.head.appendChild(script);
      }
    }
  }, [isOpen, activeTab]);

  // Start In-Browser WebTorrent (P2P tab only)
  const startP2PTorrent = useCallback(async () => {
    if (!magnetUrl) return;
    cleanupP2P();

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

      // 2. Initialize WebTorrent client with multi-STUN configuration
      const client = new WebTorrent({
        tracker: {
          rtcConfig: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        },
      });
      clientRef.current = client;

      setStatus("connecting");

      // Notify user if WebRTC swarm is slow after 8 seconds
      swarmCheckTimerRef.current = setTimeout(() => {
        setSwarmSlowWarning(true);
      }, 8000);

      // 3. Add torrent with enriched trackers
      const enrichedMagnet = enrichMagnetUri(magnetUrl);
      client.add(
        enrichedMagnet,
        {
          announce: WEBTORRENT_TRACKERS,
        },
        (torrent: any) => {
          torrentRef.current = torrent;
          setStatus("metadata");

          torrent.on("ready", () => {
            setStatus("downloading");
            setTotalBytes(torrent.length);

            const mappedFiles = (torrent.files || []).map((f: any) => ({
              name: f.name,
              length: f.length,
              progress: 0,
              isVideo: /\.(mp4|mkv|webm|avi|mov)$/i.test(f.name),
            }));
            setFiles(mappedFiles);

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

            if (primaryFile && /\.(mp4|webm)$/i.test(primaryFile.name) && videoRef.current) {
              try {
                primaryFile.renderTo(videoRef.current, { autoplay: false });
                setShowVideoPreview(true);
              } catch (e) {
                console.warn("Video render error:", e);
              }
            }
          });

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
  }, [magnetUrl, cleanupP2P]);

  // Handle tab switching
  useEffect(() => {
    if (isOpen && activeTab === "p2p" && status === "idle") {
      startP2PTorrent();
    } else if (activeTab === "cloud") {
      cleanupP2P();
      setStatus("idle");
    }
  }, [isOpen, activeTab, startP2PTorrent, cleanupP2P, status]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      cleanupP2P();
    }
    return () => cleanupP2P();
  }, [isOpen, cleanupP2P]);

  // Save downloaded file to user's device
  const handleSaveToDevice = () => {
    const file = activeFileRef.current;
    if (!file) {
      toast.error("File is not ready yet. Please wait for pieces to buffer.");
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
      <div className="bg-[#121217] border border-white/15 rounded-3xl p-4 sm:p-7 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 my-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-lg text-foreground tracking-tight truncate">
                  Direct Stream & Downloader
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Zero App Required
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted truncate max-w-md mt-0.5">
                {title} {quality && <span className="text-foreground font-medium">({quality})</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 sm:p-2 rounded-xl text-muted hover:text-foreground hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Engine Mode Tabs (Cloud vs In-Browser P2P) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("cloud")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "cloud"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Cloud Stream & DDL (Fast)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("p2p")}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "p2p"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">P2P Browser Swarm</span>
          </button>
        </div>

        {/* TAB 1: CLOUD DIRECT STREAM & DOWNLOAD (Webtor) - Connects to 100% of seeders */}
        {activeTab === "cloud" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Embedded Cloud Player */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  Instant Cloud Player
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">
                  Connects to 100% of BitTorrent seeders
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-video flex items-center justify-center shadow-lg">
                <video
                  controls
                  playsInline
                  src={magnetUrl}
                  data-title={title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Direct HTTP Download Card */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Direct File Download (High-Speed Cloud Mirror)
                  </h4>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Download the original movie file directly over secure HTTPS without needing uTorrent or any torrent client.
                  </p>
                </div>
              </div>

              <a
                href={webtorDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 active:scale-[0.99] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Open Direct Cloud Download Links (.mp4 / .mkv)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: IN-BROWSER P2P WEBTORRENT ENGINE */}
        {activeTab === "p2p" && (
          <div className="space-y-4 animate-in fade-in duration-200">
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
                  <span className="font-semibold text-foreground text-[11px] sm:text-xs">
                    {status === "loading_script" && "Initializing WebTorrent Engine..."}
                    {status === "connecting" && "Connecting to WebRTC peer swarms..."}
                    {status === "metadata" && "Fetching metadata & files..."}
                    {status === "downloading" && `Downloading in browser (${progress}%)`}
                    {status === "completed" && "Download Complete! Ready to Save."}
                    {status === "error" && "Connection issue encountered"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-muted text-[11px]">
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      numPeers > 0 ? "text-emerald-400 animate-pulse" : "text-muted"
                    }`}
                  />
                  <span>
                    {numPeers} {numPeers === 1 ? "Peer" : "Peers"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 relative p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.max(progress, status === "downloading" ? 3 : 0)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted font-medium px-0.5">
                  <span>
                    {formatRawBytes(downloadedBytes)} /{" "}
                    {totalBytes ? formatRawBytes(totalBytes) : "Unknown size"}
                  </span>
                  <span>{progress}%</span>
                </div>
              </div>

              {/* Live Speed & ETA Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[9px] sm:text-[10px] text-muted block uppercase tracking-wider">
                    Download Speed
                  </span>
                  <span className="font-bold text-emerald-400 text-xs sm:text-sm mt-0.5 block truncate">
                    {downloadSpeed > 0 ? `${formatRawBytes(downloadSpeed)}/s` : "0 B/s"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[9px] sm:text-[10px] text-muted block uppercase tracking-wider">
                    Upload Speed
                  </span>
                  <span className="font-bold text-sky-400 text-xs sm:text-sm mt-0.5 block truncate">
                    {uploadSpeed > 0 ? `${formatRawBytes(uploadSpeed)}/s` : "0 B/s"}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-white/5">
                  <span className="text-[9px] sm:text-[10px] text-muted block uppercase tracking-wider">
                    Est. Time Remaining
                  </span>
                  <span className="font-bold text-foreground text-xs sm:text-sm mt-0.5 block truncate flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-muted inline shrink-0" />
                    {status === "completed" ? "Done" : formatEta(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Preview Player */}
            {showVideoPreview && (
              <div className="space-y-2">
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
            )}

            {/* 0 Peers Swarm Alert with 1-click Quick Switch */}
            {swarmSlowWarning && numPeers === 0 && status !== "completed" && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">
                      0 WebRTC browser peers found on this torrent
                    </p>
                    <p className="text-[11px] text-amber-300/80 leading-relaxed">
                      This torrent is currently seeded on traditional BitTorrent desktop seeders (TCP/UDP). Use Cloud Stream above or open in uTorrent for instant full speed:
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setActiveTab("cloud")}
                    className="h-7 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold gap-1 rounded-lg"
                  >
                    <Cloud className="w-3 h-3" /> Switch to Cloud Stream & DDL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleOpenExternalApp}
                    className="h-7 text-xs border-amber-500/40 text-amber-200 hover:bg-amber-500/10 gap-1 rounded-lg"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in uTorrent
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons (Responsive on mobile & tablet) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyMagnet}
              className="gap-1.5 text-xs rounded-xl flex-1 sm:flex-none border-white/15 hover:bg-white/5 h-9"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Copied" : "Copy Magnet"}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenExternalApp}
              className="gap-1.5 text-xs rounded-xl flex-1 sm:flex-none border-white/15 hover:bg-white/5 h-9"
              title="Open via your device's torrent app (uTorrent / BitTorrent)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open in App</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeTab === "p2p" ? (
              <Button
                type="button"
                onClick={handleSaveToDevice}
                disabled={status === "loading_script" || status === "connecting" || isPreparingBlob}
                className={`gap-2 text-xs font-semibold rounded-xl w-full sm:w-auto px-5 h-9 shadow-lg transition-all ${
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
                    ? `Save Progress (${progress}%)`
                    : "Save File to Device"}
                </span>
              </Button>
            ) : (
              <a
                href={webtorDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Device (.mp4)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
