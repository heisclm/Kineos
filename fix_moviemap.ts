import fs from 'fs';

const target = 'src/features/content/content.service.ts';
let content = fs.readFileSync(target, 'utf8');

// The objects look like: description: row.description, releaseDate: row.releaseDate,
content = content.replace(
  /description: row\.description,/g,
  'description: row.description,\n            shortTeaser: row.shortTeaser,'
);

fs.writeFileSync(target, content);
console.log("Fixed content.service.ts movieMap");
