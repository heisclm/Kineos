import { verifyAdminAccess } from "@/features/admin/admin.actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/admin-login");
  }

  const isAdmin = await verifyAdminAccess();
  
  if (!isAdmin && process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background overflow-hidden relative z-50 font-sans">
      {/* Background cinematic blur */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation (Handles Desktop & Mobile) */}
      <AdminNavigation />
      
      {/* Content Area */}
      <div className="flex-1 flex flex-col h-full bg-transparent overflow-y-auto">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-[88px] px-10 items-center justify-between bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 transition-apple">
           <h1 className="text-xl font-bold tracking-tight text-foreground/90">Kineos Command Center</h1>
           <div className="flex items-center gap-4">
             <div className="h-9 w-9 rounded-full bg-surface-elevated flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>
           </div>
        </header>
        
        <main className="p-6 lg:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
