import { DownloadSourceButton, DownloadSource } from "./DownloadSourceButton";
import { Download } from "lucide-react";

export function DownloadSourceList({ sources }: { sources: DownloadSource[] }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-8 border border-white/5 bg-surface rounded-2xl">
        <p className="text-muted text-sm font-medium">No download sources available.</p>
      </div>
    );
  }

  // Sort sources: R2 first, then Direct, then Magnet (or by sortOrder if available)
  const sortedSources = [...sources].sort((a, b) => {
    const order = { CLOUDFLARE_R2: 1, DIRECT_URL: 2, TORRENT_MAGNET: 3 };
    return order[a.sourceType] - order[b.sourceType];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Download className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Downloads</h3>
      </div>
      <div className="flex flex-col gap-3">
        {sortedSources.map((source) => (
          <DownloadSourceButton key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}
