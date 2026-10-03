import fs from 'fs';

const files = [
  'src/app/(main)/movies/[slug]/page.tsx',
  'src/app/(main)/movies/page.tsx',
  'src/app/(main)/page.tsx',
  'src/app/(main)/series/[slug]/page.tsx',
  'src/app/(main)/series/page.tsx',
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove import
  content = content.replace(/import\s+\{?\s*AdSlot\s*\}?\s+from\s+["']@\/components\/ui\/AdSlot["'];\r?\n?/g, '');
  
  // Remove usages
  // 1. In div with specific wrapper
  content = content.replace(/\{\/\*\s*Top Leaderboard Ad\s*\*\/\}\s*<div[^>]*>\s*<AdSlot[^>]*\/>\s*<\/div>/g, '');
  content = content.replace(/\{\/\*\s*Top Leaderboard Ad\s*\*\/\}\s*<div[^>]*>\s*<AdSlot[^>]*\/>\s*<\/div>/g, '');
  
  // 2. Just the AdSlot itself
  content = content.replace(/<AdSlot[^>]*\/>/g, '');
  
  // 3. Remove wrapper divs that just contained AdSlot
  content = content.replace(/<div className="w-full flex justify-center py-4 px-6 md:px-10 max-w-\[1920px\] mx-auto relative z-20">\s*<\/div>/g, '');
  content = content.replace(/<div className="px-6 md:px-10 py-4">\s*<\/div>/g, '');
  content = content.replace(/<div className="w-full overflow-hidden flex justify-center py-4">\s*<\/div>/g, '');
  
  // Remove lingering comments
  content = content.replace(/\{\/\*\s*Top Leaderboard Ad\s*\*\/\}/g, '');
  
  fs.writeFileSync(file, content);
}
console.log("Cleaned up AdSlots");
