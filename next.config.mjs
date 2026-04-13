/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Cloudflare with Next.js 15 needs some specific settings usually, 
  // but for now we focus on basic SSR compatibility.
};

export default nextConfig;
