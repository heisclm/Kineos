"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMovie, deleteSeries } from "@/features/admin/admin.actions";
import { toast } from "sonner";

interface AdminDeleteRowButtonProps {
  id: string;
  title: string;
  type: "movie" | "series";
}

export function AdminDeleteRowButton({ id, title, type }: AdminDeleteRowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = type === "movie" ? await deleteMovie(id) : await deleteSeries(id);
        if (res.success) {
          toast.success(`"${title}" deleted successfully`);
          router.refresh();
        } else {
          toast.error(res.error || `Failed to delete ${type}`);
        }
      } catch (err: any) {
        toast.error(err.message || "An unexpected error occurred");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      title={`Delete ${title}`}
      className="w-9 h-9 rounded-full text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-destructive" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
