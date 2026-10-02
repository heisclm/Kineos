/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any image host for the MVP mock data (TMDB, Unsplash, Supabase, Cloudflare R2)
      },
    ],
  },
};

export default nextConfig;
