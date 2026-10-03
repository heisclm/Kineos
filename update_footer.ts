import fs from 'fs';

const target = 'src/app/(main)/layout.tsx';
let content = fs.readFileSync(target, 'utf8');

// We want to add the legal links to the footer.
// Current footer:
/*
      <footer className="w-full border-t border-white/5 py-12 px-6 md:px-10 mt-auto bg-background/50">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8 text-sm font-medium text-muted">
            <div className="relative">
              <KineosLogo className="h-5 text-muted-foreground hover:text-foreground transition-apple grayscale hover:grayscale-0" />
              <SecretAdminTrigger />
            </div>
            <a href="/movies" className="hover:text-foreground transition-apple">Movies</a>
            <a href="/series" className="hover:text-foreground transition-apple">TV Series</a>
          </div>
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Kineos Entertainment. All rights reserved.
          </div>
        </div>
      </footer>
*/

const newFooter = `      <footer className="w-full border-t border-white/5 py-12 px-6 md:px-10 mt-auto bg-background/50">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 text-sm font-medium text-muted">
            <div className="relative flex items-center mb-4 md:mb-0">
              <KineosLogo className="h-6 text-muted-foreground hover:text-foreground transition-apple grayscale hover:grayscale-0" />
              <SecretAdminTrigger />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="/movies" className="hover:text-foreground transition-apple">Movies</a>
              <a href="/series" className="hover:text-foreground transition-apple">TV Series</a>
              <a href="/contact" className="hover:text-foreground transition-apple">Contact Us</a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="/privacy" className="hover:text-foreground transition-apple">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-apple">Terms of Service</a>
              <a href="/dmca" className="hover:text-foreground transition-apple">DMCA</a>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground/60 text-center md:text-right mt-4 md:mt-0 max-w-xs">
            <p className="mb-2">Kineos acts as a search engine and indexer. We do not host any files on our servers.</p>
            <p>&copy; {new Date().getFullYear()} Kineos Entertainment. All rights reserved.</p>
          </div>
        </div>
      </footer>`;

content = content.replace(/<footer className="w-full border-t border-white\/5 py-12 px-6 md:px-10 mt-auto bg-background\/50">[\s\S]*?<\/footer>/, newFooter);

fs.writeFileSync(target, content);
console.log('Updated footer in layout.tsx');
