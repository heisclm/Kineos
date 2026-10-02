import { db } from "@/lib/db";
import { movies } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Film, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminMoviesPage() {
  let allMovies: any[] = [];
  try {
    allMovies = await db.select().from(movies).orderBy(desc(movies.createdAt)).limit(50);
  } catch (e) {
    console.error("DB connection missing for admin movies.");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Film className="w-8 h-8 text-primary" /> Movies
          </h2>
          <p className="text-base text-muted mt-2">Manage your cinematic catalog and metadata.</p>
        </div>
        <Link href="/admin/movies/new">
          <Button className="gap-2 rounded-full shadow-lg font-semibold px-6">
            <Plus className="w-4 h-4" /> Add Movie
          </Button>
        </Link>
      </div>

      <div className="bg-surface-elevated/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/10">
              <tr>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Release Date</th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Added</th>
                <th className="px-6 py-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allMovies.length > 0 ? (
                allMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-background border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                          <PlayCircle className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-base tracking-tight">{movie.title}</div>
                          <div className="text-xs text-muted mt-1 uppercase tracking-wider">{movie.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                        movie.publicationStatus === 'published' 
                          ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                          : 'bg-white/5 text-muted-foreground border-white/10'
                      }`}>
                        {movie.publicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {new Date(movie.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/movies/${movie.id}`}>
                          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted hover:text-foreground hover:bg-white/10 transition-colors">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-muted hover:text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Film className="w-10 h-10 text-muted/30" />
                      <p className="text-sm font-medium">No movies found. Start by adding one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
