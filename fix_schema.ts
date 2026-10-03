import fs from 'fs';

const target = 'src/lib/db/schema.ts';
let content = fs.readFileSync(target, 'utf8');

// First, fix the duplicate rating in movies
content = content.replace(
  'rating: varchar("rating", { length: 10 }), // e.g., PG-13, R\n      rating: varchar("rating", { length: 10 }), // e.g., PG-13, R',
  'rating: varchar("rating", { length: 10 }), // e.g., PG-13, R'
);

// Second, find the series table block and add rating
const seriesRegex = /(export const series = pgTable\(\s*"series",\s*\{[\s\S]*?)(language: varchar\("language", \{ length: 50 \}\),)/;
content = content.replace(seriesRegex, '$1$2\n      rating: varchar("rating", { length: 10 }),');

fs.writeFileSync(target, content);
console.log("Fixed schema");
