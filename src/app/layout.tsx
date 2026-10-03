import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";

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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456" crossOrigin="anonymous"></script>
      </head>
      <body className={`font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white overflow-x-hidden`}>
        {children}
        <Toaster theme="dark" position="top-right" />
        
      </body>
    </html>
  );
}
