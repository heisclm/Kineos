import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  primaryGenre: string;
}

export function MovieCard({ title, slug, description, imageUrl, primaryGenre }: MovieCardProps) {
  return (
    <Link href={`/movies/${slug}`} className="group block relative rounded-lg overflow-hidden bg-surface transition-apple hover:scale-[1.02] shadow-sm hover:shadow-xl border border-white/5">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Placeholder gradient for missing images */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface-overlay z-0" />
        
        {/* Actual Image if we had one - hiding text alt for visual cleanliness on error */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover z-10 transition-apple group-hover:scale-110 duration-slow"
          />
        )}
        
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent z-20 opacity-90 group-hover:opacity-100 transition-apple duration-slow" />

        {/* Hover Action (Play Button) */}
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-apple duration-slow transform scale-95 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-md flex items-center justify-center shadow-2xl">
            <Play className="w-5 h-5 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Top Left Genre Pill */}
        <div className="absolute top-3 left-3 z-30 opacity-0 group-hover:opacity-100 transition-apple duration-fast transform -translate-y-1 group-hover:translate-y-0">
          <Badge variant="glass" className="text-[10px] px-2.5 py-0.5 rounded-sm bg-background/50 backdrop-blur-md border-white/10">
            {primaryGenre}
          </Badge>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-30 flex flex-col justify-end transform translate-y-1 group-hover:translate-y-0 transition-apple duration-slow">
          <h4 className="text-foreground font-semibold text-base leading-tight mb-1 line-clamp-1">{title}</h4>
          <p className="text-muted text-xs line-clamp-2 opacity-0 group-hover:opacity-100 transition-apple duration-slow delay-75">{description}</p>
        </div>
      </div>
    </Link>
  );
}
