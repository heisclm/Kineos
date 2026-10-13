"use client";

import { useState, useEffect } from "react";
import { 
  HelpCircle, Magnet, Download, PauseCircle, PlayCircle, Zap, 
  ShieldCheck, Smartphone, Monitor, Apple, X, ExternalLink, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TorrentGuideModalProps {
  variant?: "icon" | "badge" | "link";
  className?: string;
}

export function TorrentGuideModal({ variant = "badge", className = "" }: TorrentGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "pc" | "ios">("android");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {/* Trigger Button Variants */}
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleOpen}
          title="How to download with Fast Mirror (Torrent)? Click for guide"
          className={`w-6 h-6 rounded-full bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 flex items-center justify-center text-xs font-bold transition-all hover:scale-110 shadow-sm ${className}`}
        >
          ?
        </button>
      ) : variant === "link" ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400/90 hover:text-emerald-300 hover:underline transition-colors ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How does Fast Mirror work?</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm ${className}`}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span>How to use Fast Mirror?</span>
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">?</span>
        </button>
      )}

      {/* Guide Modal Backdrop & Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-elevated/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left space-y-6 animate-in zoom-in-95 duration-300 my-auto custom-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/10"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                <Magnet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                  Fast Mirror (Torrent) Guide
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Fast Mirror uses secure peer-to-peer torrent protocol. It is the most resilient, high-speed way to download complete movies and TV seasons.
                </p>
              </div>
            </div>

            {/* Key Advantages Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <PauseCircle className="w-4 h-4 shrink-0" />
                  <span>Pause & Resume Anytime</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Turn off your device, lose Wi-Fi, or pause forever. It will pick up right where it stopped with 0% data lost!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Maximum P2P Speed</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Downloads simultaneously from high-speed seeders. No throttling, no server congestion, and no expired links.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Zero Corrupted Files</span>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Every data block is checksum verified. You get an uncorrupted, flawless high-definition file every time.
                </p>
              </div>
            </div>

            {/* Platform Selection Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
                  How to setup on your device:
                </h4>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab("android")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "android"
                        ? "bg-emerald-500 text-black shadow-md font-bold"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("pc")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "pc"
                        ? "bg-emerald-500 text-black shadow-md font-bold"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> PC / Mac
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ios")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === "ios"
                        ? "bg-emerald-500 text-black shadow-md font-bold"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    <Apple className="w-3.5 h-3.5" /> iPhone / iPad
                  </button>
                </div>
              </div>

              {/* Tab 1: Android Instructions */}
              {activeTab === "android" && (
                <div className="space-y-3.5 bg-black/30 border border-white/5 p-4 rounded-2xl animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Install a free Torrent Downloader</p>
                      <p className="text-muted-foreground mt-0.5">
                        Open the Google Play Store and install <strong>µTorrent</strong> (uTorrent), <strong>BitTorrent</strong>, or <strong>1DM</strong>.
                      </p>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.utorrent.client"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline mt-1.5"
                      >
                        <span>Get µTorrent on Google Play Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Click the green &ldquo;Fast Mirror&rdquo; button</p>
                      <p className="text-muted-foreground mt-0.5">
                        Tap any Fast Mirror button on Kineos. Your phone will ask which app to open with—select <strong>µTorrent</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Download, Pause & Enjoy</p>
                      <p className="text-muted-foreground mt-0.5">
                        Tap <strong>Add / Download</strong>. You can pause it anytime, turn off Wi-Fi, and it will automatically resume whenever you are ready!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: PC / Windows & Mac Instructions */}
              {activeTab === "pc" && (
                <div className="space-y-3.5 bg-black/30 border border-white/5 p-4 rounded-2xl animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Install qBittorrent or µTorrent</p>
                      <p className="text-muted-foreground mt-0.5">
                        We recommend <strong>qBittorrent</strong> (100% free, no ads, open-source) or <strong>µTorrent Web</strong>.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <a
                          href="https://www.qbittorrent.org/download"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                        >
                          <span>Download qBittorrent (Free & No Ads)</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href="https://www.utorrent.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-white hover:underline"
                        >
                          <span>Get µTorrent</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Click &ldquo;Fast Mirror&rdquo; on Kineos</p>
                      <p className="text-muted-foreground mt-0.5">
                        Your browser will prompt <em>&ldquo;Open qBittorrent / µTorrent?&rdquo;</em>. Check &ldquo;Always allow&rdquo; and click Open.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">High-Speed Offline Download</p>
                      <p className="text-muted-foreground mt-0.5">
                        Choose your download folder. Your download will run in the background with maximum bandwidth.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: iOS / iPhone Instructions */}
              {activeTab === "ios" && (
                <div className="space-y-3.5 bg-black/30 border border-white/5 p-4 rounded-2xl animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Apple iOS Policy Note</p>
                      <p className="text-muted-foreground mt-0.5">
                        Apple restricts traditional torrent apps in the App Store. However, you can easily download torrents via free cloud web services:
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div className="text-xs text-white/90">
                      <p className="font-semibold text-foreground text-sm">Use a Cloud Downloader (Seedr.cc)</p>
                      <p className="text-muted-foreground mt-0.5">
                        Copy the Fast Mirror link on Kineos, paste it into <strong>Seedr.cc</strong> (free web service), and download directly to your iPhone Files or Camera Roll as an MP4!
                      </p>
                      <a
                        href="https://www.seedr.cc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline mt-1.5"
                      >
                        <span>Open Seedr.cc (Free Web Torrent Downloader)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Action */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Need more help? Fast Mirror links open in any torrent client.
              </span>
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto rounded-full px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-apple shadow-lg shadow-emerald-500/20"
              >
                Got It, Thanks!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
