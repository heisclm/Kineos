import fs from 'fs';

const target = 'src/components/movie/MovieCard.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(
  'interface MovieCardProps {',
  'interface MovieCardProps {\n  shortTeaser?: string | null;'
);

content = content.replace(
  'export function MovieCard({ title, slug, description, imageUrl, primaryGenre, type = "movie" }: MovieCardProps) {',
  'export function MovieCard({ title, slug, description, shortTeaser, imageUrl, primaryGenre, type = "movie" }: MovieCardProps) {'
);

content = content.replace(
  '<Link href={`/movies/${slug}`} className="group',
  '<Link href={type === "series" ? `/series/${slug}` : `/movies/${slug}`} className="group'
);

content = content.replace(
  '{description}',
  '{shortTeaser || description}'
);

fs.writeFileSync(target, content);
console.log("Updated MovieCard.tsx");
