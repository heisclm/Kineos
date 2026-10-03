"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  className?: string;
  format?: "banner" | "rectangle" | "leaderboard";
  slotId?: string;
}

export function AdSlot({ className, format = "banner", slotId }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Prevent double-push in React Strict Mode
    if (isLoaded.current) return;
    
    // Check if AdSense has already processed this slot
    if (adRef.current && !adRef.current.getAttribute("data-adsbygoogle-status")) {
      isLoaded.current = true;
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [slotId]);

  return (
    <div 
      className={cn(
        "relative w-full flex flex-col items-center justify-center overflow-hidden bg-transparent rounded-xl transition-apple",
        format === "banner" && "min-h-[120px]",
        format === "leaderboard" && "min-h-[90px] max-w-[728px] mx-auto",
        format === "rectangle" && "min-h-[250px] max-w-[300px] mx-auto",
        className
      )}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-5052901241882602" // Replace with real Publisher ID
        data-ad-slot={slotId || "1234567890"} // Replace with real Slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
