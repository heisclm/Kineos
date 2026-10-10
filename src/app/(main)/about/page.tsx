/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import Link from 'next/link';
import { Film, Compass, ShieldCheck, Sparkles, Database, Mail, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Kineos — our mission to deliver a clean, fast, and comprehensive entertainment catalog for movies and TV series.',
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-10 sm:py-16 px-6 md:px-10 max-w-5xl mx-auto">
      {/* Top Left Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About Us" },
        ]}
        className="mb-8 sm:mb-12"
      />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          The Kineos Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          About Kineos
        </h1>
        <p className="text-muted-foreground text-base md:text-xl leading-relaxed">
          Your modern destination for cinema exploration, verified television schedules, and comprehensive streaming metadata.
        </p>
      </div>

      {/* Mission Statement Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-surface/80 border border-white/5 shadow-2xl backdrop-blur-sm mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-3xl rounded-full pointer-events-none -z-10" />
        
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-6">
          Our Mission
        </h2>
        <div className="space-y-4 text-white/70 text-base md:text-lg leading-relaxed font-medium">
          <p>
            Kineos was built with a singular vision: to eliminate the friction in finding exceptional cinema and television. In an era where entertainment is scattered across dozens of platforms, discovering what to watch next should be effortless, informative, and visually immersive.
          </p>
          <p>
            We curate comprehensive plot synopses, verified cast and crew filmographies, high-definition promotional artwork, trailers, and official release schedules into an accessible, lightning-fast interface engineered for film enthusiasts and casual viewers alike.
          </p>
        </div>
      </div>

      {/* Core Values / Features Grid */}
      <div className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8 text-center md:text-left">
          What Sets Kineos Apart
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface/50 border border-white/5 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Verified Metadata</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every title in our catalog features detailed storylines, ratings, genre tags, duration, and original language details gathered from accurate global entertainment registries.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface/50 border border-white/5 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Intuitive Discovery</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Find exactly what you are looking for in seconds using real-time search, multi-genre filtering, release year indexing, and tailored collections of trending releases.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 md:p-8 rounded-2xl bg-surface/50 border border-white/5 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Integrity & Transparency</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Kineos strictly serves as an informational search engine and media indexer. We do not store, host, or upload video media to our servers, maintaining full respect for intellectual property rights.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial & Community Standards */}
      <div className="p-8 md:p-10 rounded-3xl bg-surface/40 border border-white/5 mb-16 space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Editorial Standards & Content Safety
        </h2>
        <div className="space-y-4 text-white/70 text-base leading-relaxed">
          <p>
            Kineos upholds strict digital publishing ethics. We do not index adult-restricted media, hate speech, or malicious content. Our algorithms and curation team continuously monitor metadata to ensure family-safe browsing and accurate classifications across age ratings.
          </p>
          <p>
            We adhere strictly to the Digital Millennium Copyright Act (DMCA). Content owners and authorized representatives can review our designated reporting procedure on our dedicated{' '}
            <Link href="/dmca" className="text-primary hover:underline font-semibold">
              DMCA Copyright Policy
            </Link>{' '}
            page.
          </p>
        </div>
      </div>

      {/* Contact & Support CTA */}
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-surface to-surface/40 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold text-foreground">Have Questions or Suggestions?</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Our team is always looking to improve our catalog, add requested titles, or assist with inquiries.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:scale-105 transition-apple flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact Team
          </Link>
          <Link
            href="/movies"
            className="px-6 py-3.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-foreground transition-apple flex items-center justify-center gap-2"
          >
            <Film className="w-4 h-4" />
            Browse Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
