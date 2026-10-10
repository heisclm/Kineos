/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any image host (TMDB, Supabase, Cloudflare R2)
      },
    ],
  },
};

export default nextConfig;
