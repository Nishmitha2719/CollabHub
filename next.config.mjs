/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ['react-icons', 'framer-motion'],
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
};

export default nextConfig;
