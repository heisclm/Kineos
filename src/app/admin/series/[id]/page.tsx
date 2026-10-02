import { db } from "@/lib/db";
import { series, seasons, episodes } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SourceManager } from "@/components/admin/SourceManager";
import { EpisodeManager } from "@/components/admin/EpisodeManager";
import { getDownloadSources } from "@/features/admin/sources.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSeriesDetailPage({ params }: { params: { id: string } }) {
  const [show] = await db.select().from(series).where(eq(series.id, params.id)).limit(1);

  if (!show) {
    notFound();
  }

  const sources = await getDownloadSources(show.id);
  
  // Fetch seasons and episodes
  const allSeasons = await db.select().from(seasons).where(eq(seasons.seriesId, show.id)).orderBy(asc(seasons.seasonNumber));
  const allEpisodes = await db.select().from(episodes).orderBy(asc(episodes.episodeNumber));
  
  const seasonsWithEpisodes = allSeasons.map(s => ({
    ...s,
    episodes: allEpisodes.filter(e => e.seasonId === s.id)
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/series">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{show.title}</h1>
          <p className="text-muted mt-1">Manage series content, metadata, and episodes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
            <EpisodeManager seriesId={show.id} existingSeasons={seasonsWithEpisodes} />
          </section>

          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-6">Series Level Sources</h3>
            <p className="text-sm text-muted mb-6">Use this for full season packs or series extras.</p>
            <SourceManager contentId={show.id} contentType="series" sources={sources} />
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase mb-4">Content Info</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-medium text-foreground mt-1 capitalize">{show.publicationStatus}</dd>
              </div>
              <div>
                <dt className="text-muted">Slug</dt>
                <dd className="font-medium text-foreground mt-1 truncate">{show.slug}</dd>
              </div>
              <div>
                <dt className="text-muted">Created</dt>
                <dd className="font-medium text-foreground mt-1">{new Date(show.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
