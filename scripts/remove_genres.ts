import fs from 'fs';

let page = fs.readFileSync('src/app/(main)/page.tsx', 'utf8');

const genreSection = `      {/* Elegant Genre Navigation */}
      <section className="px-6 md:px-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {genres.map((g, i) => (
            <button
              key={g}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-apple whitespace-nowrap border",
                i === 0 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-surface-elevated text-muted hover:text-foreground border-white/5 hover:bg-surface-hover"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </section>`;

page = page.replace(genreSection, '');
fs.writeFileSync('src/app/(main)/page.tsx', page);
