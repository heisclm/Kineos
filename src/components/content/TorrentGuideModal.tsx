"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  HelpCircle, Magnet, Download, PauseCircle, Zap, 
  ShieldCheck, Smartphone, Monitor, Apple, X, ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TorrentGuideModalProps {
  variant?: "icon" | "badge" | "link" | "none";
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function TorrentGuideModal({
  variant = "badge",
  className = "",
  isOpen: controlledIsOpen,
  onClose,
}: TorrentGuideModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"android" | "pc" | "ios">("android");

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    setInternalIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

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
    setInternalIsOpen(true);
  };

  // Modal dialog rendered via Portal to ensure it is always above headers, navigation, and overlays
  const modalPortal =
    isOpen && mounted
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={handleClose}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xl overflow-y-auto overscroll-contain flex flex-col items-center justify-start p-3 sm:p-6 pt-16 sm:pt-12 pb-10 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-surface-elevated/95 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-left space-y-4 sm:space-y-6 my-auto custom-scrollbar animate-in zoom-in-95 duration-200"
            >
              {/* Close Button - prominent, easy tap target */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 text-muted-foreground hover:text-white transition-colors border border-white/10 z-10"
                aria-label="Close guide"
              >
                <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-3 sm:gap-4 pr-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                  <Magnet className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                    Fast Mirror (Torrent) Guide
                  </h3>
                  <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-relaxed">
                    Fast Mirror uses secure peer-to-peer torrent protocol. The fastest, most resilient way to download full movies and complete series.
                  </p>
                </div>
              </div>

              {/* Key Advantages Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <PauseCircle className="w-4 h-4 shrink-0" />
                    <span>Pause & Resume Anytime</span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Turn off Wi-Fi, shut down, or pause forever. It resumes right where you stopped with 0% data lost!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl sm:rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Maximum P2P Speed</span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Connects directly to top seeders. No file hoster throttling, no server congestion, and no expired links.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl sm:rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Zero Corrupted Files</span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed">
                    Every piece is checksum-verified by your torrent app. You always get a flawless, uncorrupted HD video file.
                  </p>
                </div>
              </div>

              {/* Platform Selection Tabs */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/5">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider text-[11px]">
                    How to setup on your device:
                  </h4>
                  <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveTab("android")}
                      className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                        activeTab === "android"
                          ? "bg-emerald-500 text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      <span>Android</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pc")}
                      className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                        activeTab === "pc"
                          ? "bg-emerald-500 text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5 shrink-0" />
                      <span>PC / Mac</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("ios")}
                      className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                        activeTab === "ios"
                          ? "bg-emerald-500 text-black shadow-md font-bold"
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      <Apple className="w-3.5 h-3.5 shrink-0" />
                      <span>iOS</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Android Instructions */}
                {activeTab === "android" && (
                  <div className="space-y-3 bg-black/30 border border-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Install a free Torrent Downloader</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Open the Google Play Store and install <strong>µTorrent</strong>, <strong>BitTorrent</strong>, or <strong>1DM</strong>.
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

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Click the green &ldquo;Fast Mirror&rdquo; button</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Tap any Fast Mirror button on Kineos. When your phone asks which app to open with, select <strong>µTorrent</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Download, Pause & Enjoy</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Tap <strong>Add / Download</strong>. You can pause it anytime, turn off Wi-Fi, and it resumes automatically!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: PC / Windows & Mac Instructions */}
                {activeTab === "pc" && (
                  <div className="space-y-3 bg-black/30 border border-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Install qBittorrent or µTorrent</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          We recommend <strong>qBittorrent</strong> (100% free, no ads, open-source) or <strong>µTorrent Web</strong>.
                        </p>
                        <div className="flex flex-wrap gap-2.5 mt-1.5">
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

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Click &ldquo;Fast Mirror&rdquo; on Kineos</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Your browser will ask <em>&ldquo;Open qBittorrent / µTorrent?&rdquo;</em>. Check &ldquo;Always allow&rdquo; and click Open.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">High-Speed Offline Download</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Pick your download folder. Your download will run in the background with maximum bandwidth.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: iOS / iPhone Instructions */}
                {activeTab === "ios" && (
                  <div className="space-y-3 bg-black/30 border border-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Apple iOS App Store Policy</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                          Apple restricts standalone torrent apps in the App Store. However, you can easily download torrents via free cloud web services:
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <div className="text-xs text-white/90">
                        <p className="font-semibold text-foreground text-xs sm:text-sm">Use Cloud Downloader (Seedr.cc)</p>
                        <p className="text-muted-foreground mt-0.5 leading-relaxed text-[11px] sm:text-xs">
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

              {/* Modal Bottom Action Bar */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                <span className="text-[11px] text-muted-foreground text-center sm:text-left">
                  Fast Mirror links open in any torrent client app.
                </span>
                <Button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto rounded-full px-6 py-2.5 h-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-apple shadow-lg shadow-emerald-500/20"
                >
                  Got It, Thanks!
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* Trigger Button Variants */}
      {variant === "none" ? null : variant === "icon" ? (
        <button
          type="button"
          onClick={handleOpen}
          title="Fast Mirror (Torrent) Guide & Advantages"
          className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 hover:text-white flex items-center justify-center text-xs font-bold transition-all hover:scale-110 active:scale-95 shadow-sm shrink-0 ${className}`}
        >
          ?
        </button>
      ) : variant === "link" ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400/90 hover:text-emerald-300 hover:underline transition-colors ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>How does Fast Mirror work?</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          title="How does Fast Mirror work? Click for guide"
          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[11px] sm:text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0 whitespace-nowrap ${className}`}
        >
          <Magnet className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>How to use Fast Mirror?</span>
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] sm:text-[10px] font-bold shrink-0">?</span>
        </button>
      )}

      {modalPortal}
    </>
  );
}
