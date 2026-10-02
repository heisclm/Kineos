import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Tv, Download, Users, ArrowRight, PlayCircle, Plus, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { movies, series, downloadSources, profiles } from "@/lib/db/schema";
import { desc, count, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  // Fetch real latest content
  const recentMovies = await db.select().from(movies).orderBy(desc(movies.createdAt)).limit(3);
  const recentSeries = await db.select().from(series).orderBy(desc(series.createdAt)).limit(3);

  // Fetch real counts from the database
  const totalMovies = await db.select({ value: count() }).from(movies);
  const totalSeries = await db.select({ value: count() }).from(series);
  const totalDownloads = await db.select({ value: count() }).from(downloadSources).where(eq(downloadSources.uploadStatus, 'READY'));
  const totalUsers = await db.select({ value: count() }).from(profiles).catch(() => [{ value: 1 }]);

  const stats = [
    { name: "Total Movies", value: totalMovies[0]?.value || 0, icon: Film, change: "Live from database" },
    { name: "TV Series", value: totalSeries[0]?.value || 0, icon: Tv, change: "Live from database" },
    { name: "Content Sources", value: totalDownloads[0]?.value || 0, icon: Download, change: "Active download links" },
    { name: "Active Users", value: totalUsers[0]?.value || 1, icon: Users, change: "Registered users" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" /> Dashboard
          </h2>
          <p className="text-base text-muted mt-2">Here is a quick overview of your content and system metrics.</p>
        </div>
        <div className="flex gap-3 hidden sm:flex">
          <Link href="/admin/movies/new">
            <Button className="rounded-full shadow-lg font-semibold px-6 gap-2">
              <Plus className="w-4 h-4" /> Add Movie
            </Button>
          </Link>
          <Link href="/admin/series/new">
            <Button variant="ghost" className="rounded-full shadow-lg font-semibold px-6 gap-2 bg-white/5 hover:bg-white/10">
              <Plus className="w-4 h-4" /> Add Series
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="bg-surface-elevated/50 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.name}
                </CardTitle>
                <div className="p-2 rounded-full bg-background border border-white/5">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2.5} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-4xl font-black text-foreground tracking-tight">{stat.value}</div>
                <p className="text-xs font-medium text-muted-foreground mt-2">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        {/* Recent Movies */}
        <div className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
           <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
             <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
               <Film className="w-5 h-5 text-primary" /> Recently Added Movies
             </h3>
             <Link href="/admin/movies" className="text-sm text-primary font-semibold hover:underline">View All</Link>
           </div>
           <div className="divide-y divide-white/5">
             {recentMovies.length === 0 ? (
               <div className="p-8 text-center text-muted text-sm">No movies added yet.</div>
             ) : (
               recentMovies.map(movie => (
                 <Link href={`/admin/movies/${movie.id}`} key={movie.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-background border border-white/5 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{movie.title}</h4>
                        <p className="text-xs text-muted mt-1 uppercase tracking-wide">{movie.publicationStatus} • {movie.rating || "UNRATED"}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                 </Link>
               ))
             )}
           </div>
        </div>

        {/* Recent Series */}
        <div className="bg-surface-elevated/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
           <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
             <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
               <Tv className="w-5 h-5 text-primary" /> Recently Added Series
             </h3>
             <Link href="/admin/series" className="text-sm text-primary font-semibold hover:underline">View All</Link>
           </div>
           <div className="divide-y divide-white/5">
             {recentSeries.length === 0 ? (
               <div className="p-8 text-center text-muted text-sm">No series added yet.</div>
             ) : (
               recentSeries.map(show => (
                 <Link href={`/admin/series/${show.id}`} key={show.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-background border border-white/5 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{show.title}</h4>
                        <p className="text-xs text-muted mt-1 uppercase tracking-wide">{show.publicationStatus}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                 </Link>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
