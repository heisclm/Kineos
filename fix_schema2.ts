import fs from 'fs';

const target = 'src/lib/db/schema.ts';
const lines = fs.readFileSync(target, 'utf8').split('\n');

const newLines = [];
let ratingCount = 0;
let inMovies = true;

for (const line of lines) {
  if (line.includes('export const series')) {
    inMovies = false;
  }
  
  if (inMovies && line.includes('rating: varchar("rating", { length: 10 })')) {
    ratingCount++;
    if (ratingCount > 1) {
      continue; // Skip duplicate
    }
  }
  newLines.push(line);
}

fs.writeFileSync(target, newLines.join('\n'));
console.log("Cleaned up schema duplicates");
