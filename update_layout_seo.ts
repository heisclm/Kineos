import fs from 'fs';

const target = 'src/app/layout.tsx';
let content = fs.readFileSync(target, 'utf8');

const metadataRegex = /export const metadata: Metadata = \{[\s\S]*?\};/;
const newMetadata = `export const metadata: Metadata = {
  title: {
    default: "Kineos | Premium Movies & TV Shows",
    template: "%s | Kineos",
  },
  description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
  openGraph: {
    title: "Kineos | Premium Movies & TV Shows",
    description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
    url: "https://kineos.com",
    siteName: "Kineos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kineos | Premium Movies & TV Shows",
    description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kineos.com'),
};`;

content = content.replace(metadataRegex, newMetadata);
fs.writeFileSync(target, content);
console.log("Updated global layout metadata");
