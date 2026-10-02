import { cn } from "@/lib/utils";

export function KineosLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 110 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("h-7 w-auto text-foreground", className)}
    >
      {/* Icon: Apple TV-like minimal "Screen" with transparent Play cutout (evenodd path prevents ID collision bugs) */}
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M6 4C2.68629 4 0 6.68629 0 10V22C0 25.3137 2.68629 28 6 28H18C21.3137 28 24 25.3137 24 22V10C24 6.68629 21.3137 4 18 4H6ZM9.5 11.5V20.5L16.5 16L9.5 11.5Z" 
        fill="currentColor" 
      />
      
      {/* KINEOS Text: High-end typographic mark */}
      <text 
        x="32" 
        y="23" 
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight="800" 
        fontSize="18" 
        fill="currentColor" 
        letterSpacing="0.08em"
      >
        KINEOS
      </text>
    </svg>
  );
}
