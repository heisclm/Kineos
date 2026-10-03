import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

// Update imports
content = content.replace(
  /import \{ getLatestMovies, getTrendingMovies, getTopRatedMovies \} from "@\/features\/content\/content\.service";/,
  'import { getLatestMovies, getTrendingMovies, getTopRatedMovies, getFeaturedMovies } from "@/features/content/content.service";'
);

// Update fetch logic
content = content.replace(
  /let latestMovies = await getLatestMovies\(18\);\n  let trendingMovies = await getTrendingMovies\(3\);\n  let topRatedMovies = await getTopRatedMovies\(5\);/,
  `let featuredMovies = await getFeaturedMovies(5);\n  let newReleases = await getLatestMovies(10);\n  let trendingMovies = await getTrendingMovies(3);\n  let topRatedMovies = await getTopRatedMovies(10);`
);

// Remove the slice for newReleases
content = content.replace(
  /\n  \/\/ Break into rows for elegant presentation\n  const newReleases = latestMovies\.slice\(0, 5\);\n/,
  '\n'
);

// Update HeroCarousel prop
content = content.replace(
  /<HeroCarousel movies=\{latestMovies\.slice\(0, 5\)\} \/>/,
  '<HeroCarousel movies={featuredMovies} />'
);

// Update StandardRows to have proper links. Let's redefine StandardRow to take a "link" prop.
content = content.replace(
  /function StandardRow\(\{ title, subtitle, movies \}: \{ title: string; subtitle\?: string; movies: any\[\] \}\) \{/,
  'function StandardRow({ title, subtitle, movies, link }: { title: string; subtitle?: string; movies: any[]; link: string }) {'
);

content = content.replace(
  /<button className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">\n          See All\n        <\/button>/,
  '<Link href={link} className="text-sm font-medium text-primary hover:text-primary-hover transition-apple">\n          See All\n        </Link>'
);

// Update calls to StandardRow
content = content.replace(
  /<StandardRow title="New Releases" movies=\{newReleases\} \/>/,
  '<StandardRow title="New Releases" movies={newReleases} link="/movies" />'
);

content = content.replace(
  /<StandardRow title="Top Rated" subtitle="Critically acclaimed masterworks" movies=\{topRatedMovies\} \/>/,
  '<StandardRow title="Top Rated" subtitle="Critically acclaimed masterworks" movies={topRatedMovies} link="/movies?sort=Rating" />'
);

fs.writeFileSync(target, content);
console.log('Updated homepage logic in page.tsx');
