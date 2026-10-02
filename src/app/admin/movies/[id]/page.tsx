import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SourceManager } from "@/components/admin/SourceManager";
import { getDownloadSources } from "@/features/admin/sources.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditMovieForm } from "@/components/admin/EditMovieForm";
import { DeleteContentButton } from "@/components/admin/DeleteContentButton";
import { getAdminMovieById } from "@/features/content/content.service";

export default async function AdminMovieDetailPage({ params }: { params: { id: string } }) {
  const movie = await getAdminMovieById(params.id);

  if (!movie) {
    notFound();
  }

  const sources = await getDownloadSources(movie.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
        <Link href="/admin/movies">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{movie.title}</h1>
          <p className="text-muted mt-1">Manage content, metadata, and download sources.</p>
        </div>
        <div className="sm:ml-auto w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <DeleteContentButton id={movie.id} type="movie" />
          <div id="update-button-portal"></div>
        </div>
      </div>

      <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
        <SourceManager contentId={movie.id} contentType="movie" sources={sources} />
      </section>

      <EditMovieForm movie={movie} />
    </div>
  );
}
