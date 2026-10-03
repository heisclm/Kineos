import fs from 'fs';

const files = [
  'src/app/(main)/movies/[slug]/page.tsx',
  'src/app/(main)/series/[slug]/page.tsx'
];

for (const target of files) {
  let content = fs.readFileSync(target, 'utf8');

  // Fix poster sizing
  content = content.replace(
    /hidden md:block w-40 md:w-64 aspect-\[2\/3\] shrink-0 rounded-xl overflow-hidden shadow-\[0_20px_50px_rgba\(0,0,0,0\.5\)\] border border-white\/10 relative z-30 transform translate-y-12 md:translate-y-24/g,
    'hidden md:block w-40 md:w-48 lg:w-64 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-30 transform translate-y-12 md:translate-y-16 lg:translate-y-24'
  );

  fs.writeFileSync(target, content);
  console.log('Fixed poster sizing on', target);
}
