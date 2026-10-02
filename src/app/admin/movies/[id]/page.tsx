import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SourceManager } from "@/components/admin/SourceManager";
import { getDownloadSources } from "@/features/admin/sources.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminMovieDetailPage({ params }: { params: { id: string } }) {
  const [movie] = await db.select().from(movies).where(eq(movies.id, params.id)).limit(1);

  if (!movie) {
    notFound();
  }

  const sources = await getDownloadSources(movie.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/movies">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{movie.title}</h1>
          <p className="text-muted mt-1">Manage content, metadata, and download sources.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
            <SourceManager contentId={movie.id} contentType="movie" sources={sources} />
          </section>

          {/* Placeholder for Movie Details Edit Form */}
          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8 opacity-50 pointer-events-none">
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-6">MOVIE METADATA (LOCKED)</h3>
            <p className="text-sm text-muted">Movie editing is disabled in this view for MVP scope.</p>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6">
            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase mb-4">Content Info</h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-medium text-foreground mt-1 capitalize">{movie.publicationStatus}</dd>
              </div>
              <div>
                <dt className="text-muted">Slug</dt>
                <dd className="font-medium text-foreground mt-1 truncate">{movie.slug}</dd>
              </div>
              <div>
                <dt className="text-muted">Created</dt>
                <dd className="font-medium text-foreground mt-1">{new Date(movie.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
