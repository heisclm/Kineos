import fs from 'fs';

const target = 'src/app/(main)/movies/[slug]/page.tsx';
let content = fs.readFileSync(target, 'utf8');

const metadataRegex = /export async function generateMetadata\([\s\S]*?return \{[\s\S]*?openGraph: \{[\s\S]*?\},[\s\S]*?\};\n\}/;
const newMetadata = `export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let movie = await getMovieBySlug(params.slug);
  
  if (!movie) {
    return { title: 'Movie Not Found | Kineos' };
  }

  const poster = (movie as any).imageUrl || null;
  const backdrop = (movie as any).backdropUrl || poster;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const url = \`\${siteUrl}/movies/\${movie.slug}\`;

  return {
    title: \`\${movie.seoTitle || movie.title} | Kineos\`,
    description: movie.seoDescription || movie.shortTeaser || movie.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: movie.seoTitle || movie.title,
      description: movie.seoDescription || movie.shortTeaser || movie.description || undefined,
      url: url,
      type: "video.movie",
      images: backdrop ? [
        {
          url: backdrop,
          width: 1200,
          height: 630,
          alt: movie.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.seoTitle || movie.title,
      description: movie.seoDescription || movie.shortTeaser || movie.description || undefined,
      images: backdrop ? [backdrop] : [],
    }
  };
}`;

content = content.replace(metadataRegex, newMetadata);

const jsonLdRegex = /const jsonLd = \{[\s\S]*?url: \`https:\/\/kineos\.com\/movies\/\$\{movie\.slug\}\`,[\s\S]*?\};/;
const newJsonLd = `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const backdrop = (movie as any).backdropUrl || (movie as any).imageUrl || null;
  const poster = (movie as any).imageUrl || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.description,
    dateCreated: movie.releaseDate,
    image: poster || backdrop || undefined,
    url: \`\${siteUrl}/movies/\${movie.slug}\`,
    director: cast.filter(c => c.role === 'director').map(c => ({
      "@type": "Person",
      name: c.person.name
    })),
    actor: cast.filter(c => c.role === 'actor').map(c => ({
      "@type": "Person",
      name: c.person.name
    })),
    aggregateRating: movie.ratingScore ? {
      "@type": "AggregateRating",
      ratingValue: movie.ratingScore / 10,
      bestRating: "10",
      ratingCount: movie.viewCount || 100
    } : undefined
  };`;

content = content.replace(jsonLdRegex, newJsonLd);

fs.writeFileSync(target, content);
console.log("Updated movies/[slug]/page.tsx SEO");
