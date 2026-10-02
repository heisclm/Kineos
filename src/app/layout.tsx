import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kineos | Premium Movie & TV Series Discovery",
  description: "Discover, track, and download your favorite movies and TV series.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
