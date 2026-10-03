import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Kineos | Movies & TV Shows",
  description: "Your ultimate destination for movies and TV shows.",
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

