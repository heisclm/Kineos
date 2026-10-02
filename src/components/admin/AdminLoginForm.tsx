"use client";

import { useState, useTransition } from "react";
import { loginAdmin } from "@/features/admin/auth.actions";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="email" 
              name="email"
              required
              disabled={isPending}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-apple disabled:opacity-50"
              placeholder="admin@kineos.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="password" 
              name="password"
              required
              disabled={isPending}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-apple disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full h-11 text-base font-semibold">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating...
          </>
        ) : (
          "Secure Login"
        )}
      </Button>
    </form>
  );
}
