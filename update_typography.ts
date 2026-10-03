import fs from 'fs';
import path from 'path';

// Fix detail pages Storyline
function fixStoryline(routePath: string) {
  const fullPath = path.join(process.cwd(), routePath);
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace the storyline div
  // The current one is: className="p-8 md:p-10 rounded-2xl md:rounded-3xl bg-surface/80 border border-white/5 shadow-md text-white/80 leading-relaxed text-justify"
  content = content.replace(
    /className="p-8 md:p-10 rounded-2xl md:rounded-3xl bg-surface\/80 border border-white\/5 shadow-md text-white\/80 leading-relaxed text-justify"/,
    'className="p-6 md:p-10 rounded-2xl md:rounded-3xl bg-surface/40 backdrop-blur-sm border border-white/5 shadow-inner text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty"'
  );

  fs.writeFileSync(fullPath, content);
  console.log('Fixed Storyline in', routePath);
}

fixStoryline('src/app/(main)/movies/[slug]/page.tsx');
fixStoryline('src/app/(main)/series/[slug]/page.tsx');

// Fix Legal pages
function fixLegal(routePath: string) {
  const fullPath = path.join(process.cwd(), 'src/app/(main)', routePath, 'page.tsx');
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace the container div
  // Currently: className="space-y-8 text-white/80 leading-relaxed text-justify"
  content = content.replace(
    /className="space-y-8 text-white\/80 leading-relaxed text-justify"/g,
    'className="space-y-10 text-white/70 text-base md:text-lg leading-relaxed md:leading-[1.8] font-medium text-left text-pretty"'
  );

  // Fix headings to be slightly brighter for contrast
  content = content.replace(
    /className="text-xl font-semibold text-foreground"/g,
    'className="text-xl md:text-2xl font-bold tracking-tight text-white/90 mb-3"'
  );

  fs.writeFileSync(fullPath, content);
  console.log('Fixed Legal Page:', routePath);
}

fixLegal('privacy');
fixLegal('terms');
fixLegal('dmca');
