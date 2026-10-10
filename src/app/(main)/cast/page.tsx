import { getAllCastMembers } from "@/features/content/content.service";
import Link from "next/link";
import Image from "next/image";
import { slugify } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { User, Sparkles, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Cast & Crew Directory - Browse Actors & Filmmakers | Kineos" },
  description:
    "Explore the complete roster of actors, directors, and filmmakers across Kineos. Discover their full filmographies and stream their movies and TV series in HD.",
  alternates: {
    canonical: "https://www.kineos.fun/cast",
  },
  openGraph: {
    title: "Cast & Crew Directory | Kineos",
    description: "Browse top actors and filmmakers on Kineos.",
    url: "https://www.kineos.fun/cast",
    siteName: "Kineos",
  },
};

export default async function CastDirectoryPage() {
  const castList = await getAllCastMembers();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kineos Cast & Crew Directory",
    description: "A directory of prominent actors and filmmakers featured on Kineos.",
    itemListElement: castList.slice(0, 50).map((c, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: c.name,
        url: `${siteUrl}/cast/${slugify(c.name)}`,
        image: c.imageUrl || undefined,
      },
    })),
  };

  return (
    <div className="w-full min-h-screen pb-24">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="w-full relative bg-background border-b border-white/5 pt-20 md:pt-24 lg:pt-28 pb-10 md:pb-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10">
          {/* Top Left Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cast & Crew" },
            ]}
            className="mb-4"
            includeJsonLd={false}
          />

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
              <Sparkles className="w-3 h-3" /> Talent Directory
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Cast &amp; Filmmakers
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
              Browse actors, actresses, and directors featured in Kineos movies and TV series.
              Select any artist to view their complete filmography and download high-definition titles.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Cast Members */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 mt-8">
        {castList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
            {castList.map((member) => {
              const slug = slugify(member.name);
              return (
                <Link
                  key={member.id}
                  href={`/cast/${slug}`}
                  className="group flex flex-col items-center p-4 rounded-2xl bg-surface border border-white/5 hover:border-primary/40 hover:bg-surface-elevated transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-primary/60 transition-colors bg-surface-elevated shadow-inner">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                        <User className="w-8 h-8 mb-0.5" />
                        <span className="text-xs font-bold">{member.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
                    {member.name}
                  </span>
                  <span className="text-[11px] text-white/50 font-medium mt-0.5 uppercase tracking-wider">
                    View Filmography
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center rounded-2xl bg-surface border border-white/5">
            <p className="text-base text-white/60 font-medium">
              No cast members found in the catalog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
