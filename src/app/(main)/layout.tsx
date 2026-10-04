import { Header } from "@/components/layout/header";
import { KineosLogo } from "@/components/ui/logo";
import { SecretAdminTrigger } from "@/components/admin/SecretAdminTrigger";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="flex flex-col min-h-screen relative bg-background">
      {/* Subtle cinematic blur background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <Header />
      <main className="flex-1 z-0">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-white/5 pt-16 pb-8 px-6 md:px-10 mt-auto bg-background/50 relative z-20">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 mb-16">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left space-y-5">
              <div className="relative inline-flex items-center">
                <KineosLogo className="h-6 md:h-7 text-foreground transition-apple" />
                <SecretAdminTrigger />
              </div>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                Your destination for trending movies and TV series. Kineos acts as a search engine and indexer. We do not host any files on our servers.
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8 w-full">
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
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
            <p>&copy; {new Date().getFullYear()} Kineos Entertainment. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white transition-colors cursor-pointer">Twitter</span>
              <span className="hover:text-white transition-colors cursor-pointer">Discord</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

