import { Header } from "@/components/layout/header";
import { KineosLogo } from "@/components/ui/logo";
import { SecretAdminTrigger } from "@/components/admin/SecretAdminTrigger";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative bg-background">
      {/* Subtle cinematic blur background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <Header />
      <main className="flex-1 z-0">
        {children}
      </main>
      
      {/* Premium Footer */}
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
    </div>
  );
}
