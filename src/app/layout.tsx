import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: {
    default: "Kineos | Movies & TV Shows",
    template: "%s | Kineos",
  },
  description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
  openGraph: {
    title: "Kineos | Movies & TV Shows",
    description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.kineos.fun",
    siteName: "Kineos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kineos | Movies & TV Shows",
    description: "Explore movie and TV series details, cast, storylines, release information, and available sources on Kineos.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kineos.fun'),
    icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'neoQUkKOyHuDcE5ICC7fngunc7PhITml45oGaqSaJZI',
    other: {
      monetag: 'ab489e3f2957ab60760b112e95b2e0bd',
    },
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
        <meta name="monetag" content="ab489e3f2957ab60760b112e95b2e0bd" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-96.png" sizes="96x96" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className={`font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white overflow-x-hidden`}>
        <NextTopLoader color="#3b82f6" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" />
        {children}
        <Toaster theme="dark" position="top-right" />
        
      </body>
    </html>
  );
}

