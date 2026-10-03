import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    default: "Kineos | Premium Movies & TV Shows",
    template: "%s | Kineos",
  },
  description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
  openGraph: {
    title: "Kineos | Premium Movies & TV Shows",
    description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
    url: "https://www.kineos.fun",
    siteName: "Kineos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kineos | Premium Movies & TV Shows",
    description: "Discover, download, and stream your favorite premium movies and TV series in top quality. The ultimate destination for endless entertainment.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun'),
  verification: {
    google: 'neoQUkKOyHuDcE5ICC7fngunc7PhITml45oGaqSaJZI',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        
      </head>
      <body className={`font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white overflow-x-hidden`}>
        <NextTopLoader color="#3b82f6" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
        {children}
        <Toaster theme="dark" position="top-right" />
        
      </body>
    </html>
  );
}

