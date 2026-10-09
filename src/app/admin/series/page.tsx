import { db } from "@/lib/db";
import { series } from "@/lib/db/schema";
import { desc, and, or, ilike, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Tv } from "lucide-react";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminCatalogToolbar } from "@/components/admin/AdminCatalogToolbar";
import { AdminDeleteRowButton } from "@/components/admin/AdminDeleteRowButton";

const PAGE_SIZE = 20;

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string; status?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const q = searchParams?.q?.trim() || "";
  const status = searchParams?.status || "all";

  const conditions = [];
  if (q) {
    conditions.push(or(ilike(series.title, `%${q}%`), ilike(series.slug, `%${q}%`)));
  }
  if (status && status !== "all" && ["published", "draft", "archived"].includes(status)) {
    conditions.push(eq(series.publicationStatus, status as "published" | "draft" | "archived"));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * PAGE_SIZE;

  let seriesItems: any[] = [];
  let totalCount = 0;

  try {
    const [countRes, items] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(series).where(whereClause),
      db
        .select()
        .from(series)
        .where(whereClause)
        .orderBy(desc(series.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
    ]);

    totalCount = countRes[0]?.total || 0;
    seriesItems = items;
  } catch (e) {
    console.error("DB connection error in AdminSeriesPage:", e);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Tv className="w-8 h-8 text-primary" /> TV Series
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-muted-foreground">
              {totalCount} Total
            </span>
          </div>
          <p className="text-base text-muted mt-2">
            Manage your TV shows catalog, seasons, episodes, and streaming availability.
          </p>
        </div>
        <Link href="/admin/series/new">
          <Button className="gap-2 rounded-full shadow-lg font-semibold px-6 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Series
          </Button>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-elevated/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <AdminCatalogToolbar placeholder="Search series by title or slug..." totalFiltered={totalCount} />

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {seriesItems.length > 0 ? (
                seriesItems.map((show) => (
                  <tr key={show.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                          <Tv className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0 max-w-sm sm:max-w-md">
                          <div className="font-bold text-foreground text-base tracking-tight truncate">
                            {show.title}
                          </div>
                          <div className="text-xs text-muted mt-0.5 uppercase tracking-wider truncate">
                            {show.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          show.publicationStatus === "published"
                            ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                            : show.publicationStatus === "archived"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/5 text-muted-foreground border-white/10"
                        }`}
                      >
                        {show.publicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {show.releaseDate
                        ? new Date(show.releaseDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(show.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/series/${show.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Series & Manage Episodes"
                            className="w-9 h-9 rounded-full text-muted hover:text-foreground hover:bg-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AdminDeleteRowButton id={show.id} title={show.title} type="series" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Tv className="w-10 h-10 text-muted/30" />
                      <p className="text-sm font-medium">
                        {q || (status && status !== "all")
                          ? "No series found matching your filters."
                          : "No series found in the catalog yet."}
                      </p>
                      {q || (status && status !== "all") ? (
                        <Link
                          href="/admin/series"
                          className="text-xs font-semibold text-primary hover:underline mt-1"
                        >
                          Clear filters to view all series
                        </Link>
                      ) : (
                        <Link href="/admin/series/new">
                          <Button size="sm" className="mt-2 rounded-full font-semibold">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Series
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bottom Footer */}
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          baseUrl="/admin/series"
          searchParams={{ q, status }}
        />
      </div>
    </div>
  );
}
