import { db } from "@/lib/db";
import { series } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SourceManager } from "@/components/admin/SourceManager";
import { getDownloadSources } from "@/features/admin/sources.actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditSeriesForm } from "@/components/admin/EditSeriesForm";
import { DeleteContentButton } from "@/components/admin/DeleteContentButton";
import { getAdminSeriesById } from "@/features/content/content.service";

export default async function AdminSeriesDetailPage({ params }: { params: { id: string } }) {
  const seriesItem = await getAdminSeriesById(params.id);

  if (!seriesItem) {
    notFound();
  }

  const sources = await getDownloadSources(seriesItem.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
        <Link href="/admin/series">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{seriesItem.title}</h1>
          <p className="text-muted mt-1">Manage content, metadata, and download sources.</p>
        </div>
        <div className="sm:ml-auto w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
          <DeleteContentButton id={seriesItem.id} type="series" />
          <div id="update-button-portal"></div>
        </div>
      </div>

      <section className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6 md:p-8">
        <SourceManager contentId={seriesItem.id} contentType="series" sources={sources} />
      </section>

      <EditSeriesForm series={seriesItem} />
    </div>
  );
}
