import fs from 'fs';

const target = 'src/app/(main)/layout.tsx';
let content = fs.readFileSync(target, 'utf8');

const oldSection = `            {/* Links Group 1 */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="text-foreground font-semibold tracking-wide uppercase text-xs mb-1">Explore</h4>
              <a href="/movies" className="text-sm text-muted-foreground hover:text-white transition-apple">Movies</a>
              <a href="/series" className="text-sm text-muted-foreground hover:text-white transition-apple">TV Series</a>
              <a href="/search" className="text-sm text-muted-foreground hover:text-white transition-apple">Search Content</a>
            </div>

            {/* Links Group 2 */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <h4 className="text-foreground font-semibold tracking-wide uppercase text-xs mb-1">Legal & Support</h4>
              <a href="/contact" className="text-sm text-muted-foreground hover:text-white transition-apple">Contact Us</a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-white transition-apple">Privacy Policy</a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-white transition-apple">Terms of Service</a>
              <a href="/dmca" className="text-sm text-muted-foreground hover:text-white transition-apple">DMCA Notice</a>
            </div>`;

const newSection = `            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8 w-full">
              {/* Links Group 1 */}
              <div className="flex flex-col items-start gap-4">
                <h4 className="text-foreground font-semibold tracking-wide uppercase text-xs mb-1">Explore</h4>
                <a href="/movies" className="text-sm text-muted-foreground hover:text-white transition-apple">Movies</a>
                <a href="/series" className="text-sm text-muted-foreground hover:text-white transition-apple">TV Series</a>
                <a href="/search" className="text-sm text-muted-foreground hover:text-white transition-apple">Search Content</a>
              </div>

              {/* Links Group 2 */}
              <div className="flex flex-col items-start gap-4">
                <h4 className="text-foreground font-semibold tracking-wide uppercase text-xs mb-1">Legal & Support</h4>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-white transition-apple">Contact Us</a>
                <a href="/privacy" className="text-sm text-muted-foreground hover:text-white transition-apple">Privacy Policy</a>
                <a href="/terms" className="text-sm text-muted-foreground hover:text-white transition-apple">Terms of Service</a>
                <a href="/dmca" className="text-sm text-muted-foreground hover:text-white transition-apple">DMCA Notice</a>
              </div>
            </div>`;

content = content.replace(oldSection, newSection);
fs.writeFileSync(target, content);
console.log('Fixed footer layout for mobile');
