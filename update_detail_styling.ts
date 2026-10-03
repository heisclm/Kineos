import fs from 'fs';

function updateDetailPage(target: string) {
  let content = fs.readFileSync(target, 'utf8');

  // 1. Banner height
  content = content.replace(
    /className="w-full h-\[65vh\] md:h-\[70vh\] min-h-\[550px\] md:min-h-\[600px\] relative flex flex-col justify-end"/,
    'className="w-full h-[50vh] md:h-[70vh] min-h-[450px] md:min-h-[600px] relative flex flex-col justify-end"'
  );

  // 2. Banner content padding (move it up)
  content = content.replace(
    /className="relative z-20 w-full max-w-\[1920px\] mx-auto px-4 md:px-10 pb-8 md:pb-12 flex gap-6 md:gap-10 items-end"/,
    'className="relative z-20 w-full max-w-[1920px] mx-auto px-4 md:px-10 pb-16 md:pb-12 flex gap-6 md:gap-10 items-end"'
  );

  // 3. Storyline Box & Justification
  content = content.replace(
    /className="p-6 rounded-2xl bg-surface border border-white\/5 shadow-sm text-muted-foreground leading-relaxed"/,
    'className="p-8 md:p-10 rounded-2xl md:rounded-3xl bg-surface/80 border border-white/5 shadow-md text-white/80 leading-relaxed text-justify"'
  );

  // 4. Top Cast Grid and Font Sizes
  content = content.replace(
    /<div className="flex flex-wrap gap-3">/g,
    '<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">'
  );

  // Make cast card robust and text smaller
  content = content.replace(
    /<div key=\{c\.name\} className="flex items-center gap-3 p-2 pr-6 rounded-full bg-surface border border-white\/5 shadow-sm hover:bg-surface-elevated transition-apple cursor-default">/g,
    '<div key={c.name} className="flex items-center gap-3 p-2 pr-4 md:pr-6 rounded-full bg-surface border border-white/5 shadow-sm hover:bg-surface-elevated transition-apple cursor-default overflow-hidden">'
  );

  // Cast card flex col truncate
  content = content.replace(
    /<div className="flex flex-col">/g,
    '<div className="flex flex-col min-w-0 flex-1">'
  );

  // Name font size and truncate
  content = content.replace(
    /<span className="text-sm font-semibold text-foreground">\{c\.name\}<\/span>/g,
    '<span className="text-[13px] md:text-sm font-semibold text-foreground truncate">{c.name}</span>'
  );

  // Role font size and truncate
  content = content.replace(
    /<span className="text-\[11px\] text-muted-foreground uppercase tracking-wider font-medium">\{c\.role \|\| 'Actor'\}<\/span>/g,
    '<span className="text-[9px] md:text-[11px] text-muted-foreground uppercase tracking-wider font-medium truncate">{c.role || \'Actor\'}</span>'
  );

  fs.writeFileSync(target, content);
  console.log("Updated detail page:", target);
}

updateDetailPage('src/app/(main)/movies/[slug]/page.tsx');
updateDetailPage('src/app/(main)/series/[slug]/page.tsx');
