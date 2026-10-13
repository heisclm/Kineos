/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import {
  Zap,
  Download,
  Play,
  Copy,
  ShieldCheck,
  Radio,
  FileVideo,
  Sparkles,
  ArrowRight,
  Clipboard,
  ExternalLink,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DirectBrowserDownloadModal } from "@/components/content/DirectBrowserDownloadModal";
import { TorrentGuideModal } from "@/components/content/TorrentGuideModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// Public domain / open-source WebTorrent test samples for instant testing
const SAMPLE_TORRENTS = [
  {
    name: "Sintel (Open Blender Movie)",
    size: "129 MB",
    magnet:
      "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com",
  },
  {
    name: "Big Buck Bunny (1080p)",
    size: "276 MB",
    magnet:
      "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com",
  },
  {
    name: "Tears of Steel (Sci-Fi Short)",
    size: "571 MB",
    magnet:
      "magnet:?xt=urn:btih:2b1216290072b220d3f25d97cf12a450cc767b40&dn=Tears+of+Steel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com",
  },
];

export default function DirectDownloadPage() {
  const [magnetInput, setMagnetInput] = useState("");
  const [activeMagnet, setActiveMagnet] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState("Custom Magnet");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleStartDownload = (magnetToUse?: string, titleToUse?: string) => {
    const rawMagnet = (magnetToUse || magnetInput).trim();

    if (!rawMagnet) {
      toast.error("Please paste a valid magnet link first.");
      return;
    }

    if (!rawMagnet.startsWith("magnet:") && !rawMagnet.includes("xt=urn:btih:")) {
      toast.error("Invalid link format. Must be a magnet URL (magnet:?xt=urn:btih:...)");
      return;
    }

    // Try to extract dn (display name) if available
    let name = titleToUse || "Magnet Download";
    try {
      const urlParams = new URLSearchParams(rawMagnet.replace(/^magnet:\?/, ""));
      const dn = urlParams.get("dn");
      if (dn) name = decodeURIComponent(dn);
    } catch {
      // keep fallback
    }

    setActiveMagnet(rawMagnet);
    setActiveTitle(name);
    setIsModalOpen(true);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMagnetInput(text.trim());
        toast.success("Pasted magnet link from clipboard!");
      }
    } catch {
      toast.error("Unable to read clipboard. Please paste manually (Ctrl+V / Cmd+V).");
    }
  };

  return (
    <div className="w-full min-h-screen pt-4 sm:pt-6 pb-20 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Magnet Direct Downloader" },
        ]}
        className="mb-8"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
          <Zap className="w-3.5 h-3.5" />
          Zero Cost • 100% In-Browser Engine
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Magnet to Direct Download & Stream
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          Convert any BitTorrent magnet link into an instant high-speed direct stream or direct browser download. No paid debrid service required, zero server storage, and 100% private.
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#121217]/90 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label htmlFor="magnet-input" className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Enter Magnet Link:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5 text-primary" />
                Paste from Clipboard
              </button>
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="text-xs text-white/70 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                Guide
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="magnet-input"
              rows={3}
              value={magnetInput}
              onChange={(e) => setMagnetInput(e.target.value)}
              placeholder="magnet:?xt=urn:btih:..."
              className="w-full bg-[#0a0a0f] border border-white/15 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 text-white rounded-2xl p-4 text-sm font-mono placeholder:text-muted-foreground/40 resize-none transition-all outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => handleStartDownload()}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold py-6 rounded-2xl text-base shadow-lg shadow-emerald-500/20 gap-2 border-0 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Zap className="w-5 h-5 fill-current" />
              Start Direct Download & Stream
            </Button>
            {magnetInput && (
              <Button
                variant="outline"
                onClick={() => setMagnetInput("")}
                className="w-full sm:w-auto px-5 py-6 rounded-2xl border-white/15 hover:bg-white/5 text-white/70 hover:text-white cursor-pointer"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Quick Test Samples */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Or test instantly with verified open-source swarms:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {SAMPLE_TORRENTS.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setMagnetInput(sample.magnet);
                  handleStartDownload(sample.magnet, sample.name);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="truncate pr-2">
                  <p className="text-xs font-medium text-white group-hover:text-emerald-400 truncate">
                    {sample.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{sample.size}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-3xl bg-surface/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <h3 className="text-base font-bold text-foreground">Watch While Downloading</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No need to wait for 100% completion. The built-in HTML5 media player buffers pieces sequentially so you can start streaming immediately.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Save Directly to Device</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One-click export directly from your browser memory into your local Downloads folder as clean MP4 or MKV files.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface/60 border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Zero Cost & Zero Logs</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Runs 100% inside your web browser via WebRTC mesh networking. Data travels directly peer-to-peer without touching our servers.
          </p>
        </div>
      </div>

      {/* Technical FAQ / How it works */}
      <div className="p-8 rounded-3xl bg-surface/40 border border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p className="font-semibold text-white">How does in-browser direct download work?</p>
            <p className="leading-relaxed">
              Standard torrent clients like uTorrent require software installation and connect over TCP/uTP. Kineos uses the WebTorrent WebRTC engine bundled directly inside your browser. It speaks WebRTC WebSocket protocol to connect to browser peers and web-seeders to download pieces straight into your browser memory.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-white">What if the magnet has 0 WebRTC peers?</p>
            <p className="leading-relaxed">
              Some older torrents only exist on traditional BitTorrent networks (TCP/uTP) and lack active WebRTC peers. If connection takes too long, you can click &quot;Open in uTorrent / App&quot; or copy the magnet link to download with any desktop/mobile BitTorrent client with infinite resume support.
            </p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-white">Is there any file size limit or cost?</p>
            <p className="leading-relaxed">
              It is 100% free and unlimited. The download capacity depends only on your local device&apos;s available browser memory and disk space.
            </p>
          </div>
        </div>
      </div>

      {/* WebTorrent Modal Component */}
      {activeMagnet && (
        <DirectBrowserDownloadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setActiveMagnet(null);
          }}
          magnetUrl={activeMagnet}
          title={activeTitle}
        />
      )}

      {/* Torrent Guide Modal */}
      <TorrentGuideModal variant="none" isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
