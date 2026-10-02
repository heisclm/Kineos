"use client";

import { cn } from "@/lib/utils";

interface AdSpaceProps {
  className?: string;
  type?: "leaderboard" | "rectangle" | "banner";
}

export function AdSpace({ className, type = "leaderboard" }: AdSpaceProps) {
  // We don't render any text if there's no actual ad script loaded.
  // Just a very subtle transparent placeholder box to hold the layout space.
  
  const typeClasses = {
    leaderboard: "w-full max-w-[728px] h-[90px] mx-auto",
    rectangle: "w-full max-w-[300px] h-[250px] mx-auto",
    banner: "w-full h-[100px]"
  };

  return (
    <div 
      className={cn(
        "bg-white/[0.02] border border-white/[0.02] rounded-xl flex items-center justify-center overflow-hidden",
        typeClasses[type],
        className
      )}
      aria-label="Advertisement Space"
    >
      {/* 
        Leave this empty until a real Ad Network (like Google AdSense) script is injected.
        The user requested no text to be shown if the ad isn't actually there.
      */}
    </div>
  );
}
