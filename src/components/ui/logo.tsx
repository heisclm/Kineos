import { cn } from "@/lib/utils";

export function KineosLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 120 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("h-7 w-auto text-foreground", className)}
    >
      {/* Left Stem of the K */}
      <rect x="0" y="4" width="6" height="24" rx="2" fill="currentColor" />
      
      {/* Play Button forming the right side of the K */}
      <polygon 
        points="13,6.5 25,16 13,25.5" 
        fill="hsl(var(--primary))" 
        stroke="hsl(var(--primary))" 
        strokeWidth="3" 
        strokeLinejoin="round" 
      />
      
      {/* KINEOS Text: High-end typographic mark */}
      <text 
        x="36" 
        y="23" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight="800" 
        fontSize="19" 
        fill="currentColor" 
        letterSpacing="0.1em"
      >
        KINEOS
      </text>
    </svg>
  );
}
