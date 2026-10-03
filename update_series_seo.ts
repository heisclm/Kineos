import fs from 'fs';

const target = 'src/app/(main)/series/[slug]/page.tsx';
let content = fs.readFileSync(target, 'utf8');

const metadataRegex = /export async function generateMetadata\([\s\S]*?return \{[\s\S]*?openGraph: \{[\s\S]*?\},[\s\S]*?\};\n\}/;
const newMetadata = `export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const series = await getSeriesBySlug(params.slug);
  
  if (!series) {
    return { title: 'Series Not Found | Kineos' };
  }

  const poster = (series as any).imageUrl || null;
  const backdrop = (series as any).backdropUrl || poster;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const url = \`\${siteUrl}/series/\${series.slug}\`;

  return {
    title: \`\${(series as any).seoTitle || series.title} | Kineos\`,
    description: (series as any).seoDescription || series.shortTeaser || series.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: (series as any).seoTitle || series.title,
      description: (series as any).seoDescription || series.shortTeaser || series.description || undefined,
      url: url,
      type: "video.tv_show",
      images: backdrop ? [
        {
          url: backdrop,
          width: 1200,
          height: 630,
          alt: series.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: (series as any).seoTitle || series.title,
      description: (series as any).seoDescription || series.shortTeaser || series.description || undefined,
      images: backdrop ? [backdrop] : [],
    }
  };
}`;

content = content.replace(metadataRegex, newMetadata);

// Add jsonLd to the component
const componentStartRegex = /(export default async function SeriesDetailPage[\s\S]*?const relatedSeries = await getRelatedSeries\(series\.id, 5\)\.catch\(\(\) => \[\]\);)/;
const jsonLdAdd = `
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com';
  const backdrop = (series as any).backdropUrl || (series as any).imageUrl || null;
  const poster = (series as any).imageUrl || null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: series.title,
    description: series.description,
    dateCreated: series.releaseDate,
    image: poster || backdrop || undefined,
    url: \`\${siteUrl}/series/\${series.slug}\`,
    numberOfSeasons: seasonsWithEpisodes.length,
    actor: cast.filter(c => c.role === 'actor').map(c => ({
      "@type": "Person",
      name: c.person.name
    }))
  };`;

content = content.replace(componentStartRegex, `$1\n${jsonLdAdd}`);

// Add script tag to return statement
const returnRegex = /(return \(\n\s*<div)/;
content = content.replace(returnRegex, `return (\n    <>\n      <script\n        type="application/ld+json"\n        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}\n      />\n      <div`);
const returnEndRegex = /(<\/div>\n\s*\);\n\})/;
content = content.replace(returnEndRegex, `</div>\n    </>\n  );\n}`);

fs.writeFileSync(target, content);
console.log("Updated series/[slug]/page.tsx SEO");
