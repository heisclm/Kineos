import { cn } from "@/lib/utils";

interface AdSlotProps {
  className?: string;
  format?: "banner" | "rectangle" | "leaderboard";
  slotId?: string; // For actual ad network integration later
}

export function AdSlot({ className, format = "banner", slotId }: AdSlotProps) {
  return (
    <div 
      className={cn(
        "relative w-full flex flex-col items-center justify-center overflow-hidden bg-white/[0.02] border border-white/[0.02] rounded-2xl p-4 transition-apple",
        format === "banner" && "min-h-[120px]",
        format === "leaderboard" && "min-h-[90px] max-w-[728px] mx-auto",
        format === "rectangle" && "min-h-[250px] max-w-[300px] mx-auto",
        className
      )}
    >
      {/* 
        Leave this empty until a real Ad Network script is injected.
        The user requested no text to be shown if the ad isn't actually there.
      */}
    </div>
  );
}
