"use client";
import { toast } from "sonner";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMovie, deleteSeries } from "@/features/admin/admin.actions";

export function DeleteContentButton({ id, type }: { id: string, type: "movie" | "series" }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    startTransition(async () => {
      let result;
      if (type === "movie") {
        result = await deleteMovie(id);
      } else {
        result = await deleteSeries(id);
      }

      if (result.success) {
        window.location.href = `/admin/${type === "movie" ? "movies" : "series"}`;
      } else {
        toast.error(result.error || "Failed to delete");
      }
    });
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDelete} 
      disabled={isPending} 
      className="gap-2 rounded-full px-6 shadow-lg shadow-red-500/20 font-semibold w-full sm:w-auto transition-all relative overflow-hidden"
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> 
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="w-4 h-4" /> 
          Delete {type === "movie" ? "Movie" : "Series"}
        </>
      )}
    </Button>
  );
}
