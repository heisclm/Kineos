import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { KineosLogo } from "@/components/ui/logo";

export const metadata = {
  title: "Secure Admin Login | Kineos",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Cinematic Blur Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      <div className="w-full max-w-[420px] p-8 rounded-2xl bg-surface-elevated/80 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          <KineosLogo className="h-8 mb-6 text-foreground" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted mt-2">Enter your credentials to securely manage Kineos.</p>
        </div>
        
        <AdminLoginForm />
      </div>
    </div>
  );
}
