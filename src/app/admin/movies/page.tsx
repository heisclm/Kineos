import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { desc, and, or, ilike, eq, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Film, PlayCircle } from "lucide-react";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminCatalogToolbar } from "@/components/admin/AdminCatalogToolbar";
import { AdminDeleteRowButton } from "@/components/admin/AdminDeleteRowButton";

const PAGE_SIZE = 20;

export default async function AdminMoviesPage({
  searchParams,
}: {
  searchParams?: { page?: string; q?: string; status?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const q = searchParams?.q?.trim() || "";
  const status = searchParams?.status || "all";

  const conditions = [];
  if (q) {
    conditions.push(or(ilike(movies.title, `%${q}%`), ilike(movies.slug, `%${q}%`)));
  }
  if (status && status !== "all" && ["published", "draft", "archived"].includes(status)) {
    conditions.push(eq(movies.publicationStatus, status as "published" | "draft" | "archived"));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * PAGE_SIZE;

  let movieItems: any[] = [];
  let totalCount = 0;

  try {
    const [countRes, items] = await Promise.all([
      db.select({ total: sql<number>`count(*)::int` }).from(movies).where(whereClause),
      db
        .select()
        .from(movies)
        .where(whereClause)
        .orderBy(desc(movies.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
    ]);

    totalCount = countRes[0]?.total || 0;
    movieItems = items;
  } catch (e) {
    console.error("DB connection error in AdminMoviesPage:", e);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Film className="w-8 h-8 text-primary" /> Movies
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-muted-foreground">
              {totalCount} Total
            </span>
          </div>
          <p className="text-base text-muted mt-2">
            Manage your cinematic catalog, metadata, publication status, and download links.
          </p>
        </div>
        <Link href="/admin/movies/new">
          <Button className="gap-2 rounded-full shadow-lg font-semibold px-6 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Movie
          </Button>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-surface-elevated/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <AdminCatalogToolbar placeholder="Search movies by title or slug..." totalFiltered={totalCount} />

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
              {movieItems.length > 0 ? (
                movieItems.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                          <PlayCircle className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0 max-w-sm sm:max-w-md">
                          <div className="font-bold text-foreground text-base tracking-tight truncate">
                            {movie.title}
                          </div>
                          <div className="text-xs text-muted mt-0.5 uppercase tracking-wider truncate">
                            {movie.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          movie.publicationStatus === "published"
                            ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                            : movie.publicationStatus === "archived"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/5 text-muted-foreground border-white/10"
                        }`}
                      >
                        {movie.publicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(movie.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/movies/${movie.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Movie"
                            className="w-9 h-9 rounded-full text-muted hover:text-foreground hover:bg-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AdminDeleteRowButton id={movie.id} title={movie.title} type="movie" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Film className="w-10 h-10 text-muted/30" />
                      <p className="text-sm font-medium">
                        {q || (status && status !== "all")
                          ? "No movies found matching your filters."
                          : "No movies found in the catalog yet."}
                      </p>
                      {q || (status && status !== "all") ? (
                        <Link
                          href="/admin/movies"
                          className="text-xs font-semibold text-primary hover:underline mt-1"
                        >
                          Clear filters to view all movies
                        </Link>
                      ) : (
                        <Link href="/admin/movies/new">
                          <Button size="sm" className="mt-2 rounded-full font-semibold">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Movie
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
          baseUrl="/admin/movies"
          searchParams={{ q, status }}
        />
      </div>
    </div>
  );
}
