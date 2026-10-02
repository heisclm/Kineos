"use server";

import { db } from "@/lib/db";
import { watchlists, featuredContent } from "@/lib/db/schema";
import { 
  userRoles, roles, movies, series, mediaAssets, downloadSources, downloadHistory, streamingSources,
  genres, people, movieGenres, seriesGenres, movieCast, seriesCast,
  seasons, episodes
} from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadMedia } from "@/lib/supabase";

export async function verifyAdminAccess() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const userRole = await db
    .select({ roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, user.id))
    .limit(1);

  return userRole[0]?.roleName === "admin";
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function createMovie(formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;
  const runtime = parseInt(formData.get("runtime") as string) || null;
  const rating = formData.get("rating") as string;

  try {
    let posterUrl = "";
    const posterFile = formData.get("posterFile") as File | null;
    if (posterFile && posterFile.size > 0) {
      const ext = posterFile.name.split(".").pop();
      posterUrl = await uploadMedia(posterFile, `posters/movie_${slug}_${Date.now()}.${ext}`);
    }

    let backdropUrl = "";
    const backdropFile = formData.get("backdropFile") as File | null;
    if (backdropFile && backdropFile.size > 0) {
      const ext = backdropFile.name.split(".").pop();
      backdropUrl = await uploadMedia(backdropFile, `backdrops/movie_${slug}_${Date.now()}.${ext}`);
    }

    const newRow = await db.insert(movies).values({
      title,
      slug,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
      runtime,
      rating,
    }).returning({ id: movies.id });
    
    const id = newRow[0].id;

    if (posterUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'movie', contentId: id, type: 'poster', url: posterUrl, isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'movie', contentId: id, type: 'backdrop', url: backdropUrl, isPrimary: true,
      });
    }

    const genresStr = formData.get("genres") as string;
    if (genresStr) {
      const genreNames = genresStr.split(",").map(g => g.trim()).filter(Boolean);
      for (const gName of genreNames) {
        const gSlug = slugify(gName);
        let gRows = await db.select().from(genres).where(eq(genres.slug, gSlug));
        let gId = gRows[0]?.id;
        if (!gId) {
          const inserted = await db.insert(genres).values({ name: gName, slug: gSlug }).returning({ id: genres.id });
          gId = inserted[0].id;
        }
        await db.insert(movieGenres).values({ movieId: id, genreId: gId });
      }
    }

    const castStr = formData.get("cast") as string;
    if (castStr) {
      const castNames = castStr.split(",").map(c => c.trim()).filter(Boolean);
      let order = 0;
      for (const cName of castNames) {
        let pRows = await db.select().from(people).where(eq(people.name, cName));
        let pId = pRows[0]?.id;
        if (!pId) {
          const inserted = await db.insert(people).values({ name: cName }).returning({ id: people.id });
          pId = inserted[0].id;
        }
        await db.insert(movieCast).values({ movieId: id, personId: pId, roleName: "Actor", order: order++ });
      }
    }

    revalidatePath("/");
    revalidatePath("/movies");
    revalidatePath("/admin/movies");
    return { success: true, id };
  } catch (e: any) {
    console.error("Failed to create movie", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function createSeries(formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;

  try {
    let posterUrl = "";
    const posterFile = formData.get("posterFile") as File | null;
    if (posterFile && posterFile.size > 0) {
      const ext = posterFile.name.split(".").pop();
      posterUrl = await uploadMedia(posterFile, `posters/series_${slug}_${Date.now()}.${ext}`);
    }

    let backdropUrl = "";
    const backdropFile = formData.get("backdropFile") as File | null;
    if (backdropFile && backdropFile.size > 0) {
      const ext = backdropFile.name.split(".").pop();
      backdropUrl = await uploadMedia(backdropFile, `backdrops/series_${slug}_${Date.now()}.${ext}`);
    }

    const newRow = await db.insert(series).values({
      title,
      slug,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
    }).returning({ id: series.id });
    
    const id = newRow[0].id;

    if (posterUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'series', contentId: id, type: 'poster', url: posterUrl, isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.insert(mediaAssets).values({
        contentType: 'series', contentId: id, type: 'backdrop', url: backdropUrl, isPrimary: true,
      });
    }

    const genresStr = formData.get("genres") as string;
    if (genresStr) {
      const genreNames = genresStr.split(",").map(g => g.trim()).filter(Boolean);
      for (const gName of genreNames) {
        const gSlug = slugify(gName);
        let gRows = await db.select().from(genres).where(eq(genres.slug, gSlug));
        let gId = gRows[0]?.id;
        if (!gId) {
          const inserted = await db.insert(genres).values({ name: gName, slug: gSlug }).returning({ id: genres.id });
          gId = inserted[0].id;
        }
        await db.insert(seriesGenres).values({ seriesId: id, genreId: gId });
      }
    }

    const castStr = formData.get("cast") as string;
    if (castStr) {
      const castNames = castStr.split(",").map(c => c.trim()).filter(Boolean);
      let order = 0;
      for (const cName of castNames) {
        let pRows = await db.select().from(people).where(eq(people.name, cName));
        let pId = pRows[0]?.id;
        if (!pId) {
          const inserted = await db.insert(people).values({ name: cName }).returning({ id: people.id });
          pId = inserted[0].id;
        }
        await db.insert(seriesCast).values({ seriesId: id, personId: pId, roleName: "Actor", order: order++ });
      }
    }

    revalidatePath("/");
    revalidatePath("/series");
    revalidatePath("/admin/series");
    return { success: true, id };
  } catch (e: any) {
    console.error("Failed to create series", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function createSeason(seriesId: string, seasonNumber: number, title?: string) {
  try {
    await db.insert(seasons).values({
      seriesId,
      seasonNumber,
      title
    });
    revalidatePath('/admin/series/' + seriesId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function createEpisode(seasonId: string, episodeNumber: number, title: string, seriesId: string) {
  try {
    await db.insert(episodes).values({
      seasonId,
      episodeNumber,
      title,
      publicationStatus: 'published'
    });
    revalidatePath('/admin/series/' + seriesId);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function deleteMovie(id: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  
  try {
    // 1. Delete Download History
    const sources = await db.select({ id: downloadSources.id }).from(downloadSources).where(eq(downloadSources.contentId, id));
    for (const source of sources) {
      await db.delete(downloadHistory).where(eq(downloadHistory.downloadSourceId, source.id));
    }

    // 2. Delete Polymorphic Relations
    await db.delete(mediaAssets).where(eq(mediaAssets.contentId, id));
    await db.delete(downloadSources).where(eq(downloadSources.contentId, id));
    await db.delete(streamingSources).where(eq(streamingSources.contentId, id));
    await db.delete(watchlists).where(eq(watchlists.contentId, id));
    await db.delete(featuredContent).where(eq(featuredContent.contentId, id));

    // 3. Delete Direct Relations
    await db.delete(movieGenres).where(eq(movieGenres.movieId, id));
    await db.delete(movieCast).where(eq(movieCast.movieId, id));

    // 4. Finally Delete Movie
    await db.delete(movies).where(eq(movies.id, id));

    revalidatePath("/");
    revalidatePath("/movies");
    revalidatePath("/admin/movies");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to delete movie", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function deleteSeries(id: string) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");
  
  try {
    // 1. Delete Episodes deeply
    const seriesSeasons = await db.select().from(seasons).where(eq(seasons.seriesId, id));
    for (const season of seriesSeasons) {
      const seasonEpisodes = await db.select({ id: episodes.id }).from(episodes).where(eq(episodes.seasonId, season.id));
      for (const ep of seasonEpisodes) {
        // Deep Episode Assets
        await db.delete(mediaAssets).where(eq(mediaAssets.contentId, ep.id));
        await db.delete(streamingSources).where(eq(streamingSources.contentId, ep.id));
        
        // Deep Episode Downloads
        const epSources = await db.select({ id: downloadSources.id }).from(downloadSources).where(eq(downloadSources.contentId, ep.id));
        for (const source of epSources) {
          await db.delete(downloadHistory).where(eq(downloadHistory.downloadSourceId, source.id));
        }
        await db.delete(downloadSources).where(eq(downloadSources.contentId, ep.id));
      }
      // Delete episodes of season
      await db.delete(episodes).where(eq(episodes.seasonId, season.id));
    }
    // Delete seasons
    await db.delete(seasons).where(eq(seasons.seriesId, id));

    // 2. Delete Series Download History
    const sources = await db.select({ id: downloadSources.id }).from(downloadSources).where(eq(downloadSources.contentId, id));
    for (const source of sources) {
      await db.delete(downloadHistory).where(eq(downloadHistory.downloadSourceId, source.id));
    }

    // 3. Delete Series Polymorphic Relations
    await db.delete(mediaAssets).where(eq(mediaAssets.contentId, id));
    await db.delete(downloadSources).where(eq(downloadSources.contentId, id));
    await db.delete(streamingSources).where(eq(streamingSources.contentId, id));
    await db.delete(watchlists).where(eq(watchlists.contentId, id));
    await db.delete(featuredContent).where(eq(featuredContent.contentId, id));

    // 4. Delete Direct Relations
    await db.delete(seriesGenres).where(eq(seriesGenres.seriesId, id));
    await db.delete(seriesCast).where(eq(seriesCast.seriesId, id));
    
    // 5. Finally Delete Series
    await db.delete(series).where(eq(series.id, id));

    revalidatePath("/");
    revalidatePath("/series");
    revalidatePath("/admin/series");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to delete series", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function updateMovie(id: string, formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slugForm = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;
  const runtime = parseInt(formData.get("runtime") as string) || null;
  const rating = formData.get("rating") as string;

  try {
    let posterUrl = "";
    const posterFile = formData.get("posterFile") as File | null;
    if (posterFile && posterFile.size > 0) {
      const ext = posterFile.name.split(".").pop();
      posterUrl = await uploadMedia(posterFile, `posters/movie_${slugForm}_${Date.now()}.${ext}`);
    }

    let backdropUrl = "";
    const backdropFile = formData.get("backdropFile") as File | null;
    if (backdropFile && backdropFile.size > 0) {
      const ext = backdropFile.name.split(".").pop();
      backdropUrl = await uploadMedia(backdropFile, `backdrops/movie_${slugForm}_${Date.now()}.${ext}`);
    }

    await db.update(movies).set({
      title,
      slug: slugForm,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
      runtime,
      rating,
    }).where(eq(movies.id, id));

    if (posterUrl) {
      await db.delete(mediaAssets).where(and(eq(mediaAssets.contentId, id), eq(mediaAssets.type, 'poster')));
      await db.insert(mediaAssets).values({
        contentType: 'movie', contentId: id, type: 'poster', url: posterUrl, isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.delete(mediaAssets).where(and(eq(mediaAssets.contentId, id), eq(mediaAssets.type, 'backdrop')));
      await db.insert(mediaAssets).values({
        contentType: 'movie', contentId: id, type: 'backdrop', url: backdropUrl, isPrimary: true,
      });
    }

    const genresStr = formData.get("genres") as string;
    await db.delete(movieGenres).where(eq(movieGenres.movieId, id));
    if (genresStr) {
      const genreNames = genresStr.split(",").map(g => g.trim()).filter(Boolean);
      for (const gName of genreNames) {
        const gSlug = slugify(gName);
        let gRows = await db.select().from(genres).where(eq(genres.slug, gSlug));
        let gId = gRows[0]?.id;
        if (!gId) {
          const inserted = await db.insert(genres).values({ name: gName, slug: gSlug }).returning({ id: genres.id });
          gId = inserted[0].id;
        }
        await db.insert(movieGenres).values({ movieId: id, genreId: gId });
      }
    }

    const castStr = formData.get("cast") as string;
    await db.delete(movieCast).where(eq(movieCast.movieId, id));
    if (castStr) {
      const castNames = castStr.split(",").map(c => c.trim()).filter(Boolean);
      let order = 0;
      for (const cName of castNames) {
        let pRows = await db.select().from(people).where(eq(people.name, cName));
        let pId = pRows[0]?.id;
        if (!pId) {
          const inserted = await db.insert(people).values({ name: cName }).returning({ id: people.id });
          pId = inserted[0].id;
        }
        await db.insert(movieCast).values({ movieId: id, personId: pId, roleName: "Actor", order: order++ });
      }
    }

    revalidatePath("/");
    revalidatePath("/movies");
    revalidatePath("/admin/movies");
    revalidatePath(`/admin/movies/${id}`);
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update movie", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}

export async function updateSeries(id: string, formData: FormData) {
  const isAdmin = await verifyAdminAccess();
  if (!isAdmin) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const slugForm = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as "draft" | "published" | "archived";
  const releaseDate = formData.get("releaseDate") as string;

  try {
    let posterUrl = "";
    const posterFile = formData.get("posterFile") as File | null;
    if (posterFile && posterFile.size > 0) {
      const ext = posterFile.name.split(".").pop();
      posterUrl = await uploadMedia(posterFile, `posters/series_${slugForm}_${Date.now()}.${ext}`);
    }

    let backdropUrl = "";
    const backdropFile = formData.get("backdropFile") as File | null;
    if (backdropFile && backdropFile.size > 0) {
      const ext = backdropFile.name.split(".").pop();
      backdropUrl = await uploadMedia(backdropFile, `backdrops/series_${slugForm}_${Date.now()}.${ext}`);
    }

    await db.update(series).set({
      title,
      slug: slugForm,
      description,
      publicationStatus: status,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : null,
    }).where(eq(series.id, id));

    if (posterUrl) {
      await db.delete(mediaAssets).where(and(eq(mediaAssets.contentId, id), eq(mediaAssets.type, 'poster')));
      await db.insert(mediaAssets).values({
        contentType: 'series', contentId: id, type: 'poster', url: posterUrl, isPrimary: true,
      });
    }
    if (backdropUrl) {
      await db.delete(mediaAssets).where(and(eq(mediaAssets.contentId, id), eq(mediaAssets.type, 'backdrop')));
      await db.insert(mediaAssets).values({
        contentType: 'series', contentId: id, type: 'backdrop', url: backdropUrl, isPrimary: true,
      });
    }

    const genresStr = formData.get("genres") as string;
    await db.delete(seriesGenres).where(eq(seriesGenres.seriesId, id));
    if (genresStr) {
      const genreNames = genresStr.split(",").map(g => g.trim()).filter(Boolean);
      for (const gName of genreNames) {
        const gSlug = slugify(gName);
        let gRows = await db.select().from(genres).where(eq(genres.slug, gSlug));
        let gId = gRows[0]?.id;
        if (!gId) {
          const inserted = await db.insert(genres).values({ name: gName, slug: gSlug }).returning({ id: genres.id });
          gId = inserted[0].id;
        }
        await db.insert(seriesGenres).values({ seriesId: id, genreId: gId });
      }
    }

    const castStr = formData.get("cast") as string;
    await db.delete(seriesCast).where(eq(seriesCast.seriesId, id));
    if (castStr) {
      const castNames = castStr.split(",").map(c => c.trim()).filter(Boolean);
      let order = 0;
      for (const cName of castNames) {
        let pRows = await db.select().from(people).where(eq(people.name, cName));
        let pId = pRows[0]?.id;
        if (!pId) {
          const inserted = await db.insert(people).values({ name: cName }).returning({ id: people.id });
          pId = inserted[0].id;
        }
        await db.insert(seriesCast).values({ seriesId: id, personId: pId, roleName: "Actor", order: order++ });
      }
    }

    revalidatePath("/");
    revalidatePath("/series");
    revalidatePath("/admin/series");
    revalidatePath(`/admin/series/${id}`);
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update series", e);
    return { success: false, error: e.message + " " + JSON.stringify(e) };
  }
}


