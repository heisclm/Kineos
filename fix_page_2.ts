import fs from 'fs';

const target = 'src/app/(main)/page.tsx';
let content = fs.readFileSync(target, 'utf8');

content = content.replace(
  /const newReleases = latestMovies\.slice\(0, 5\);/,
  ''
);

fs.writeFileSync(target, content);
console.log('Removed duplicate newReleases definition.');
