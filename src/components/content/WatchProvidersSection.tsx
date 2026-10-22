"use client";

import Image from "next/image";
import { Play, ExternalLink, ShieldCheck, Tv, Film } from "lucide-react";
import type { TmdbWatchProvidersResult, TmdbWatchProvider } from "@/lib/tmdb";

interface WatchProvidersSectionProps {
  title: string;
  type?: "movie" | "series";
  providers: TmdbWatchProvidersResult | null;
}

export function WatchProvidersSection({
  title,
  type = "movie",
  providers,
}: WatchProvidersSectionProps) {
  const hasStream = providers?.stream && providers.stream.length > 0;
  const hasRent = providers?.rent && providers.rent.length > 0;
  const hasBuy = providers?.buy && providers.buy.length > 0;
  const hasFree = providers?.free && providers.free.length > 0;
  const hasAny = hasStream || hasRent || hasBuy || hasFree;

  // Deduplicate rent and buy if provider names overlap
  const rentAndBuyMap = new Map<number, TmdbWatchProvider>();
  providers?.rent?.forEach((p) => rentAndBuyMap.set(p.id, p));
  providers?.buy?.forEach((p) => rentAndBuyMap.set(p.id, p));
  const rentAndBuy = Array.from(rentAndBuyMap.values());

  const fallbackSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`where to watch ${title} ${type}`)}`;

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-surface/90 border border-white/5 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Tv className="w-4 h-4 shrink-0" />
            <span>Official Streaming Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Where to Watch {title}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Licensed streaming platforms, digital rentals, and official storefronts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Licensed & Verified</span>
        </div>
      </div>

      {/* Main Content */}
      {hasAny ? (
        <div className="space-y-6">
          {/* Subscription Streaming (Flatrate) */}
          {hasStream && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-3 h-3 text-primary fill-current" />
                Stream on Subscription
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {providers.stream!.map((provider) => (
                  <a
                    key={provider.id}
                    href={providers.link || fallbackSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-primary/40 transition-apple shadow-sm cursor-pointer"
                  >
                    {provider.logoUrl ? (
                      <Image
                        src={provider.logoUrl}
                        alt={provider.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-lg object-cover shadow group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {provider.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-primary transition-colors truncate">
                        {provider.name}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-medium">Included</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Free with Ads */}
          {hasFree && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3 h-3 text-emerald-400" />
                Free Streaming (With Ads)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {providers.free!.map((provider) => (
                  <a
                    key={provider.id}
                    href={providers.link || fallbackSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/40 transition-apple shadow-sm cursor-pointer"
                  >
                    {provider.logoUrl ? (
                      <Image
                        src={provider.logoUrl}
                        alt={provider.name}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-lg object-cover shadow group-hover:scale-105 transition-transform shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {provider.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-emerald-400 transition-colors truncate">
                        {provider.name}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-medium">Free with Ads</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rent or Buy */}
          {rentAndBuy.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Digital Rent or Purchase
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {rentAndBuy.map((provider) => (
                  <a
                    key={provider.id}
                    href={providers.link || fallbackSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-apple cursor-pointer text-xs font-medium text-white/80 hover:text-white"
                  >
                    {provider.logoUrl && (
                      <Image
                        src={provider.logoUrl}
                        alt={provider.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded object-cover shrink-0"
                      />
                    )}
                    <span>{provider.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Deep link to TMDB / JustWatch */}
          {providers.link && (
            <div className="pt-2">
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-semibold transition-apple hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <span>View all global regions and prices on JustWatch</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
          <p className="text-sm text-white/80">
            Streaming options vary by region. Check availability directly on official digital storefronts:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <a
              href={`https://tv.apple.com/search?term=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-apple"
            >
              <span>Apple TV</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <a
              href={`https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-apple"
            >
              <span>Amazon Prime Video</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <a
              href={`https://play.google.com/store/search?q=${encodeURIComponent(title)}&c=movies`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-apple"
            >
              <span>Google TV</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
            <a
              href={fallbackSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-semibold text-primary transition-apple"
            >
              <span>Search All Platforms</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Attribution & Legal Notice */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground text-center sm:text-left">
        <span>
          Streaming data powered by <strong className="text-white/70">JustWatch</strong> via <strong className="text-white/70">TMDB</strong>.
        </span>
        <span className="text-white/40">
          Kineos does not host media files &bull; All links point to licensed distributors
        </span>
      </div>
    </div>
  );
}
